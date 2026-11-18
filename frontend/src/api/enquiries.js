import { apiRequest } from './client';

// Client-side debounce map to prevent rapid double-click duplicate records (within 30s)
const recentClientClicks = new Map();

/**
 * Record a WhatsApp enquiry when a marketplace visitor clicks to contact a seller
 */
export async function recordWhatsAppEnquiry(listing, options = {}) {
  if (!listing) return null;

  const listingId = String(listing.id || listing._id || '');
  const sellerName = (listing.seller_name || listing.seller || 'Binmar Motors').trim();
  const rawType = listing.listing_type || listing.type || 'sale';
  const cleanType = String(rawType).toLowerCase() === 'rent' ? 'rent' : 'sale';

  // Prevent duplicate records for the same listing within 30 seconds
  const dedupKey = `${listingId}_${cleanType}`;
  const now = Date.now();
  const lastTime = recentClientClicks.get(dedupKey);
  if (lastTime && (now - lastTime < 30000)) {
    return { deduplicated: true };
  }
  recentClientClicks.set(dedupKey, now);

  const enquiryPayload = {
    seller_name: sellerName,
    seller_phone: listing.whatsapp_number || listing.contact_phone || '+971526539699',
    listing_id: listingId,
    listing_title: listing.title || `${listing.year || ''} ${listing.make || ''} ${listing.model || ''}`.trim() || 'Vehicle Listing',
    vehicle_brand: listing.make || '',
    vehicle_model: listing.model || '',
    reference_id: listing.reference_id || `REF-${listingId || '001'}`,
    enquiry_type: cleanType,
    price_label: listing.price_label || `${listing.currency || 'AED'} ${Number(listing.price || 0).toLocaleString()}`,
    customer_name: options.customer_name || null,
    customer_phone: options.customer_phone || null,
    whatsapp_link: options.whatsapp_link || '',
    source: options.source || 'marketplace',
    created_at: new Date().toISOString()
  };

  // 1. Send to server in background
  try {
    fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiryPayload),
      keepalive: true
    }).catch(() => {});
  } catch (err) {
    // Non-blocking
  }

  // 2. Also record in localStorage for instant offline / local resilience
  try {
    const raw = localStorage.getItem('binmar_seller_enquiries');
    let localList = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(localList)) localList = [];
    const localEntry = {
      id: `enq_local_${Date.now()}`,
      ...enquiryPayload
    };
    localList.unshift(localEntry);
    localStorage.setItem('binmar_seller_enquiries', JSON.stringify(localList.slice(0, 300)));
  } catch (e) {}

  // 3. Dispatch reactive update event so admin panel updates immediately
  try {
    window.dispatchEvent(new Event('binmar_enquiries_updated'));
  } catch (e) {}

  return { success: true, enquiry: enquiryPayload };
}

/**
 * Fetch all seller enquiries and grouped summaries for the Admin Panel
 */
export async function fetchSellerEnquiries(options = {}) {
  const queryParams = new URLSearchParams();
  if (options.seller) queryParams.set('seller', options.seller);
  if (options.type) queryParams.set('type', options.type);
  if (options.search) queryParams.set('search', options.search);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  try {
    const res = await apiRequest(`/api/admin/enquiries${queryString}`);
    if (res && res.success) {
      return res;
    }
  } catch (err) {
    console.warn('Enquiries fetch server warning, using local store:', err?.message);
  }

  // Fallback to local store
  let localEnquiries = [];
  try {
    const raw = localStorage.getItem('binmar_seller_enquiries');
    if (raw) localEnquiries = JSON.parse(raw);
  } catch {}

  const sellerMap = new Map();
  for (const item of localEnquiries) {
    const sName = (item.seller_name || 'Binmar Motors').trim();
    if (!sellerMap.has(sName)) {
      sellerMap.set(sName, {
        seller: sName,
        seller_phone: item.seller_phone || '',
        total: 0,
        saleCount: 0,
        rentCount: 0,
        lastEnquiryAt: item.created_at
      });
    }
    const summary = sellerMap.get(sName);
    summary.total += 1;
    if (item.enquiry_type === 'rent') summary.rentCount += 1;
    else summary.saleCount += 1;
  }

  return {
    success: true,
    totalEnquiries: localEnquiries.length,
    totalSale: localEnquiries.filter(e => e.enquiry_type === 'sale').length,
    totalRent: localEnquiries.filter(e => e.enquiry_type === 'rent').length,
    totalSellers: sellerMap.size,
    sellerSummaries: Array.from(sellerMap.values()),
    enquiries: localEnquiries
  };
}

/**
 * Delete a single enquiry by ID
 */
export async function deleteEnquiry(id) {
  try {
    await apiRequest(`/api/admin/enquiries/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Delete enquiry server warning:', err?.message);
  }

  // Also remove from localStorage
  try {
    const raw = localStorage.getItem('binmar_seller_enquiries');
    if (raw) {
      const list = JSON.parse(raw).filter(e => String(e.id) !== String(id));
      localStorage.setItem('binmar_seller_enquiries', JSON.stringify(list));
    }
  } catch {}

  window.dispatchEvent(new Event('binmar_enquiries_updated'));
  return { success: true };
}

/**
 * Clear all enquiries for a selected seller
 */
export async function clearSellerEnquiries(sellerName) {
  return clearMultipleSellersEnquiries([sellerName]);
}

/**
 * Clear all enquiries for multiple selected sellers
 */
export async function clearMultipleSellersEnquiries(sellerNames = []) {
  if (!sellerNames || !sellerNames.length) return { success: true };

  // Call server for each seller in parallel
  await Promise.all(
    sellerNames.map(name =>
      apiRequest(`/api/admin/enquiries/seller/${encodeURIComponent(name)}`, { method: 'DELETE' }).catch(err => {
        console.warn(`Clear seller enquiries warning for ${name}:`, err?.message);
      })
    )
  );

  // Also remove from localStorage in one batch
  try {
    const lowerNames = new Set(sellerNames.map(s => String(s).toLowerCase().trim()));
    const raw = localStorage.getItem('binmar_seller_enquiries');
    if (raw) {
      const list = JSON.parse(raw).filter(e => !lowerNames.has((e.seller_name || '').toLowerCase().trim()));
      localStorage.setItem('binmar_seller_enquiries', JSON.stringify(list));
    }
  } catch {}

  window.dispatchEvent(new Event('binmar_enquiries_updated'));
  return { success: true };
}

/**
 * Delete multiple enquiries by IDs
 */
export async function deleteMultipleEnquiries(ids = []) {
  if (!ids || !ids.length) return { success: true };

  const idSet = new Set(ids.map(String));

  // Call server for each enquiry in parallel
  await Promise.all(
    ids.map(id =>
      apiRequest(`/api/admin/enquiries/${id}`, { method: 'DELETE' }).catch(err => {
        console.warn(`Delete enquiry warning for ${id}:`, err?.message);
      })
    )
  );

  // Also remove from localStorage in one batch
  try {
    const raw = localStorage.getItem('binmar_seller_enquiries');
    if (raw) {
      const list = JSON.parse(raw).filter(e => !idSet.has(String(e.id || e._id)));
      localStorage.setItem('binmar_seller_enquiries', JSON.stringify(list));
    }
  } catch {}

  window.dispatchEvent(new Event('binmar_enquiries_updated'));
  return { success: true };
}
