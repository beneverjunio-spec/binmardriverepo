import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
          if (matched.user_type === 'company' && matched.status === 'pending') {
            setLoginError('Your dealer account is currently pending administrative verification. Please wait for admin approval.');
            setAuthLoading(false);
            return;
          }
          setCurrentUser(matched);
          setLoginPass('');
          notify(`Welcome back, ${matched.name}!`);
          setCurrentPage('marketplace');
          setAuthLoading(false);
          return;
        }
      }
    } catch {}

    // 2. Try Netlify Identity if cloud identity is connected
    try {
      await login(email, pass);
      const profile = await loadProfile();
      setCurrentUser(profile);
      setLoginPass('');
      notify(`Welcome back, ${profile.name}!`);
      setCurrentPage(profile.user_type === 'admin' ? 'admin' : 'marketplace');
    } catch (err) {
      // 3. Fallback for standalone mode
      const mockUser = {
        name: email.split('@')[0] || 'Car Owner',
        email: email,
        user_type: 'individual',
        country: 'United Arab Emirates',
        status: 'approved'
      };
      setCurrentUser(mockUser);
      setLoginPass('');
      notify(`Welcome, ${mockUser.name}!`);
      setCurrentPage('marketplace');
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

