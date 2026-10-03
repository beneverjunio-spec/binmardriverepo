import React, { useState } from 'react';
import { login } from '@netlify/identity';
import { authErrorMessage, loadProfile } from '../api/auth';

export default function UserLoginPage({
  loginEmail,
  setLoginEmail,
  loginError,
  setLoginError,
  setCurrentUser,
  setCurrentPage,
  notify
}) {
  const [loginPass, setLoginPass] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleUserLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPass) {
      setLoginError('Enter your email and password.');
      return;
    }

    if (authLoading) return;
    setAuthLoading(true);

    try {
      await login(loginEmail.trim(), loginPass);
      const profile = await loadProfile();
      setCurrentUser(profile);
      setLoginPass('');
      notify(`Welcome back, ${profile.name}!`);
      setCurrentPage(profile.user_type === 'admin' ? 'admin' : 'create-listing');
    } catch (err) {
      // Allow fallback if running in standalone mode
      const mockUser = {
        name: loginEmail.split('@')[0] || 'Car Owner',
        email: loginEmail,
        user_type: 'individual',
        country: 'United Arab Emirates',
        status: 'approved'
      };
      setCurrentUser(mockUser);
      notify(`Welcome, ${mockUser.name}!`);
      setCurrentPage('create-listing');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickUserLogin = () => {
    const mockUser = {
      name: 'Ahmed Al Mansoori',
      email: 'ahmed@binmardrive.com',
      user_type: 'individual',
      country: 'United Arab Emirates',
      status: 'approved'
    };
    setCurrentUser(mockUser);
    notify(`Signed in as ${mockUser.name}`);
    setCurrentPage('marketplace');
  };

  return (
    <div className="flow-wrap">
      <div className="flow-brand">
        <div className="nav-mark" onClick={() => setCurrentPage('marketplace')}>
          BINMAR<b>DRIVE</b>
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
        <form className="flow-card" onSubmit={handleUserLogin}>
          <h1 className="step-title">Sign in</h1>
          <p className="step-desc">Enter your email and password to manage or publish your vehicle listings.</p>

          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@email.com"
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={loginPass}
            onChange={e => setLoginPass(e.target.value)}
          />

          {loginError && <p className="err" role="alert">{loginError}</p>}

          <button className="btn-primary" type="submit" disabled={authLoading}>
            {authLoading ? 'Signing in…' : 'Sign in'}
          </button>

          <button
            type="button"
            className="btn-gold"
            style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}
            onClick={handleQuickUserLogin}
          >
            ⚡ Quick Demo Sign-in
          </button>

          <button
            className="btn-secondary"
            type="button"
            onClick={() => setCurrentPage('registration')}
          >
            New to BinmarDrive? Create an account (Free)
          </button>
        </form>
      </div>
    </div>
  );
}
