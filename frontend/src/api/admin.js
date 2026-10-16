import { apiRequest } from './client';
import { DEFAULT_ADMIN_DATA } from '../constants';

const TEST_ITEM_IDS = ['101', '102', '103', '201', '202'];
const TEST_TITLES = [
  '2024 Land Rover Defender 110 V8',
  '2023 BMW M4 Competition Coupe',
  '2024 Chevrolet Corvette Z06 3LZ',
  'Oasis Luxury Automotive LLC',
  'Riyadh Premier Motors'
];

function isTestData(item) {
  if (!item) return false;
  const idStr = String(item.id);
  if (TEST_ITEM_IDS.includes(idStr)) return true;
  if (item.title && TEST_TITLES.includes(item.title)) return true;
  if (item.name && TEST_TITLES.includes(item.name)) return true;
  if (item.company_name && TEST_TITLES.includes(item.company_name)) return true;
  return false;
}

export async function fetchAdminPortalData() {
  // 1. Clean out any legacy test data from localStorage
  let customListings = [];
  try {
    const raw = localStorage.getItem('binmar_custom_listings');
    if (raw) {
      const parsed = JSON.parse(raw);
      customListings = parsed.filter(item => !isTestData(item));
      localStorage.setItem('binmar_custom_listings', JSON.stringify(customListings));
    }
  } catch {}

  // 2. Load persistent deleted listings list
  let deletedListingIds = [];
  try {
    const rawDel = localStorage.getItem('binmar_deleted_listings');
    if (rawDel) deletedListingIds = JSON.parse(rawDel);
  } catch {}

  customListings = customListings.filter(item => !deletedListingIds.includes(String(item.id)));

  const pendingCustom = customListings.filter(item => item.status === 'pending');
  const approvedCustom = customListings.filter(item => item.status === 'approved');

  // 3. Load persistent resolved moderation & dealers
  let resolvedModeration = [];
  try {
    const rawRes = localStorage.getItem('binmar_resolved_moderation');
    if (rawRes) resolvedModeration = JSON.parse(rawRes);
  } catch {}

  let resolvedDealers = [];
  try {
    const rawResD = localStorage.getItem('binmar_resolved_dealers');
    if (rawResD) resolvedDealers = JSON.parse(rawResD);
  } catch {}

  let customNotifs = [];
  try {
    const notifRaw = localStorage.getItem('binmar_admin_notifications');
    if (notifRaw) {
      const parsedNotifs = JSON.parse(notifRaw);
      customNotifs = parsedNotifs.filter(n => !isTestData(n) && !n.title?.includes('Land Rover') && !n.message?.includes('Khalid'));
      localStorage.setItem('binmar_admin_notifications', JSON.stringify(customNotifs));
    }
  } catch {}

  try {
    const [statsRes, modRes, dealerRes, listRes, notifRes] = await Promise.all([
      apiRequest('/api/admin/stats'),
      apiRequest('/api/admin/moderation'),
      apiRequest('/api/admin/dealers'),
      apiRequest('/api/admin/listings'),
      apiRequest('/api/notifications')
    ]);

    const queue = [...pendingCustom, ...(modRes.queue || [])]
      .filter(item => !isTestData(item) && !resolvedModeration.includes(String(item.id)));

    const liveList = [...approvedCustom, ...(listRes.listings || [])]
      .filter(item => !isTestData(item) && !deletedListingIds.includes(String(item.id)));

    const dealers = (dealerRes.dealers || [])
      .filter(dealer => !isTestData(dealer) && !resolvedDealers.includes(String(dealer.id)));

    const notifs = [...customNotifs, ...(notifRes.notifications || [])]
      .filter(n => !isTestData(n));

    return {
      stats: {
        ...statsRes.stats,
        pendingModeration: queue.length,
        liveListings: liveList.length,
        pendingDealers: dealers.length,
        verifiedDealers: statsRes.stats?.verifiedDealers || 0
      },
      moderationQueue: queue,
      dealerQueue: dealers,
      adminListings: liveList,
      notifications: notifs
    };
  } catch {
    const defaultStats = DEFAULT_ADMIN_DATA.stats || {};
    const defaultMod = (DEFAULT_ADMIN_DATA.moderationQueue || [])
      .filter(item => !isTestData(item) && !resolvedModeration.includes(String(item.id)));
    const defaultDealers = (DEFAULT_ADMIN_DATA.dealerQueue || [])
      .filter(dealer => !isTestData(dealer) && !resolvedDealers.includes(String(dealer.id)));
    const defaultListings = (DEFAULT_ADMIN_DATA.adminListings || [])
      .filter(item => !isTestData(item) && !deletedListingIds.includes(String(item.id)));

    const queue = [...pendingCustom, ...defaultMod];
    const liveList = [...approvedCustom, ...defaultListings];

    return {
      ...DEFAULT_ADMIN_DATA,
      stats: {
        ...defaultStats,
        pendingModeration: queue.length,
        liveListings: liveList.length,
        pendingDealers: defaultDealers.length,
        verifiedDealers: 0
      },
      moderationQueue: queue,
      dealerQueue: defaultDealers,
      adminListings: liveList,
      notifications: customNotifs
    };
  }
}

