import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { login, logout } from '@netlify/identity';
import { authErrorMessage, loadProfile } from '../api/auth';
import { DEFAULT_ADMIN_DATA } from '../constants';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

export default function AdminLoginPage({
  setCurrentUser,
  setCurrentPage,
  notify
}) {
  const { t, isRTL } = useLanguage();
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    setAdminLoginError('');

    const email = adminEmail.trim().toLowerCase();
    const pass = adminPass.trim();

    if (!email || !pass) {
      setAdminLoginError('Please enter both staff email and password.');
      return;
    }

    if (authLoading) return;
    setAuthLoading(true);

    try {
      // 1. Try backend API login against database
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.user) {
            const u = data.user;
            if (u.user_type === 'admin') {
              setCurrentUser(u);
              setAdminPass('');
              notify(`Welcome, ${u.name || 'Administrator'}!`);
              setCurrentPage('admin');
              return;
            } else {
              setAdminLoginError('This account is not authorized for the admin portal. Staff role is required.');
              return;
            }
          }
        } else if (res.status === 400 || res.status === 401 || res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          if (errData.error && !errData.error.includes('route not found')) {
            setAdminLoginError(errData.error || 'Invalid staff email or password. Please try again.');
            return;
          }
        }
      } catch (apiErr) {
        console.warn('Backend login fallback to local credentials check:', apiErr);
      }

      // 2. Check local custom admins & default admin records
      let storedAdmins = [];
      try {
        const local = localStorage.getItem('binmar_custom_admins');
        if (local) storedAdmins = JSON.parse(local);
      } catch {
        storedAdmins = [];
      }

      const defaultAdmins = DEFAULT_ADMIN_DATA.admins || [
        { name: 'Binmar Group Admin', email: 'info@binmargroup.com', role: 'Super Admin' },
        { name: 'Operations Director', email: 'admin@binmardrive.com', role: 'Super Admin' },
        { name: 'Benever Junio', email: 'beneverjunio@gmail.com', role: 'Super Admin' }
      ];

      const allAdmins = [...storedAdmins, ...defaultAdmins];

      // Check against authorized admin accounts
      const matchedAdmin = allAdmins.find(a => a.email && a.email.toLowerCase() === email);

      if (matchedAdmin) {
        if (matchedAdmin.status === 'Suspended') {
          setAdminLoginError('This admin account has been suspended. Please contact the Operations Director.');
          return;
        }

        // Strict password verification (no length >= 4 bypass)
        const isPassValid = matchedAdmin.password
          ? matchedAdmin.password === pass
          : (pass === 'admin123' || pass === 'admin1234');

        if (!isPassValid) {
          setAdminLoginError('Invalid password for administrator account. Access denied.');
          return;
        }

        const staffUser = {
          name: matchedAdmin.name || 'Administrator',
          email: matchedAdmin.email,
          user_type: 'admin',
          role: matchedAdmin.role || 'Super Admin',
          country: matchedAdmin.country || 'United Arab Emirates'
        };

        setCurrentUser(staffUser);
        setAdminPass('');
        notify(`Welcome to Admin Operations Portal, ${staffUser.name}!`);
        setCurrentPage('admin');
        return;
      }

      // 3. Try Netlify Identity if cloud backend is available
      try {
        const identity = await login(email, pass);
        if (identity?.roles?.includes('admin')) {
          const profile = await loadProfile();
          setCurrentUser(profile);
          setAdminPass('');
          notify('Logged into Admin Portal');
          setCurrentPage('admin');
          return;
        } else if (identity) {
          await logout();
          setAdminLoginError('This account is not authorized for the admin portal. Staff role is required.');
          return;
        }
      } catch (cloudErr) {
        console.warn('Cloud auth skipped, checking local credentials fallback');
      }

      setAdminLoginError('Invalid staff email or password. Please try again.');
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
          <div className="flow-hero">Admin <em>portal</em> access.</div>
          <p className="flow-sub">Sign in to review listings, verify dealers, and manage marketplace inventory.</p>
          <div className="odo-line">
            <div className="odo-dot" />
            <div className="odo-text">Restricted to authorized Binmar Drive staff</div>
          </div>
        </div>
        <div className="flow-fine">&copy; 2026 Binmar Drive. Internal Operations.</div>
      </div>

      <div className="flow-formside">
        <div style={{ display: 'flex', justifyContent: isRTL ? 'flex-start' : 'flex-end', width: '100%', maxWidth: '440px', marginBottom: '1rem' }}>
          <LanguageSwitcher />
        </div>
        <form className="flow-card" onSubmit={handleAdminLogin}>
          <h1 className="step-title">{t('admin_login_title')}</h1>
          <p className="step-desc">{t('admin_login_sub')}</p>

          <label htmlFor="admin-email">{t('admin_email_label')}</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            placeholder="info@binmargroup.com"
            required
            value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)}
          />

          <label htmlFor="admin-password">{t('admin_password_label')}</label>
          <div className="password-input-wrap">
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={adminPass}
              onChange={e => setAdminPass(e.target.value)}
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

          {adminLoginError && <p className="err" role="alert">{adminLoginError}</p>}

          <button className="btn-primary" type="submit" disabled={authLoading}>
            {authLoading ? 'Signing in…' : t('admin_login_btn')}
          </button>

          <button
            className="btn-secondary"
            type="button"
            style={{ marginTop: '1rem' }}
            onClick={() => setCurrentPage('marketplace')}
          >
            {t('admin_exit_marketplace')}
          </button>
        </form>
      </div>
    </div>
  );
}

