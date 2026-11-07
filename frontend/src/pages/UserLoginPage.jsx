import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '@netlify/identity';
import { authErrorMessage, loadProfile } from '../api/auth';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

export default function UserLoginPage({
  loginEmail,
  setLoginEmail,
  loginError,
  setLoginError,
  setCurrentUser,
  setCurrentPage,
  notify
}) {
  const { t, isRTL } = useLanguage();
  const [loginPass, setLoginPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const handleUserLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    const email = loginEmail.trim().toLowerCase();
    const pass = loginPass.trim();

    if (!email || !pass) {
      setLoginError('Enter your email and password.');
      return;
    }

    if (authLoading) return;
    setAuthLoading(true);

    // 0. Primary: Authenticate with Online Backend Database (MongoDB & Central Server Store)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await response.json();
      if (response.ok && data.success && data.user) {
        const u = data.user;
        if (u.user_type === 'admin') {
          setCurrentUser(u);
          setLoginPass('');
          notify(`Welcome back, ${u.name}!`);
          setCurrentPage('admin');
          setAuthLoading(false);
          return;
        }

        const isVerified = u.status === 'approved' || u.status === 'verified' || Boolean(u.is_verified_seller);
        if (!isVerified) {
          if (u.status === 'pending') {
            setLoginError('Your seller account is currently pending administrative verification. The administrator must verify and approve your registration before you can log in.');
          } else if (u.status === 'rejected') {
            setLoginError('Your seller registration was rejected by the administrator.');
          } else {
            setLoginError('Seller Studio access is reserved for verified sellers only. Please wait for administrative approval.');
          }
          setAuthLoading(false);
          return;
        }

        setCurrentUser(u);
        setLoginPass('');
        notify(`Welcome back, ${u.name}!`);
        setCurrentPage('seller');
        setAuthLoading(false);
        return;
      } else if (!response.ok && data.error) {
        // If account is not found on backend API, check local custom admins before failing
        let adminsList = [];
        try {
          const rawAdmins = localStorage.getItem('binmar_custom_admins');
          if (rawAdmins) adminsList = JSON.parse(rawAdmins);
        } catch {}
        const isKnownAdmin = adminsList.some(a => a.email && a.email.toLowerCase() === email) ||
          ['info@binmargroup.com', 'admin@binmardrive.com', 'beneverjunio@gmail.com'].includes(email);

        if (!isKnownAdmin) {
          setLoginError(data.error);
          setAuthLoading(false);
          return;
        }
      }
    } catch (apiErr) {
      console.warn('API login offline, falling back to local credentials:', apiErr.message);
    }

    // 1. Fallback: Check administrator credentials (admin@binmardrive.com and custom staff)
    try {
      let adminsList = [];
      const rawAdmins = localStorage.getItem('binmar_custom_admins');
      if (rawAdmins) {
        const parsed = JSON.parse(rawAdmins);
        if (Array.isArray(parsed)) adminsList = parsed;
      }

      const foundAdmin = adminsList.find(a => a.email && a.email.toLowerCase() === email);
      if (foundAdmin) {
        const isPassValid = foundAdmin.password ? foundAdmin.password === pass : (pass === 'admin123' || pass === 'admin1234');
        if (!isPassValid) {
          setLoginError('Invalid password for administrator account.');
          setAuthLoading(false);
          return;
        }
        const staffUser = {
          name: foundAdmin.name || 'Administrator',
          email: foundAdmin.email,
          user_type: 'admin',
          role: foundAdmin.role || 'Super Admin',
          country: foundAdmin.country || 'United Arab Emirates'
        };
        setCurrentUser(staffUser);
        setLoginPass('');
        notify(`Welcome to Admin Operations Portal, ${staffUser.name}!`);
        setCurrentPage('admin');
        setAuthLoading(false);
        return;
      }

      // Default Super Admin credentials (strict password match: admin123 or admin1234)
      const defaultAdmins = {
        'info@binmargroup.com': 'Binmar Group Admin',
        'admin@binmardrive.com': 'Operations Director',
        'beneverjunio@gmail.com': 'Benever Junio'
      };

      if (defaultAdmins[email] && (pass === 'admin123' || pass === 'admin1234')) {
        const staffUser = {
          name: defaultAdmins[email],
          email: email,
          user_type: 'admin',
          role: 'Super Admin',
          country: 'United Arab Emirates'
        };
        setCurrentUser(staffUser);
        setLoginPass('');
        notify(`Welcome to Admin Operations Portal, ${staffUser.name}!`);
        setCurrentPage('admin');
        setAuthLoading(false);
        return;
      }
    } catch {}

    // 1. Check local registered users first
    try {
      const rawUsers = localStorage.getItem('binmar_custom_users');
      if (rawUsers) {
        const users = JSON.parse(rawUsers);
        const matched = users.find(u => u.email.toLowerCase() === email);
        if (matched) {
          if (matched.password && matched.password !== pass) {
            setLoginError('Invalid password. Please check and try again.');
            setAuthLoading(false);
            return;
          }

          // Check if registration was approved by admin
          try {
            const rawDealers = localStorage.getItem('binmar_custom_dealers');
            if (rawDealers) {
              const dealers = JSON.parse(rawDealers);
              const dMatch = dealers.find(d =>
                (d.email && d.email.toLowerCase() === email) ||
                (d.company_name && matched.company_name && d.company_name.toLowerCase() === matched.company_name.toLowerCase()) ||
                (d.name && matched.name && d.name.toLowerCase() === matched.name.toLowerCase())
              );
              if (dMatch) {
                if (dMatch.status === 'verified' || dMatch.status === 'approved') {
                  matched.status = 'approved';
                  matched.is_verified_seller = true;
                } else if (dMatch.status === 'rejected') {
                  matched.status = 'rejected';
                }
                users.forEach(u => {
                  if (u.email.toLowerCase() === email) {
                    u.status = matched.status;
                    u.is_verified_seller = matched.is_verified_seller;
                  }
                });
                localStorage.setItem('binmar_custom_users', JSON.stringify(users));
              }
            }
          } catch {}

          if (matched.status === 'rejected') {
            setLoginError('Your registration was rejected by the administrator.');
            setAuthLoading(false);
            return;
          }

          if (matched.status === 'pending') {
            setLoginError('Your account is currently pending administrative verification. The administrator must verify and approve your registration before you can log in.');
            setAuthLoading(false);
            return;
          }

          const isVerified = matched.status === 'approved' || matched.status === 'verified' || Boolean(matched.is_verified_seller);
          if (!isVerified) {
            setLoginError('Seller Studio access is reserved for verified sellers only. Please wait for account verification.');
            setAuthLoading(false);
            return;
          }

          setCurrentUser(matched);
          setLoginPass('');
          notify(`Welcome back, ${matched.name}!`);
          setCurrentPage('seller');
          setAuthLoading(false);
          return;
        }
      }
    } catch {}

    // 2. Try Netlify Identity if cloud identity is connected
    try {
      await login(email, pass);
      const profile = await loadProfile();
      if (profile.status === 'pending') {
        setLoginError('Your account is currently pending administrative verification in the Admin Portal.');
        setAuthLoading(false);
        return;
      }
      if (profile.status === 'rejected') {
        setLoginError('Your registration was rejected by the administrator.');
        setAuthLoading(false);
        return;
      }
      const isVerified = profile.status === 'approved' || profile.status === 'verified' || Boolean(profile.is_verified_seller);
      if (!isVerified && profile.user_type !== 'admin') {
        setLoginError('Seller Studio access is reserved for verified sellers only. Please wait for account verification.');
        setAuthLoading(false);
        return;
      }
      setCurrentUser(profile);
      setLoginPass('');
      notify(`Welcome back, ${profile.name}!`);
      setCurrentPage(profile.user_type === 'admin' ? 'admin' : 'seller');
    } catch (err) {
      setLoginError(authErrorMessage(err) || 'Account not found. Please register as a verified seller first.');
    } finally {
      setAuthLoading(false);
    }
  };



  return (
    <div className="flow-wrap">
      <div className="flow-brand">
        <div className="nav-mark" onClick={() => setCurrentPage('marketplace')}>
          <img src="/binmardrive-logo-transparent.png" alt="Binmar Drive Logo" className="brand-logo-img" />
          <span>BINMAR<b>DRIVE</b></span>
        </div>
        <div>
          <div className="flow-hero">Welcome back to <em>Binmar Drive</em>.</div>
          <p className="flow-sub">
            Sign in to post a listing, manage your vehicles, or connect with interested buyers.
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
        <form className="flow-card" onSubmit={handleUserLogin}>
          <h1 className="step-title">{t('seller_sign_in_title')}</h1>
          <p className="step-desc">{t('seller_sign_in_sub')}</p>

          <label htmlFor="login-email">{t('seller_email')}</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@email.com"
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
          />

          <label htmlFor="login-password">{t('seller_password')}</label>
          <div className="password-input-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {loginError && <p className="err" role="alert">{loginError}</p>}

          <button className="btn-primary" type="submit" disabled={authLoading}>
            {authLoading ? t('seller_signing_in') : t('seller_login_btn')}
          </button>

          <button
            className="btn-secondary"
            type="button"
            onClick={() => setCurrentPage('registration')}
          >
            {t('seller_register_free')}
          </button>
        </form>
      </div>
    </div>
  );
}

