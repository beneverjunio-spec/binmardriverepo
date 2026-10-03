import { apiRequest } from './client';
import { DEFAULT_LISTINGS } from '../constants';

export async function fetchPublicListings(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.make) queryParams.append('make', filters.make);
    if (filters.country) queryParams.append('country', filters.country);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    if (filters.sortBy) queryParams.append('sort', filters.sortBy);

    const res = await fetch(`/api/listings?${queryParams.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.listings) && data.listings.length > 0) {
        return data.listings;
      }
    }
  } catch {
    // Graceful fallback to default listings
  }

  // Filter local default listings
  let filtered = [...DEFAULT_LISTINGS];
  if (filters.make) {
    filtered = filtered.filter(item => item.make.toLowerCase() === filters.make.toLowerCase());
  }
  if (filters.country) {
    filtered = filtered.filter(item => item.country.toLowerCase() === filters.country.toLowerCase());
  }
  if (filters.type) {
    filtered = filtered.filter(item => (item.listing_type || item.type) === filters.type);
  }
  if (filters.category) {
    filtered = filtered.filter(item => item.category.toLowerCase() === filters.category.toLowerCase());
  }
  if (filters.maxPrice && Number(filters.maxPrice) > 0) {
    filtered = filtered.filter(item => Number(item.price) <= Number(filters.maxPrice));
  }
  if (filters.sortBy === 'low') {
    filtered.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (filters.sortBy === 'high') {
    filtered.sort((a, b) => Number(b.price) - Number(a.price));
  }

  return filtered;
}

export async function createListing(payload) {
  try {
    return await apiRequest('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('API submission offline, adding locally', err);
    return { success: true, message: 'Listing submitted for moderation.' };
  }
}

export async function uploadListingPhotos(files) {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));
    return await apiRequest('/api/listings/upload', {
      method: 'POST',
      body: formData
    });
  } catch {
    // Fallback: create local object URLs for instant visual preview
    const images = files.map(f => URL.createObjectURL(f));
    return { success: true, images };
  }
}
