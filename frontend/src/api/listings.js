import { apiRequest } from './client';
import { DEFAULT_LISTINGS } from '../constants';

const MAKE_FALLBACK_IMAGES = {
  Toyota: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1000&q=80',
  'Mercedes-Benz': 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1000&q=80',
  Porsche: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1000&q=80',
  Nissan: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
  Lexus: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
  Ford: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1000&q=80',
  BMW: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80',
  'Land Rover': 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1000&q=80',
  Chevrolet: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80'
};

function sanitizeListing(item) {
  let images = Array.isArray(item.images)
    ? item.images
    : (typeof item.images === 'string' ? JSON.parse(item.images || '[]') : []);

  // Filter out any broken blob: URLs from previous sessions
  images = images.filter(url => typeof url === 'string' && url.length > 0 && !url.startsWith('blob:'));

  if (!images.length) {
    const fallback = MAKE_FALLBACK_IMAGES[item.make] || MAKE_FALLBACK_IMAGES['Toyota'];
    images = [fallback];
  }

  const city = item.city || 'Dubai';
  const country = item.country || 'United Arab Emirates';
  const location = item.location || `${city}, ${country}`;

  return {
    ...item,
    city,
    country,
    location,
    latitude: item.latitude || null,
    longitude: item.longitude || null,
    maps_url: item.maps_url || (item.latitude && item.longitude ? `https://www.google.com/maps?q=${item.latitude},${item.longitude}` : null),
    images,
    whatsapp_number: item.whatsapp_number || item.contact_phone || '+971501234567',
    contact_phone: item.whatsapp_number || item.contact_phone || '+971501234567'
  };
}

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
        return data.listings.map(sanitizeListing);
      }
    }
  } catch {
    // Graceful fallback to default listings
  }

  // Load custom user/owner listings from local storage
  let localCustom = [];
  try {
    const raw = localStorage.getItem('binmar_custom_listings');
    if (raw) {
      const parsed = JSON.parse(raw);
      localCustom = parsed.map(sanitizeListing);
      // Resave clean listings
      localStorage.setItem('binmar_custom_listings', JSON.stringify(localCustom));
    }
  } catch {
    localCustom = [];
  }

  // Filter combined listings (only approved listings appear on the public marketplace)
  const approvedCustom = localCustom.filter(item => item.status === 'approved');
  let filtered = [...approvedCustom, ...DEFAULT_LISTINGS.map(sanitizeListing)];
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
  const images = Array.isArray(payload.images) && payload.images.length > 0
    ? payload.images
    : [MAKE_FALLBACK_IMAGES[payload.make] || MAKE_FALLBACK_IMAGES['Toyota']];

  const city = payload.city && payload.city.trim() ? payload.city.trim() : 'Dubai';
  const country = payload.country || 'United Arab Emirates';
  const location = `${city}, ${country}`;

  const newListing = {
    id: Date.now(),
    title: `${payload.year} ${payload.make} ${payload.model}`,
    make: payload.make,
    model: payload.model,
    year: Number(payload.year),
    category: payload.category || 'SUV',
    fuel: payload.fuel || 'Petrol',
    mileage: payload.mileage ? `${payload.mileage} km` : '0 km',
    transmission: payload.transmission || 'Automatic',
    condition_type: payload.condition_type || 'used',
    listing_type: payload.listing_type || 'sale',
    price: Number(payload.price),
    currency: payload.currency || 'AED',
    price_label: `${payload.currency || 'AED'} ${Number(payload.price).toLocaleString()}${payload.listing_type === 'rent' ? ' / day' : ''}`,
    country,
    city,
    location,
    latitude: payload.latitude || null,
    longitude: payload.longitude || null,
    maps_url: payload.maps_url || null,
    seller_name: payload.seller_name || 'Car Owner',
    contact_preference: 'WhatsApp',
    whatsapp_number: payload.whatsapp_number,
    contact_phone: payload.whatsapp_number,
    description: payload.description,
    images,
    status: 'pending', // PENDING: Sent to Admin Moderation Queue first!
    created_at: new Date().toISOString()
  };

  // Save to custom listings in pending status for Admin moderation
  try {
    const raw = localStorage.getItem('binmar_custom_listings');
    const existing = raw ? JSON.parse(raw) : [];
    localStorage.setItem('binmar_custom_listings', JSON.stringify([newListing, ...existing]));

    // Send high-priority notification to Admin Portal
    const notifRaw = localStorage.getItem('binmar_admin_notifications');
    const existingNotifs = notifRaw ? JSON.parse(notifRaw) : [];
    const newNotif = {
      id: Date.now(),
      title: 'New Vehicle Pending Review',
      message: `${newListing.title} was submitted by ${newListing.seller_name} (${newListing.city}, ${newListing.country}) and is waiting in the Moderation Queue for review.`,
      is_read: false,
      created_at: new Date().toISOString()
    };
    localStorage.setItem('binmar_admin_notifications', JSON.stringify([newNotif, ...existingNotifs]));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }

  try {
    const apiRes = await apiRequest('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, city, country, location, images })
    });
    return apiRes;
  } catch (err) {
    console.warn('API submission offline, queued locally for moderation', err);
    return { success: true, message: 'Listing submitted for moderation.' };
  }
}


export async function fileToDataUrl(file) {
  return new Promise((resolve) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export async function uploadListingPhotos(files) {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));
    const res = await apiRequest('/api/listings/upload', {
      method: 'POST',
      body: formData
    });
    if (res && Array.isArray(res.images) && res.images.length > 0) {
      return res;
    }
  } catch {
    // API server offline, convert to persistent base64 images
  }

  // Convert to persistent base64 data URLs
  const base64List = await Promise.all(files.map(f => fileToDataUrl(f)));
  const images = base64List.filter(Boolean);
  return { success: true, images };
}

