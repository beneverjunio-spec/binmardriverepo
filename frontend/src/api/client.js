import { getUser } from '@netlify/identity';

/**
 * Common API request client with automatic session checking and error extraction.
 */
export async function apiRequest(path, options = {}) {
  if (path !== '/api/listings' || options.method) {
    await getUser();
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
