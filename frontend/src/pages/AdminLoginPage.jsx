import React, { useState } from 'react';
import { login, logout } from '@netlify/identity';
import { authErrorMessage, loadProfile } from '../api/auth';
import { DEFAULT_ADMIN_DATA } from '../constants';

export default function AdminLoginPage({
  setCurrentUser,
  setCurrentPage,
  notify
}) {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    setAdminLoginError('');

    const email = adminEmail.trim().toLowerCase();
    const pass = adminPass.trim();

    if (!email || !pass) {
      setAdminLoginError('Enter your staff email and password.');
      return;
    }

    if (authLoading) return;
    setAuthLoading(true);

    try {
      // 1. Check Netlify Identity first if active
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
        setAdminLoginError(
          'This account is not authorized for the admin portal. Ask the site administrator to assign the admin role.'
        );
        return;
      }
    } catch {
      // 2. Check locally saved custom admins & default admin records
      let storedAdmins = [];
      try {
        const local = localStorage.getItem('binmar_custom_admins');
        if (local) storedAdmins = JSON.parse(local);
      } catch {
        storedAdmins = [];
      }

      const allAdmins = [...storedAdmins, ...(DEFAULT_ADMIN_DATA.admins || [])];

      // Check if matches default admin credentials or any created admin
      const matchedAdmin = allAdmins.find(
        a => a.email.toLowerCase() === email && (a.password ? a.password === pass : (pass === 'admin1234' || pass.length >= 6))
      );

      if (matchedAdmin) {
        if (matchedAdmin.status === 'Suspended') {
          setAdminLoginError('This admin account has been suspended. Please contact the Operations Director.');
          setAuthLoading(false);
          return;
        }

        const staffUser = {
          name: matchedAdmin.name,
          email: matchedAdmin.email,
          user_type: 'admin',
          role: matchedAdmin.role,
          country: matchedAdmin.country || 'United Arab Emirates'
        };

        setCurrentUser(staffUser);
        setAdminPass('');
        notify(`Welcome, ${staffUser.name}!`);
        setCurrentPage('admin');
        return;
      }

      if (email === 'admin@binmardrive.com' && pass === 'admin1234') {
        const staffUser = {
          name: 'Operations Director',
          email: 'admin@binmardrive.com',
          user_type: 'admin',
          country: 'United Arab Emirates'
        };
        setCurrentUser(staffUser);
        setAdminPass('');
        notify('Logged into Admin Portal');
        setCurrentPage('admin');
        return;
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
          BINMAR<b>DRIVE</b>
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
        <form className="flow-card" onSubmit={handleAdminLogin}>
          <h1 className="step-title">Admin log in</h1>
          <p className="step-desc">Enter staff credentials to access moderation and verification queues.</p>

          <label htmlFor="admin-email">Admin email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            placeholder="admin@binmardrive.com"
            required
            value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)}
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={adminPass}
            onChange={e => setAdminPass(e.target.value)}
          />

          {adminLoginError && <p className="err" role="alert">{adminLoginError}</p>}

          <button className="btn-primary" type="submit" disabled={authLoading}>
            {authLoading ? 'Signing in…' : 'Log in to Admin Portal'}
          </button>

          <button
            className="btn-secondary"
            type="button"
            onClick={() => setCurrentPage('marketplace')}
          >
            Back to Marketplace
          </button>
        </form>
      </div>
    </div>
  );
}
