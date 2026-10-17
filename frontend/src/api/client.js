import { getUser } from '@netlify/identity';

const PUBLIC_PATHS = [
  '/api/listings',
  '/api/admin/access',
  '/api/dealers/register',
  '/api/register'
];

/**
 * Common API request client with automatic session checking and error extraction.
 */
export async function apiRequest(path, options = {}) {
  const isPublic = PUBLIC_PATHS.includes(path) || (path === '/api/listings' && !options.method);
  if (!isPublic) {
    try {
      await getUser();
    } catch {}
  }

  const response = await fetch(path, { credentials: 'same-origin', ...options });

  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('The API is unavailable. Please try again after the site deployment completes.');
  }

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'The request failed. Please try again.');
  }

  return data;
}
