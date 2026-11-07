import { apiRequest } from './client';
import { DEFAULT_LISTINGS } from '../constants';
import { isSameVehicle } from './admin';
import { generateVehicleSlug, extractListingIdFromSlug } from '../utils/seo';

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
    contact_phone: item.whatsapp_number || item.contact_phone || '+971501234567',
    slug: item.slug || generateVehicleSlug(item)
  };
}

export function isTestData(item) {
  if (!item) return false;
  const title = (item.title || '').toLowerCase();
  if (
    title.includes('toyota bmd') ||
    title.includes('test car') ||
    title.includes('dummy') ||
    title.includes('toyota 2002') ||
    title.includes('toyota 2000') ||
    title.includes('bmw 2000') ||
    title.includes('nissan 2000')
  ) {
    return true;
  }
  return false;
}

export async function fetchPublicListings(filters = {}) {
  // Purge any legacy test data from localStorage
  let localCustom = [];
  try {
    const raw = localStorage.getItem('binmar_custom_listings');
    if (raw) {
      const parsed = JSON.parse(raw);
      localCustom = parsed.filter(item => !isTestData(item)).map(sanitizeListing);
      localStorage.setItem('binmar_custom_listings', JSON.stringify(localCustom));
    }
  } catch {
    localCustom = [];
  }

  let deletedListingIds = [];
  try {
    const rawDel = localStorage.getItem('binmar_deleted_listings');
    if (rawDel) deletedListingIds = JSON.parse(rawDel);
  } catch {}

  let disabledListingIds = [];
  try {
    const rawDis = localStorage.getItem('binmar_disabled_listings');
    if (rawDis) disabledListingIds = JSON.parse(rawDis);
  } catch {}

  let serverListings = null;
  try {
    const queryParams = new URLSearchParams();
    if (filters.make) queryParams.append('make', filters.make);
    if (filters.country) queryParams.append('country', filters.country);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.seller) queryParams.append('seller', filters.seller);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    if (filters.sortBy) queryParams.append('sort', filters.sortBy);

    const res = await fetch(`/api/listings?${queryParams.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.listings) && data.listings.length > 0) {
        serverListings = data.listings.filter(l => !isTestData(l)).map(sanitizeListing);
      }
    }
  } catch {
    // API offline or fallback
  }

  const approvedCustom = localCustom.filter(item =>
    item.status === 'approved' &&
    !item.disabled &&
    !deletedListingIds.includes(String(item.id)) &&
    !disabledListingIds.includes(String(item.id))
  );
  
  let baseListings = serverListings !== null
    ? serverListings.filter(l => !l.disabled && !disabledListingIds.includes(String(l.id)) && !deletedListingIds.includes(String(l.id)))
    : [];


  const existingIds = new Set(baseListings.map(b => String(b.id)));
  for (const c of approvedCustom) {
    if (!existingIds.has(String(c.id))) {
      baseListings.push(c);
    }
  }

  // Ensure default curated listings are always present as baseline
  if (baseListings.length === 0) {
    baseListings = DEFAULT_LISTINGS.filter(l => !deletedListingIds.includes(String(l.id)) && !disabledListingIds.includes(String(l.id))).map(sanitizeListing);
  }

  let filtered = [...baseListings];

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
  if (filters.seller) {
    const s = filters.seller.trim().toLowerCase();
    filtered = filtered.filter(item => {
      const sellerName = (item.seller_name || '').toLowerCase();
      const sellerEmail = (item.seller_email || '').toLowerCase();
      return sellerName === s || sellerName.includes(s) || s.includes(sellerName) || sellerEmail === s;
    });
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

export async function fetchRegisteredSellers() {
  try {
    const res = await fetch('/api/dealers');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.dealers)) {
        return data.dealers;
      }
    }
  } catch (err) {
    console.warn('API fetchRegisteredSellers fallback:', err);
  }

  // Fallback to locally approved dealers and users
  const sellers = [];
  try {
    const rawDealers = localStorage.getItem('binmar_custom_dealers');
    if (rawDealers) {
      const parsed = JSON.parse(rawDealers);
      parsed.forEach(d => {
        if ((d.status === 'approved' || d.status === 'verified') && !isTestData(d)) {
          const name = d.company_name || d.name;
          if (name && !sellers.some(s => s.name?.toLowerCase() === name.toLowerCase())) {
            sellers.push({
              id: d.id,
              name,
              company_name: name,
              country: d.country
            });
          }
        }
      });
    }
  } catch {}

  try {
    const rawUsers = localStorage.getItem('binmar_custom_users');
    if (rawUsers) {
      const parsed = JSON.parse(rawUsers);
      parsed.forEach(u => {
        if ((u.status === 'approved' || u.status === 'verified' || u.is_verified_seller) && u.user_type !== 'admin') {
          const name = u.company_name || u.name;
          if (name && !sellers.some(s => s.name?.toLowerCase() === name.toLowerCase())) {
            sellers.push({
              id: u.id,
              name,
              company_name: name,
              country: u.country
            });
          }
        }
      });
    }
  } catch {}

  return sellers;
}

export async function createListing(payload) {
  const images = Array.isArray(payload.images) && payload.images.length > 0
    ? payload.images
    : [MAKE_FALLBACK_IMAGES[payload.make] || MAKE_FALLBACK_IMAGES['Toyota']];

  const city = payload.city && payload.city.trim() ? payload.city.trim() : 'Dubai';
  const country = payload.country || 'United Arab Emirates';
  const location = `${city}, ${country}`;
  const listingId = payload.id || Date.now();

  const newListing = {
    id: listingId,
    title: payload.title || `${payload.year} ${payload.make} ${payload.model}`,
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
    seller_email: (payload.seller_email || '').toLowerCase(),
    contact_preference: 'WhatsApp',
    whatsapp_number: payload.whatsapp_number,
    contact_phone: payload.whatsapp_number,
    description: payload.description,
    images,
    document_name: payload.document_name || payload.document_file || `${payload.make}_${payload.model}_Mulkiya.pdf`,
    document_file: payload.document_file || payload.document_name || `${payload.make}_${payload.model}_Mulkiya.pdf`,
    document_url: payload.document_url || null,
    status: 'pending', // PENDING: Sent to Admin Moderation Queue first!
    created_at: new Date().toISOString()
  };

  // Synchronize with backend API first so identical ID is preserved online
  let serverId = listingId;
  try {
    const apiRes = await apiRequest('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, id: listingId, city, country, location, images })
    });
    if (apiRes && (apiRes.id || (apiRes.listing && apiRes.listing.id))) {
      serverId = apiRes.id || apiRes.listing.id;
    }
  } catch (err) {
    console.warn('API submission offline, queued locally for moderation', err);
  }

  newListing.id = serverId;

  // Save to custom listings in pending status (strictly deduplicated by vehicle match)
  try {
    const raw = localStorage.getItem('binmar_custom_listings');
    const existing = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter(ex => !isSameVehicle(ex, newListing));
    localStorage.setItem('binmar_custom_listings', JSON.stringify([newListing, ...filtered]));

    // Send single notification to Admin Portal (deduplicated)
    const notifRaw = localStorage.getItem('binmar_admin_notifications');
    const existingNotifs = notifRaw ? JSON.parse(notifRaw) : [];
    const notifTitle = 'New Vehicle Pending Review';
    const notifMsg = `${newListing.title} was submitted by ${newListing.seller_name} (${newListing.city}, ${newListing.country}) and is waiting in the Moderation Queue for review.`;
    const filteredNotifs = existingNotifs.filter(n => !(n.title === notifTitle && n.message === notifMsg));
    const newNotif = {
      id: Date.now(),
      title: notifTitle,
      message: notifMsg,
      recipient: 'info@binmargroup.com',
      action_tab: 'moderation',
      type: 'listing_moderation',
      is_read: false,
      created_at: new Date().toISOString()
    };
    localStorage.setItem('binmar_admin_notifications', JSON.stringify([newNotif, ...filteredNotifs]));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }

  return { success: true, id: serverId, message: 'Listing submitted for moderation.' };
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


/**
 * Direct lookup for a single vehicle by slug or numeric ID
 */
export async function fetchListingById(idOrSlug) {
  if (!idOrSlug) return null;
  const rawCleaned = String(idOrSlug).replace(/^\/car\/?/, '').replace(/\/$/, '').trim();
  const extractedId = extractListingIdFromSlug(rawCleaned);

  // 1. Check in localStorage custom listings first (matches ID, slug, or generated slug)
  try {
    const raw = localStorage.getItem('binmar_custom_listings');
    if (raw) {
      const parsed = JSON.parse(raw);
      const match = parsed.find(item =>
        String(item.id) === String(extractedId) ||
        item.slug === rawCleaned ||
        generateVehicleSlug(item) === rawCleaned ||
        String(item.id) === String(rawCleaned)
      );
      if (match) return sanitizeListing(match);
    }
  } catch {}

  // 2. Fetch directly from backend API endpoint
  try {
    const target = extractedId || rawCleaned;
    const res = await fetch('/api/listings/' + encodeURIComponent(target));
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.listing) {
        return sanitizeListing(data.listing);
      }
    }
  } catch {}

  // 3. Search public listings array (including server + approved custom + baseline)
  try {
    const publicList = await fetchPublicListings();
    const match = publicList.find(item =>
      String(item.id) === String(extractedId) ||
      item.slug === rawCleaned ||
      generateVehicleSlug(item) === rawCleaned ||
      String(item.id) === String(rawCleaned)
    );
    if (match) return sanitizeListing(match);
  } catch {}

  // 4. Check DEFAULT_LISTINGS
  const defMatch = DEFAULT_LISTINGS.find(item =>
    String(item.id) === String(extractedId) ||
    generateVehicleSlug(item) === rawCleaned ||
    String(item.id) === String(rawCleaned)
  );
  if (defMatch) return sanitizeListing(defMatch);

  return null;
}