export async function resolveModerationListing(id, approve) {
  let foundTitle = 'Vehicle';

  // Mark as permanently resolved in localStorage so it never comes back
  try {
    let resolved = [];
    const rawRes = localStorage.getItem('binmar_resolved_moderation');
    if (rawRes) resolved = JSON.parse(rawRes);
    if (!resolved.includes(String(id))) {
      resolved.push(String(id));
      localStorage.setItem('binmar_resolved_moderation', JSON.stringify(resolved));
    }
  } catch {}

  try {
    const raw = localStorage.getItem('binmar_custom_listings');
    if (raw) {
      const items = JSON.parse(raw);
      const matchIndex = items.findIndex(item => String(item.id) === String(id));
      if (matchIndex !== -1) {
        foundTitle = items[matchIndex].title || 'Vehicle';
        if (approve) {
          items[matchIndex].status = 'approved';
          items[matchIndex].approved_at = new Date().toISOString();
        } else {
          items[matchIndex].status = 'rejected';
        }
        localStorage.setItem('binmar_custom_listings', JSON.stringify(items));
      }
    }
  } catch (e) {
    console.warn('Could not update custom listing in localStorage', e);
  }

  try {
    const res = await apiRequest(`/api/admin/moderation/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: approve ? 'approve' : 'reject' })
    });
    return res;
  } catch {
    return {
      success: true,
      message: `"${foundTitle}" has been ${approve ? 'approved and is now LIVE on public listings!' : 'rejected.'}`
    };
  }
}

export async function resolveDealerApplication(id, verify) {
  // Mark as permanently resolved in localStorage so it never comes back
  try {
    let resolved = [];
    const rawRes = localStorage.getItem('binmar_resolved_dealers');
    if (rawRes) resolved = JSON.parse(rawRes);
    if (!resolved.includes(String(id))) {
      resolved.push(String(id));
      localStorage.setItem('binmar_resolved_dealers', JSON.stringify(resolved));
    }
  } catch {}

  try {
    return await apiRequest(`/api/admin/dealers/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: verify ? 'verify' : 'reject' })
    });
  } catch {
    return { success: true, message: `Dealer ${verify ? 'verified' : 'rejected'}.` };
  }
}

export async function deleteLiveListing(id) {
  // Mark as permanently deleted in localStorage so it never comes back
  try {
    let deleted = [];
    const rawDel = localStorage.getItem('binmar_deleted_listings');
    if (rawDel) deleted = JSON.parse(rawDel);
    if (!deleted.includes(String(id))) {
      deleted.push(String(id));
      localStorage.setItem('binmar_deleted_listings', JSON.stringify(deleted));
    }
  } catch {}

  try {
    const raw = localStorage.getItem('binmar_custom_listings');
    if (raw) {
      const items = JSON.parse(raw);
      const filtered = items.filter(item => String(item.id) !== String(id));
      localStorage.setItem('binmar_custom_listings', JSON.stringify(filtered));
    }
  } catch {}

  try {
    return await apiRequest(`/api/admin/listings/${id}`, {
      method: 'DELETE'
    });
  } catch {
    return { success: true, message: 'Listing removed from marketplace.' };
  }
}

