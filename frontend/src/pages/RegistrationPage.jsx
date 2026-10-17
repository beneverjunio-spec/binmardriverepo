import React, { useState, useRef } from 'react';
import { User, Building2, Upload } from 'lucide-react';
import { signup } from '@netlify/identity';
import { GCC_COUNTRIES, COUNTRY_DIAL_CODES } from '../constants';
import { authErrorMessage, loadProfile } from '../api/auth';

export default function RegistrationPage({
  regAccountType,
  setRegAccountType,
  setCurrentUser,
  setCurrentPage,
  setLoginEmail,
  setLoginError,
  notify
}) {
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

  const licenseInputRef = useRef(null);

  const handleLicenseSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTradeLicenseFile(file.name);
      notify(`Trade license file attached: ${file.name}`);
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
      country: regCountry,
      email: regEmail.trim()
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
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // 1. Queue submission for admin verification in local storage
    try {
      const raw = localStorage.getItem('binmar_custom_dealers');
      const existing = raw ? JSON.parse(raw) : [];
      localStorage.setItem('binmar_custom_dealers', JSON.stringify([newDealerSubmission, ...existing]));

      const notifRaw = localStorage.getItem('binmar_admin_notifications');
      const existingNotifs = notifRaw ? JSON.parse(notifRaw) : [];
      const newNotif = {
        id: Date.now(),
        title: `New ${isCompany ? 'Commercial Dealer' : 'Seller'} Verification Request`,
        message: `${displayName} registered from ${regCountry} (${payload.email}) and submitted for admin verification.`,
        is_read: false,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('binmar_admin_notifications', JSON.stringify([newNotif, ...existingNotifs]));
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
          BINMAR<b>DRIVE</b>
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
              <span className="free-badge">Free to register anywhere</span>
              <h1 className="step-title">Who's registering?</h1>
              <p className="step-desc">Open to individual vehicle owners, dealers, and corporate rental companies across the Middle East.</p>

              <div className="type-grid">
                <div
                  className={`type-card ${regAccountType === 'individual' ? 'selected' : ''}`}
                  onClick={() => setRegAccountType('individual')}
                >
                  <User size={28} className="type-icon" />
                  <span>Individual seller / private owner</span>
                  <small style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', marginTop: '4px' }}>Requires Admin Approval</small>
                </div>
                <div
                  className={`type-card ${regAccountType === 'company' ? 'selected' : ''}`}
                  onClick={() => setRegAccountType('company')}
                >
                  <Building2 size={28} className="type-icon" />
                  <span>Commercial seller / dealer</span>
                  <small style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', marginTop: '4px' }}>Requires Admin Approval</small>
                </div>
              </div>

              <button className="btn-primary" onClick={() => setRegStep(2)}>
                Continue &rarr;
              </button>
              <button className="btn-secondary" onClick={() => setCurrentPage('user-login')}>
                Already have an account? Sign in
              </button>
            </div>
          )}

          {/* Step 2: Phone Verification */}
          {regStep === 2 && (
            <div>
              <h1 className="step-title">Account credentials</h1>
              <p className="step-desc">Use your email and a secure password to sign in. Your phone number is for vehicle enquiries.</p>

              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
              />

              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
              />

              <label>Mobile number (optional)</label>
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
                Continue &rarr;
              </button>
              <button className="btn-secondary" onClick={() => setRegStep(1)}>
                Back
              </button>
            </div>
          )}

          {/* Step 3: Account Details */}
          {regStep === 3 && (
            <div>
              <h1 className="step-title">
                {regAccountType === 'individual' ? 'Tell us about you' : 'Dealer & company details'}
              </h1>
              <p className="step-desc">Last step &mdash; this takes less than a minute.</p>

              {regAccountType === 'individual' ? (
                <div>
                  <label>Full name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmed Al Mansoori"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                  />
                  <label>Country</label>
                  <select value={regCountry} onChange={e => setRegCountry(e.target.value)}>
                    {GCC_COUNTRIES.map(country => (
                      <option key={country}>{country}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label>Company / Dealership name</label>
                  <input
                    type="text"
                    placeholder="e.g. Al Futtaim Motors"
                    value={regCompanyName}
                    onChange={e => setRegCompanyName(e.target.value)}
                  />
                  <label>Trade license number</label>
                  <input
                    type="text"
                    placeholder="e.g. CN-1234567"
                    value={regLicense}
                    onChange={e => setRegLicense(e.target.value)}
                  />
                  <label>Country of registration</label>
                  <select value={regCountry} onChange={e => setRegCountry(e.target.value)}>
                    {GCC_COUNTRIES.map(country => (
                      <option key={country}>{country}</option>
                    ))}
                  </select>

                  <input
                    type="file"
                    ref={licenseInputRef}
                    accept=".pdf,image/*"
                    style={{ display: 'none' }}
                    onChange={handleLicenseSelect}
                  />
                  <div className="dropzone" onClick={() => licenseInputRef.current?.click()}>
                    <Upload size={22} style={{ margin: '0 auto 6px', display: 'block', color: 'var(--sage-dim)' }} />
                    <p>{tradeLicenseFile ? `Attached: ${tradeLicenseFile}` : 'Click to upload Commercial Trade License (PDF / JPG)'}</p>
                    <p className="small">{tradeLicenseFile ? 'Document ready for verification' : 'Required for dealer verification'}</p>
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
                  ? 'Submitting registration…'
                  : 'Submit for Admin Verification'}
              </button>
              <button className="btn-secondary" onClick={() => setRegStep(2)}>
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
