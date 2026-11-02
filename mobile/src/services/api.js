import { Platform } from 'react-native';

// ==========================================
// Environment Config (.env via EXPO_PUBLIC_*)
// ==========================================
export const LIVE_BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL || 'https://binmardrive.binmargroup.com';
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `${LIVE_BASE_URL}/api`;
export const ADMIN_BASE_URL =
  process.env.EXPO_PUBLIC_ADMIN_API_URL || `${API_BASE_URL}/admin`;

export function getBaseUrl() {
  return API_BASE_URL;
}

export function getAdminBaseUrl() {
  return ADMIN_BASE_URL;
}

// Fallback high-res placeholder image if a listing has no images
const FALLBACK_CAR_IMAGE =
  'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1000&q=80';

/**
 * Safely format mileage from numbers, '0 km', or '0 km km' without duplicate suffixes.
 * Returns: { mileage: '0 km', mileageKm: '0' }
 */
export function formatMileage(rawMileage) {
  if (rawMileage === null || rawMileage === undefined) {
    return { mileage: '0 km', mileageKm: '0' };
  }
  const clean = String(rawMileage).replace(/km/gi, '').trim();
  const val = clean.length > 0 ? clean : '0';
  return {
    mileage: `${val} km`,
    mileageKm: val,
  };
}

/**
 * Safely parse image array, supporting base64 data URLs, JSON strings, or array of strings.
 */
export function parseImages(rawImages) {
  if (!rawImages) return [FALLBACK_CAR_IMAGE];
  let list = [];
  if (Array.isArray(rawImages)) {
    list = rawImages;
  } else if (typeof rawImages === 'string') {
    try {
      const parsed = JSON.parse(rawImages);
      if (Array.isArray(parsed)) list = parsed;
      else if (typeof parsed === 'string') list = [parsed];
    } catch {
      if (rawImages.trim().startsWith('data:') || rawImages.trim().startsWith('http')) {
        list = [rawImages.trim()];
      }
    }
  }

  const valid = list.filter(
    (img) => typeof img === 'string' && img.trim().length > 0 && !img.startsWith('blob:')
  );

  return valid.length > 0 ? valid : [FALLBACK_CAR_IMAGE];
}

/**
 * Map live website snake_case fields to mobile camelCase properties.
 */
export function mapListing(item) {
  const { mileage, mileageKm } = formatMileage(item.mileage);
  const images = parseImages(item.images);
  const rawType = (item.listing_type || item.type || 'sale').toString().toLowerCase();
  const type = rawType === 'rent' ? 'rent' : 'buy';
  const condition = item.condition_type || item.condition || 'used';
  const sellerName = item.seller_name || item.sellerName || 'Verified Seller';
  const sellerPhone = item.contact_phone || item.sellerPhone || '+971 50 123 4567';
  const whatsappNumber = item.whatsapp_number || item.whatsappNumber || sellerPhone;

  // Correct status mapping per live API specs
  // status: moderation status ('approved', 'pending', etc.)
  // sale_status: inventory status ('sold', 'available', etc.)
  const rawSaleStatus = (item.sale_status || '').toLowerCase().trim();
  const rawStatus = (item.status || 'approved').toLowerCase().trim();
  const isSold = rawSaleStatus === 'sold' || rawStatus === 'sold';
  const saleStatus = isSold ? 'sold' : (rawSaleStatus === 'available' ? 'available' : (isSold ? 'sold' : 'available'));

  return {
    id: item.id,
    title: item.title || `${item.year || ''} ${item.make || ''} ${item.model || ''}`.trim(),
    make: item.make || '',
    model: item.model || '',
    year: Number(item.year) || 2024,
    trim: item.category || 'Luxury',
    category: item.category || 'SUV',
    fuel: item.fuel || 'Petrol',
    mileage,
    mileageKm,
    transmission: item.transmission || 'Automatic',
    condition,
    condition_type: item.condition_type || condition,
    type,
    listing_type: item.listing_type || (type === 'buy' ? 'sale' : 'rent'),
    price: Number(item.price) || 0,
    currency: item.currency || 'AED',
    country: item.country || 'United Arab Emirates',
    city: item.city || 'Dubai',
    sellerName,
    seller_name: sellerName,
    sellerEmail: item.seller_email || '',
    seller_email: item.seller_email || '',
    sellerPhone,
    contact_phone: sellerPhone,
    whatsappNumber,
    whatsapp_number: whatsappNumber,
    description: item.description || '',
    images,
    status: item.status || 'approved', // Preserved separately from sale_status
    sale_status: saleStatus,           // 'sold' or 'available'
    isSold: Boolean(isSold),           // boolean flag
    latitude: item.latitude || null,
    longitude: item.longitude || null,
    maps_url: item.maps_url || null,
    verified: true,
    featured: true,
    specs: item.specs || {
      engine: `${item.fuel || 'Petrol'} Engine`,
      transmission: item.transmission || 'Automatic',
      power: '380 HP',
      seats: 5,
      doors: 4,
    },
    postedDaysAgo: 'Recently',
  };
}

