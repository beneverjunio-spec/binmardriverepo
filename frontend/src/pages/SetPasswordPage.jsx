import React, { useState } from 'react';
import { acceptInvite, updateUser } from '@netlify/identity';
import { authErrorMessage, loadProfile } from '../api/auth';

export default function SetPasswordPage({
  passwordCallback,
  setPasswordCallback,
  setCurrentUser,
  setCurrentPage,
  notify
}) {
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleSetPassword = async (e) => {
    if (e) e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('Use a password of at least 8 characters.');
      return;
    }

    if (authLoading) return;
    setAuthLoading(true);

    try {
      if (passwordCallback?.type === 'invite') {
        await acceptInvite(passwordCallback.token, newPassword);
      } else {
        await updateUser({ password: newPassword });
      }

      const profile = await loadProfile();
      setCurrentUser(profile);
      setNewPassword('');
      setPasswordCallback(null);
      setCurrentPage(profile.user_type === 'admin' ? 'admin' : 'marketplace');
      notify('Your password is set.');
    } catch (error) {
      setPasswordError(authErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="flow-wrap">
      <div className="flow-brand">
        <div className="nav-mark">BINMAR<b>DRIVE</b></div>
        <div className="flow-hero">Secure your <em>account</em>.</div>
      </div>
      <div className="flow-formside">
        <form className="flow-card" onSubmit={handleSetPassword}>
          <h1 className="step-title">Set your password</h1>
          <p className="step-desc">Choose a password of at least 8 characters to finish setting up your account.</p>

          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />

          {passwordError && <p className="err" role="alert">{passwordError}</p>}

          <button type="submit" className="btn-primary" disabled={authLoading}>
            {authLoading ? 'Saving…' : 'Save password'}
          </button>
        </form>
      </div>
    </div>
  );
}
