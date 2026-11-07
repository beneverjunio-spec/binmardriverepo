import React, { useState, useRef } from 'react';
import { User, Building2, Upload } from 'lucide-react';
import { signup, logout } from '@netlify/identity';
import { GCC_COUNTRIES, COUNTRY_DIAL_CODES } from '../constants';
import { authErrorMessage, loadProfile } from '../api/auth';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

export default function RegistrationPage({
  regAccountType,
  setRegAccountType,
  setCurrentUser,
  setCurrentPage,
  setLoginEmail,
  setLoginError,
  notify
}) {
  const { t, isRTL } = useLanguage();
  const [regStep, setRegStep] = useState(1);
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regCountry, setRegCountry] = useState('United Arab Emirates');
  const [regError, setRegError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [tradeLicenseFile, setTradeLicenseFile] = useState(null);
  const [tradeLicenseUrl, setTradeLicenseUrl] = useState(null);

  const licenseInputRef = useRef(null);

  const handleLicenseSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTradeLicenseFile(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setTradeLicenseUrl(event.target.result);
      };
      reader.readAsDataURL(file);
      notify(`Verification document attached: ${file.name}`);
    }
  };

  const handleUserRegister = async () => {
    setRegError('');
    if (regAccountType === 'individual' && !regName) {
      setRegError('Please enter your full name');
      return;
    }
    if (regAccountType === 'company' && !regCompanyName) {
      setRegError('Please enter your company name');
      return;
    }
    if (!regEmail.trim() || regPassword.length < 8) {
      setRegError('Enter your email and a password of at least 8 characters.');
      return;
    }
    if (authLoading) return;
    setAuthLoading(true);

    const isCompany = regAccountType === 'company';
    const displayName = isCompany ? regCompanyName : regName;
    const companyName = isCompany ? regCompanyName : `${regName} (Private Seller)`;
    const tradeLicense = isCompany
      ? (regLicense || 'CN-' + Math.floor(1000000 + Math.random() * 9000000))
      : (regLicense || 'ID-' + Math.floor(1000000 + Math.random() * 9000000));
    const tradeDoc = tradeLicenseFile || (isCompany ? 'Trade_License_Document.pdf' : 'National_ID_Passport.pdf');

    const payload = {
      user_type: regAccountType,
      name: displayName,
      phone: regPhone,
      company_name: companyName,
      trade_license: tradeLicense,
      trade_license_file: tradeDoc,
      trade_license_url: tradeLicenseUrl || null,
      country: regCountry,
      email: regEmail.trim(),
      password: regPassword,
      status: 'pending'
    };

    const newDealerSubmission = {
      id: Date.now(),
      name: displayName,
      company_name: companyName,
      email: regEmail.trim(),
      phone: regPhone,
      country: regCountry,
      user_type: regAccountType,
      trade_license: tradeLicense,
      trade_license_file: tradeDoc,
      trade_license_url: tradeLicenseUrl || null,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // 1. Queue submission for admin verification in local storage
    try {
      const raw = localStorage.getItem('binmar_custom_dealers');
      const existing = raw ? JSON.parse(raw) : [];
      const filteredExisting = existing.filter(d => !d.email || d.email.toLowerCase() !== newDealerSubmission.email.toLowerCase());
      localStorage.setItem('binmar_custom_dealers', JSON.stringify([newDealerSubmission, ...filteredExisting]));

      // Clear any prior resolution for this ID/email so the new application is fresh in queue
      try {
        const rawRes = localStorage.getItem('binmar_resolved_dealers');
        if (rawRes) {
          const resolved = JSON.parse(rawRes);
          const updatedResolved = resolved.filter(id => String(id) !== String(newDealerSubmission.id));
          localStorage.setItem('binmar_resolved_dealers', JSON.stringify(updatedResolved));
        }
      } catch {}

      const notifRaw = localStorage.getItem('binmar_admin_notifications');
      const existingNotifs = notifRaw ? JSON.parse(notifRaw) : [];
      const newNotif = {
        id: Date.now(),
        title: `New ${isCompany ? 'Commercial Dealer' : 'Seller'} Verification Request`,
        message: `${displayName} registered from ${regCountry} (${payload.email}) and submitted for admin verification.`,
        recipient: 'info@binmargroup.com',
        action_tab: 'dealers',
        type: 'dealer_verification',
        is_read: false,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('binmar_admin_notifications', JSON.stringify([newNotif, ...existingNotifs]));

      // Dispatch storage event so any active admin tab syncs in real time
      try {
        window.dispatchEvent(new Event('storage'));
      } catch {}
    } catch (e) {
      console.warn('Could not store dealer submission locally', e);
    }

    const newUser = {
      id: newDealerSubmission.id,
      name: displayName,
      email: regEmail.trim(),
      password: regPassword,
      user_type: regAccountType,
      phone: regPhone,
      company_name: companyName,
      trade_license: tradeLicense,
      country: regCountry,
      status: 'pending', // All new registrations are pending admin approval!
      is_verified_seller: false,
      created_at: new Date().toISOString()
    };

    // 2. Store in custom users list for persistent local authentication
    try {
      const rawUsers = localStorage.getItem('binmar_custom_users');
      const existingUsers = rawUsers ? JSON.parse(rawUsers) : [];
      const filtered = existingUsers.filter(u => u.email.toLowerCase() !== newUser.email.toLowerCase());
      localStorage.setItem('binmar_custom_users', JSON.stringify([newUser, ...filtered]));
    } catch (e) {
      console.warn('Could not store user locally', e);
    }

    // 3. Post to backend API so database is populated across all devices/browsers
    try {
      await fetch('/api/dealers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Could not reach backend registration API', e);
    }

    // 4. Try Netlify Identity signup if available
    try {
      await signup(regEmail.trim(), regPassword, { ...payload, full_name: displayName });
    } catch {}

    // CRITICAL: Newly registered accounts are pending verification and must NOT remain logged in!
    try {
      await logout();
    } catch {}
    if (setCurrentUser) setCurrentUser(null);
    try {
      localStorage.removeItem('binmar_current_user');
    } catch {}

    setRegPassword('');
    setLoginEmail(regEmail.trim());
    setLoginError('Your registration has been submitted to the Admin Operations Portal! Once verified and approved by the admin, you will receive full access to sign in.');
    notify('Registration sent to Admin Verification queue!');
    setCurrentPage('user-login');
    setAuthLoading(false);
  };



  return (
    <div className="flow-wrap">
      <div className="flow-brand">
        <div className="nav-mark" onClick={() => setCurrentPage('marketplace')}>
          <img src="/binmardrive-logo-transparent.png" alt="Binmar Drive Logo" className="brand-logo-img" />
          <span>BINMAR<b>DRIVE</b></span>
        </div>
        <div>
          <div className="flow-hero">List your car, <em>free to register</em> anywhere.</div>
          <p className="flow-sub">
            No listing fees for owners, dealers, or first-time sellers. For buyers and sellers across the Middle East.
          </p>
          <div className="odo-line">
            <div className="odo-dot" />
            <div className="odo-text">Free to register &mdash; no commission on sale</div>
          </div>
        </div>
        <div className="flow-fine">&copy; 2026 Binmar Drive. Built for owners, dealers and buyers across the Middle East.</div>
      </div>

      <div className="flow-formside">
        <div style={{ display: 'flex', justifyContent: isRTL ? 'flex-start' : 'flex-end', width: '100%', maxWidth: '440px', marginBottom: '1rem' }}>
          <LanguageSwitcher />
        </div>
        <div className="flow-card">
          {/* Progress Nodes */}
          <div className="steps">
            <div className={`step-node ${regStep >= 1 ? 'active' : ''} ${regStep > 1 ? 'done' : ''}`}>1</div>
            <div className="step-track"><div className="step-track-fill" style={{ width: regStep >= 2 ? '100%' : '0%' }} /></div>
            <div className={`step-node ${regStep >= 2 ? 'active' : ''} ${regStep > 2 ? 'done' : ''}`}>2</div>
            <div className="step-track"><div className="step-track-fill" style={{ width: regStep >= 3 ? '100%' : '0%' }} /></div>
            <div className={`step-node ${regStep >= 3 ? 'active' : ''}`}>3</div>
          </div>

          {/* Step 1: Who is registering */}
          {regStep === 1 && (
            <div>
              <span className="free-badge">{t('hero_badge')}</span>
              <h1 className="step-title">{t('reg_who_title')}</h1>
              <p className="step-desc">{t('reg_who_desc')}</p>

              <div className="type-grid">
                <div
                  className={`type-card ${regAccountType === 'individual' ? 'selected' : ''}`}
                  onClick={() => setRegAccountType('individual')}
                >
                  <User size={28} className="type-icon" />
                  <span>{t('reg_individual')}</span>
                  <small style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', marginTop: '4px' }}>{t('reg_individual_note')}</small>
                </div>
                <div
                  className={`type-card ${regAccountType === 'company' ? 'selected' : ''}`}
                  onClick={() => setRegAccountType('company')}
                >
                  <Building2 size={28} className="type-icon" />
                  <span>{t('reg_company')}</span>
                  <small style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', marginTop: '4px' }}>{t('reg_company_note')}</small>
                </div>
              </div>

              <button className="btn-primary" onClick={() => setRegStep(2)}>
                {t('reg_continue')}
              </button>
              <button className="btn-secondary" onClick={() => setCurrentPage('user-login')}>
                {t('reg_already_account')}
              </button>
            </div>
          )}

          {/* Step 2: Phone Verification */}
          {regStep === 2 && (
            <div>
              <h1 className="step-title">{t('reg_credentials_title')}</h1>
              <p className="step-desc">{t('reg_credentials_desc')}</p>

              <label htmlFor="register-email">{t('seller_email')}</label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
              />

              <label htmlFor="register-password">{t('seller_password')}</label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
              />

              <label>{t('reg_phone')}</label>
              <div className="row-2">
                <select defaultValue="+971">
                  {COUNTRY_DIAL_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="50 123 4567"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                />
              </div>

              {regError && <p className="err">{regError}</p>}

              <button
                className="btn-primary"
                onClick={() => {
                  if (!regEmail.trim() || regPassword.length < 8) {
                    setRegError('Enter your email and a password of at least 8 characters.');
                    return;
                  }
                  setRegError('');
                  setRegStep(3);
                }}
              >
                {t('reg_continue')}
              </button>
              <button className="btn-secondary" onClick={() => setRegStep(1)}>
                {t('reg_back')}
              </button>
            </div>
          )}

          {/* Step 3: Account Details */}
          {regStep === 3 && (
            <div>
              <h1 className="step-title">
                {regAccountType === 'individual' ? t('reg_about_you') : t('reg_dealer_details')}
              </h1>
              <p className="step-desc">{isRTL ? 'الخطوة الأخيرة — يستغرق الأمر أقل من دقيقة.' : 'Last step — this takes less than a minute.'}</p>

              {regAccountType === 'individual' ? (
                <div>
                  <label>{t('reg_full_name')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmed Al Mansoori"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                  />
                  <label>{t('label_country')}</label>
                  <select value={regCountry} onChange={e => setRegCountry(e.target.value)}>
                    {GCC_COUNTRIES.map(country => (
                      <option key={country}>{country}</option>
                    ))}
                  </select>

                  <label style={{ display: 'block', marginTop: '14px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {t('reg_id_upload_label')}
                  </label>
                  <input
                    type="file"
                    ref={licenseInputRef}
                    accept=".pdf,image/*"
                    style={{ display: 'none' }}
                    onChange={handleLicenseSelect}
                  />
                  <div className="dropzone" onClick={() => licenseInputRef.current?.click()} style={{ cursor: 'pointer', marginTop: '6px' }}>
                    <Upload size={22} style={{ margin: '0 auto 6px', display: 'block', color: 'var(--sage-dim)' }} />
                    <p>{tradeLicenseFile ? `${isRTL ? 'المرفق:' : 'Attached:'} ${tradeLicenseFile}` : t('reg_id_upload_btn')}</p>
                    <p className="small">{tradeLicenseFile ? (isRTL ? 'المستند جاهز للتحقق' : 'Document ready for verification') : (isRTL ? 'قم بتحميل الهوية للتحقق من قِبل المشرف' : 'Upload your ID or passport for admin verification')}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <label>{t('reg_company_name')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Al Futtaim Motors"
                    value={regCompanyName}
                    onChange={e => setRegCompanyName(e.target.value)}
                  />
                  <label>{t('reg_license_num')}</label>
                  <input
                    type="text"
                    placeholder="e.g. CN-1234567"
                    value={regLicense}
                    onChange={e => setRegLicense(e.target.value)}
                  />
                  <label>{t('label_country')}</label>
                  <select value={regCountry} onChange={e => setRegCountry(e.target.value)}>
                    {GCC_COUNTRIES.map(country => (
                      <option key={country}>{country}</option>
                    ))}
                  </select>

                  <label style={{ display: 'block', marginTop: '14px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {t('reg_license_upload_label')}
                  </label>
                  <input
                    type="file"
                    ref={licenseInputRef}
                    accept=".pdf,image/*"
                    style={{ display: 'none' }}
                    onChange={handleLicenseSelect}
                  />
                  <div className="dropzone" onClick={() => licenseInputRef.current?.click()} style={{ cursor: 'pointer', marginTop: '6px' }}>
                    <Upload size={22} style={{ margin: '0 auto 6px', display: 'block', color: 'var(--sage-dim)' }} />
                    <p>{tradeLicenseFile ? `${isRTL ? 'المرفق:' : 'Attached:'} ${tradeLicenseFile}` : t('reg_license_upload_btn')}</p>
                    <p className="small">{tradeLicenseFile ? (isRTL ? 'المستند جاهز للتحقق' : 'Document ready for verification') : (isRTL ? 'مطلوب للتحقق من هوية المعرض' : 'Required for dealer verification')}</p>
                  </div>
                </div>
              )}

              {regError && <p className="err">{regError}</p>}

              <button
                className="btn-primary"
                disabled={authLoading}
                onClick={handleUserRegister}
              >
                {authLoading
                  ? t('reg_submitting_btn')
                  : t('reg_submit_btn')}
              </button>
              <button className="btn-secondary" onClick={() => setRegStep(2)}>
                {t('reg_back')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