export const api = {
  // ==========================================
  // Public Listings Endpoints
  // ==========================================

  /**
   * Fetch real vehicles directly from live web API (GET /api/listings).
   * Reflects only real live database listings.
   */
  async getListings(filters = {}) {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams();

    if (filters.make && filters.make !== 'All') {
      params.append('make', filters.make);
    }
    if (filters.country && filters.country !== 'All Middle East' && filters.country !== 'Any country') {
      params.append('country', filters.country);
    }
    if (filters.type && filters.type !== 'all') {
      // Live backend stores 'sale' for purchase and 'rent' for rental
      const backendType = filters.type === 'buy' ? 'sale' : filters.type;
      params.append('type', backendType);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.sort) {
      params.append('sort', filters.sort);
    }
    if (filters.maxPrice && !isNaN(Number(filters.maxPrice)) && Number(filters.maxPrice) > 0) {
      params.append('maxPrice', String(filters.maxPrice));
    }

    const queryStr = params.toString();
    const url = `${baseUrl}/listings${queryStr ? `?${queryStr}` : ''}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (!data || !data.success || !Array.isArray(data.listings)) {
        throw new Error(data?.error || 'Invalid API response format');
      }

      let mapped = data.listings.map(mapListing);

      // Client-side search query filter across title, make, model, city, country
      if (filters.query && filters.query.trim()) {
        const q = filters.query.toLowerCase().trim();
        mapped = mapped.filter(
          (c) =>
            (c.make && c.make.toLowerCase().includes(q)) ||
            (c.model && c.model.toLowerCase().includes(q)) ||
            (c.city && c.city.toLowerCase().includes(q)) ||
            (c.country && c.country.toLowerCase().includes(q)) ||
            (c.title && c.title.toLowerCase().includes(q))
        );
      }

      return mapped;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('[Mobile API] Live fetch error:', err.message);
      throw err;
    }
  },

  /**
   * Submit a new vehicle listing to the live website (POST /api/listings).
   */
  async createListing(listingData, token) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Clean mileage so backend does not duplicate 'km'
      const cleanMileage = listingData.mileage
        ? String(listingData.mileage).replace(/km/gi, '').trim()
        : (listingData.mileageKm ? String(listingData.mileageKm).replace(/km/gi, '').trim() : '0');

      const payload = {
        ...listingData,
        mileage: cleanMileage,
        listing_type: listingData.listing_type || (listingData.type === 'rent' ? 'rent' : 'sale'),
      };

      const res = await fetch(`${getBaseUrl()}/listings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server returned ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('[Mobile API] Create listing error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // ==========================================
  // User Auth Endpoints
  // ==========================================

  // Auth: Register (POST /api/dealers/register or /api/auth/register)
  async register(userData) {
    try {
      const res = await fetch(`${getBaseUrl()}/dealers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Auth: Login (POST /api/auth/login)
  async login(credentials) {
    try {
      const res = await fetch(`${getBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // ==========================================
  // Admin Endpoints (/api/admin/...)
  // ==========================================

  // Admin Access Login
  async adminLogin(email, password) {
    try {
      const res = await fetch(`${getAdminBaseUrl()}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Admin Dashboard Stats
  async getAdminStats() {
    try {
      const res = await fetch(`${getAdminBaseUrl()}/stats`);
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Admin All Listings
  async getAdminListings() {
    try {
      const res = await fetch(`${getAdminBaseUrl()}/listings`);
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Admin Vehicle Moderation Queue
  async getAdminModeration() {
    try {
      const res = await fetch(`${getAdminBaseUrl()}/moderation`);
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Admin Dealer Approvals Queue
  async getAdminDealers() {
    try {
      const res = await fetch(`${getAdminBaseUrl()}/dealers`);
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Admin Resolve Moderation: Approve or Reject
  async resolveModeration(listingId, decision = 'approve') {
    try {
      const res = await fetch(`${getAdminBaseUrl()}/moderation/${listingId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Admin Resolve Dealer: Verify or Reject
  async resolveDealer(dealerId, decision = 'approve') {
    try {
      const res = await fetch(`${getAdminBaseUrl()}/dealers/${dealerId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Admin Delete a listing
  async deleteListing(listingId) {
    try {
      const res = await fetch(`${getAdminBaseUrl()}/listings/${listingId}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Admin Update listing details or status
  async updateListing(listingId, updateData) {
    try {
      const res = await fetch(`${getAdminBaseUrl()}/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Notifications
  async getNotifications() {
    try {
      const res = await fetch(`${getBaseUrl()}/notifications`);
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Mark Notification Read
  async markNotificationRead(id) {
    try {
      const res = await fetch(`${getBaseUrl()}/notifications/${id}/read`, {
        method: 'PUT',
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};
