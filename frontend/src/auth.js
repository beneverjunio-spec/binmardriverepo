import { AuthError, MissingIdentityError, getUser } from '@netlify/identity';

export function authErrorMessage(error) {
  if (error instanceof MissingIdentityError || error?.status === 404) {
    return 'Sign-in is not available yet. Netlify Identity must be enabled for this site.';
  }
  if (error instanceof AuthError) {
    if (/confirm/i.test(error.message)) return 'Confirm your email using the link in your inbox before signing in.';
    if (error.status === 400 || error.status === 401) return 'Invalid email or password. Please try again.';
    if (error.status === 403) return 'This account cannot sign in. Contact the site administrator.';
    if (error.status === 422) return 'Check your email and password. The account may already exist.';
    return 'Unable to reach the sign-in service. Please try again.';
  }
  return error instanceof Error ? error.message : 'Unable to sign in. Please try again.';
}

export async function apiRequest(path, options = {}) {
  if (path !== '/api/listings' || options.method) await getUser();
  const response = await fetch(path, { credentials: 'same-origin', ...options });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('The API is unavailable. Please try again after the site deployment completes.');
  }
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'The request failed. Please try again.');
  return data;
}

export async function loadProfile() {
  const data = await apiRequest('/api/auth/me');
  return data.user;
}

export async function grantAdminAccess(email, password) {
  const response = await fetch('/api/admin/access', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : {};
  if (!response.ok || !data.success) throw new Error(data.error || 'Unable to sign in. Please try again.');
}
