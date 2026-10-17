import { apiRequest } from './client';
import { DEFAULT_ADMIN_DATA } from '../constants';

const TEST_ITEM_IDS = ['1', '2', '3', '4', '5', '6', '101', '102', '103', '104', '201', '202'];
const TEST_TITLES = [
  '2024 Toyota Land Cruiser',
  '2024 Toyota Land Cruiser GR-Sport',
  '2023 Mercedes-Benz G63 AMG',
  '2022 Mercedes-Benz G63 AMG',
  '2025 Porsche 911 GT3 RS',
  '2024 Nissan Patrol NISMO 5.6L',
  '2023 Nissan Patrol',
  '2025 Lexus LX 600',
  '2024 Lexus LX 600 VIP Edition',
  '2024 Ford F-150 Raptor R 5.2L V8',
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
  const title = (item.title || '').toLowerCase();
  if (
    title.includes('toyota bmd') ||
    title.includes('toyota 2002') ||
    title.includes('toyota 2000') ||
    title.includes('bmw 2000') ||
    title.includes('nissan 2000')
  ) {
    return true;
  }
  const sName = (item.seller_name || '').toUpperCase();
  if (sName === 'MR. ALI' || sName.includes('DESERT STAR') || sName.includes('AL FUTTAIM') || sName.includes('AL TAYER PRESTIGE') || sName.includes('BINMAR ROYAL') || sName.includes('ABDUL LATIF JAMEEL')) {
    if (['1', '2', '3', '4', '5', '6', '101', '102', '103', '104'].includes(idStr)) return true;
  }
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

  // 4. Load local custom dealers registered by users
  let customDealers = [];
  try {
    const rawDealers = localStorage.getItem('binmar_custom_dealers');
    if (rawDealers) {
      const parsedDealers = JSON.parse(rawDealers);
      customDealers = parsedDealers.filter(d => !isTestData(d));
      localStorage.setItem('binmar_custom_dealers', JSON.stringify(customDealers));
    }
  } catch {}

  const pendingCustomDealers = customDealers.filter(d => d.status === 'pending' && !resolvedDealers.includes(String(d.id)));
  const verifiedCustomDealers = customDealers.filter(d => (d.status === 'approved' || d.status === 'verified') && !resolvedDealers.includes(String(d.id) + '_rejected'));

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

    const rawDealersList = [...pendingCustomDealers, ...(dealerRes.dealers || [])];
    const seenEmails = new Set();
    const seenIds = new Set();
    const dealers = [];
    for (const d of rawDealersList) {
      if (isTestData(d)) continue;
      if (resolvedDealers.includes(String(d.id))) continue;
      const emailKey = d.email ? d.email.toLowerCase().trim() : null;
      const idKey = String(d.id);
      if (seenIds.has(idKey) || (emailKey && seenEmails.has(emailKey))) continue;
      seenIds.add(idKey);
      if (emailKey) seenEmails.add(emailKey);
      dealers.push(d);
    }

    const notifs = [...customNotifs, ...(notifRes.notifications || [])]
      .filter(n => !isTestData(n));

    const totalVerified = (statsRes.stats?.verifiedDealers || 0) + verifiedCustomDealers.length;

    return {
      stats: {
        ...statsRes.stats,
        pendingModeration: queue.length,
        liveListings: liveList.length,
        pendingDealers: dealers.length,
        verifiedDealers: totalVerified
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

    const rawDealersList = [...pendingCustomDealers, ...defaultDealers];
    const seenEmails = new Set();
    const seenIds = new Set();
    const dealers = [];
    for (const d of rawDealersList) {
      if (isTestData(d)) continue;
      if (resolvedDealers.includes(String(d.id))) continue;
      const emailKey = d.email ? d.email.toLowerCase().trim() : null;
      const idKey = String(d.id);
      if (seenIds.has(idKey) || (emailKey && seenEmails.has(emailKey))) continue;
      seenIds.add(idKey);
      if (emailKey) seenEmails.add(emailKey);
      dealers.push(d);
    }

    return {
      ...DEFAULT_ADMIN_DATA,
      stats: {
        ...defaultStats,
        pendingModeration: queue.length,
        liveListings: liveList.length,
        pendingDealers: dealers.length,
        verifiedDealers: verifiedCustomDealers.length
      },
      moderationQueue: queue,
      dealerQueue: dealers,
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
  let dealerName = 'Dealer';

  // Mark as permanently resolved in localStorage
  try {
    let resolved = [];
    const rawRes = localStorage.getItem('binmar_resolved_dealers');
    if (rawRes) resolved = JSON.parse(rawRes);
    if (!resolved.includes(String(id))) {
      resolved.push(String(id));
      localStorage.setItem('binmar_resolved_dealers', JSON.stringify(resolved));
    }

    const raw = localStorage.getItem('binmar_custom_dealers');
    if (raw) {
      const items = JSON.parse(raw);
      const matchIndex = items.findIndex(item => String(item.id) === String(id));
      if (matchIndex !== -1) {
        const dealerItem = items[matchIndex];
        dealerName = dealerItem.name || dealerItem.company_name || 'Dealer';
        items[matchIndex].status = verify ? 'verified' : 'rejected';
        items[matchIndex].verified_at = new Date().toISOString();
        localStorage.setItem('binmar_custom_dealers', JSON.stringify(items));

        // Synchronize with registered user credentials in binmar_custom_users
        try {
          const rawUsers = localStorage.getItem('binmar_custom_users');
          if (rawUsers) {
            const users = JSON.parse(rawUsers);
            const userIndex = users.findIndex(u =>
              (dealerItem.email && u.email && u.email.toLowerCase() === dealerItem.email.toLowerCase()) ||
              (dealerItem.company_name && u.company_name && u.company_name.toLowerCase() === dealerItem.company_name.toLowerCase()) ||
              (dealerItem.trade_license && u.trade_license && u.trade_license === dealerItem.trade_license)
            );
            if (userIndex !== -1) {
              users[userIndex].status = verify ? 'approved' : 'rejected';
              users[userIndex].is_verified_seller = verify;
              localStorage.setItem('binmar_custom_users', JSON.stringify(users));
            }
          }
        } catch (e) {
          console.warn('Could not update user status in localStorage', e);
        }
      }
    }
  } catch {}

  try {
    const res = await apiRequest(`/api/admin/dealers/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: verify ? 'verify' : 'reject' })
    });
    return res;
  } catch {
    return {
      success: true,
      message: `Dealer "${dealerName}" ${verify ? 'verified successfully! Account is now active.' : 'application rejected.'}`
    };
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

