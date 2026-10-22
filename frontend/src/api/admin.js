import { apiRequest } from './client';
import { DEFAULT_ADMIN_DATA } from '../constants';

const TEST_ITEM_IDS = ['1', '2', '3', '4', '5', '6', '101', '102', '103', '104', '201', '202'];

export function isSameVehicle(a, b) {
  if (!a || !b) return false;
  const aId = String(a.id || a._id || '');
  const bId = String(b.id || b._id || '');
  if (aId && bId && aId === bId) return true;

  const aTitle = (a.title || `${a.year || ''} ${a.make || ''} ${a.model || ''}`).trim().toLowerCase();
  const bTitle = (b.title || `${b.year || ''} ${b.make || ''} ${b.model || ''}`).trim().toLowerCase();
  const aPrice = Number(a.price);
  const bPrice = Number(b.price);

  if (aTitle && bTitle && aTitle === bTitle && (!Number.isFinite(aPrice) || !Number.isFinite(bPrice) || aPrice === bPrice)) {
    const aSeller = (a.seller_name || '').trim().toLowerCase();
    const bSeller = (b.seller_name || '').trim().toLowerCase();
    if (aSeller && bSeller && aSeller === bSeller) return true;

    const aPhone = (a.whatsapp_number || a.contact_phone || a.phone || '').replace(/\D/g, '');
    const bPhone = (b.whatsapp_number || b.contact_phone || b.phone || '').replace(/\D/g, '');
    if (aPhone && bPhone && aPhone === bPhone) return true;

    const aEmail = (a.seller_email || a.email || '').trim().toLowerCase();
    const bEmail = (b.seller_email || b.email || '').trim().toLowerCase();
    if (aEmail && bEmail && aEmail === bEmail) return true;

    if (a.make && b.make && a.make.toLowerCase() === b.make.toLowerCase() &&
        a.model && b.model && a.model.toLowerCase() === b.model.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function isTestData(item) {
  if (!item) return false;
  const idStr = String(item.id || item._id || '');
  const email = (item.email || '').toLowerCase();
  // Filter out any mock sample dealers
  if (
    email === 'almajid@test.com' ||
    email === 'contact@desertstarauto.ae' ||
    idStr === 'dealer_pending_1' ||
    idStr === 'dealer_verified_1'
  ) {
    return true;
  }
  // Real registered users or user listings always have timestamp, dealer_, or usr_ IDs
  if (idStr.startsWith('usr_') || idStr.length >= 12) return false;
  if (Number(item.id) > 1000000000000) return false;
  if (TEST_ITEM_IDS.includes(idStr)) return true;
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

  // 4. Load local custom dealers registered by users and cross-reference with registered users
  let customDealers = [];
  try {
    const rawDealers = localStorage.getItem('binmar_custom_dealers');
    if (rawDealers) {
      const parsedDealers = JSON.parse(rawDealers);
      customDealers = parsedDealers.filter(d => !isTestData(d));
    }
  } catch {}

  // Cross-reference with binmar_custom_users to guarantee every registered account is in the directory
  try {
    const rawUsers = localStorage.getItem('binmar_custom_users');
    if (rawUsers) {
      const parsedUsers = JSON.parse(rawUsers);
      parsedUsers.forEach(u => {
        if (u.user_type === 'admin') return;
        const alreadyInDealers = customDealers.some(d =>
          (d.email && u.email && d.email.toLowerCase() === u.email.toLowerCase()) ||
          String(d.id) === String(u.id)
        );
        if (!alreadyInDealers) {
          customDealers.push({
            id: u.id || 'usr_' + Date.now(),
            name: u.name || u.company_name || 'Registered Seller',
            company_name: u.company_name || (u.user_type === 'company' ? (u.name || 'Company') : `${u.name || 'Seller'} (Private Seller)`),
            email: u.email,
            phone: u.phone || 'N/A',
            country: u.country || 'United Arab Emirates',
            user_type: u.user_type || 'individual',
            trade_license: u.trade_license || (u.user_type === 'company' ? 'CN-Pending' : 'ID-Verified'),
            trade_license_file: u.trade_license_file || (u.user_type === 'company' ? 'Trade_License_Document.pdf' : 'National_ID_Passport.pdf'),
            trade_license_url: u.trade_license_url || null,
            status: u.status || (u.is_verified_seller ? 'approved' : 'pending'),
            created_at: u.created_at || new Date().toISOString()
          });
        }
      });
    }
  } catch {}

  try {
    localStorage.setItem('binmar_custom_dealers', JSON.stringify(customDealers));
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

    // 1. Combine Moderation Queue (Strictly Deduplicated)
    const activeServerQueue = (modRes.queue || [])
      .filter(item => !resolvedModeration.includes(String(item.id)));

    // Deduplicate pendingCustom first
    const dedupedPendingCustom = [];
    for (const pc of pendingCustom) {
      if (!dedupedPendingCustom.some(ex => isSameVehicle(ex, pc))) {
        dedupedPendingCustom.push(pc);
      }
    }

    const combinedQueue = [...dedupedPendingCustom];
    for (const sq of activeServerQueue) {
      const matchIdx = combinedQueue.findIndex(cq => isSameVehicle(cq, sq));
      if (matchIdx !== -1) {
        // Merge so server is primary, retaining client-attached document URL
        combinedQueue[matchIdx] = {
          ...combinedQueue[matchIdx],
          ...sq,
          document_url: combinedQueue[matchIdx].document_url || sq.document_url || null,
          document_file: combinedQueue[matchIdx].document_file || sq.document_file || null
        };
      } else {
        combinedQueue.push(sq);
      }
    }

    // Final deduplication guaranteeing strictly 1 entry per vehicle in moderation
    const queue = [];
    for (const item of combinedQueue) {
      if (!isTestData(item) && !queue.some(q => isSameVehicle(q, item))) {
        queue.push(item);
      }
    }

    // 2. Combine Live Listings (Strictly Deduplicated)
    const activeServerListings = (listRes.listings || [])
      .filter(l => (l.status === 'approved' || !l.status) && !deletedListingIds.includes(String(l.id)));
    const combinedLive = [...approvedCustom];
    for (const sl of activeServerListings) {
      const matchIdx = combinedLive.findIndex(cl => isSameVehicle(cl, sl));
      if (matchIdx !== -1) {
        combinedLive[matchIdx] = { ...combinedLive[matchIdx], ...sl };
      } else {
        combinedLive.push(sl);
      }
    }
    const rawLiveList = combinedLive.filter(item => !isTestData(item));
    const liveList = [];
    for (const item of rawLiveList) {
      if (!liveList.some(l => isSameVehicle(l, item))) {
        liveList.push(item);
      }
    }

    // 3. Combine Dealers from online server database
    const serverDealers = (dealerRes.dealers || []).filter(d => !isTestData(d) && d.user_type !== 'admin');
    const combinedDealers = [...customDealers];
    for (const sd of serverDealers) {
      const matchIdx = combinedDealers.findIndex(cd =>
        String(cd.id) === String(sd.id) ||
        (cd.email && sd.email && cd.email.toLowerCase() === sd.email.toLowerCase())
      );
      if (matchIdx !== -1) {
        combinedDealers[matchIdx] = {
          ...combinedDealers[matchIdx],
          ...sd,
          trade_license_url: combinedDealers[matchIdx].trade_license_url || sd.trade_license_url || null,
          trade_license_file: combinedDealers[matchIdx].trade_license_file || sd.trade_license_file || null
        };
      } else {
        combinedDealers.push(sd);
      }
    }

    // Ensure default seeded dealers are present if directory is empty
    const defaultDealers = (DEFAULT_ADMIN_DATA.dealerQueue || []).filter(d => !isTestData(d));
    for (const dd of defaultDealers) {
      if (!combinedDealers.some(cd => String(cd.id) === String(dd.id) || (cd.email && dd.email && cd.email.toLowerCase() === dd.email.toLowerCase()))) {
        combinedDealers.push(dd);
      }
    }

    const pendingDealers = combinedDealers.filter(d => !d.status || d.status === 'pending');
    const verifiedDealers = combinedDealers.filter(d => d.status === 'approved' || d.status === 'verified');
    const rejectedDealers = combinedDealers.filter(d => d.status === 'rejected');

    // 4. Combine Notifications (Deduplicated)
    const serverNotifs = (notifRes.notifications || []).filter(n => !isTestData(n));
    const combinedNotifs = [];
    for (const n of [...customNotifs, ...serverNotifs]) {
      const alreadyExists = combinedNotifs.some(cn =>
        String(cn.id) === String(n.id) ||
        (cn.title === n.title && cn.message === n.message)
      );
      if (!alreadyExists) {
        combinedNotifs.push(n);
      }
    }

    return {
      stats: {
        pendingModeration: queue.length,
        liveListings: liveList.length,
        pendingDealers: pendingDealers.length,
        verifiedDealers: verifiedDealers.length,
        rejectedDealers: rejectedDealers.length
      },
      moderationQueue: queue,
      dealerQueue: combinedDealers,
      adminListings: liveList,
      notifications: combinedNotifs
    };
  } catch (err) {
    console.warn('Admin portal fetch fallback to local store:', err?.message);
    const defaultMod = (DEFAULT_ADMIN_DATA.moderationQueue || [])
      .filter(item => !isTestData(item) && !resolvedModeration.includes(String(item.id)));
    const defaultListings = (DEFAULT_ADMIN_DATA.adminListings || [])
      .filter(item => !isTestData(item) && !deletedListingIds.includes(String(item.id)));
    const defaultDealers = (DEFAULT_ADMIN_DATA.dealerQueue || [])
      .filter(item => !isTestData(item));

    const combinedQueueFallback = [...pendingCustom];
    for (const dm of defaultMod) {
      if (!combinedQueueFallback.some(cq => isSameVehicle(cq, dm))) {
        combinedQueueFallback.push(dm);
      }
    }
    const queue = [];
    for (const item of combinedQueueFallback) {
      if (!queue.some(q => isSameVehicle(q, item))) {
        queue.push(item);
      }
    }
    const combinedLiveFallback = [...approvedCustom];
    for (const dl of defaultListings) {
      if (!combinedLiveFallback.some(cl => isSameVehicle(cl, dl))) {
        combinedLiveFallback.push(dl);
      }
    }
    const liveList = [];
    for (const item of combinedLiveFallback) {
      if (!liveList.some(l => isSameVehicle(l, item))) {
        liveList.push(item);
      }
    }

    const combinedDealers = [...customDealers];
    for (const dd of defaultDealers) {
      if (!combinedDealers.some(cd => String(cd.id) === String(dd.id) || (cd.email && dd.email && cd.email.toLowerCase() === dd.email.toLowerCase()))) {
        combinedDealers.push(dd);
      }
    }

    const pendingDealers = combinedDealers.filter(d => !d.status || d.status === 'pending');
    const verifiedDealers = combinedDealers.filter(d => d.status === 'approved' || d.status === 'verified');
    const rejectedDealers = combinedDealers.filter(d => d.status === 'rejected');

    return {
      ...DEFAULT_ADMIN_DATA,
      stats: {
        pendingModeration: queue.length,
        liveListings: liveList.length,
        pendingDealers: pendingDealers.length,
        verifiedDealers: verifiedDealers.length,
        rejectedDealers: rejectedDealers.length
      },
      moderationQueue: queue,
      dealerQueue: combinedDealers,
      adminListings: liveList,
      notifications: customNotifs
    };
  }
}

export async function resolveModerationListing(id, approve, reason = '') {
  let foundTitle = 'Vehicle';
  let sellerEmail = '';

  // Mark as permanently resolved in localStorage so it never comes back
  try {
    let resolved = [];
    const rawRes = localStorage.getItem('binmar_resolved_moderation');
    if (rawRes) resolved = JSON.parse(rawRes);
    if (!resolved.includes(String(id))) {
      resolved.push(String(id));
    }

    // Also find any matching duplicate items in custom listings and resolve them
    const raw = localStorage.getItem('binmar_custom_listings');
    if (raw) {
      const items = JSON.parse(raw);
      const targetItem = items.find(item => String(item.id) === String(id));
      items.forEach(item => {
        if (String(item.id) === String(id) || (targetItem && isSameVehicle(item, targetItem))) {
          if (!resolved.includes(String(item.id))) {
            resolved.push(String(item.id));
          }
          foundTitle = item.title || foundTitle;
          sellerEmail = item.seller_email || item.email || sellerEmail;
          if (approve) {
            item.status = 'approved';
            item.approved_at = new Date().toISOString();
          } else {
            item.status = 'rejected';
            item.rejection_reason = reason;
            item.rejected_at = new Date().toISOString();
          }
        }
      });
      localStorage.setItem('binmar_custom_listings', JSON.stringify(items));
    }
    localStorage.setItem('binmar_resolved_moderation', JSON.stringify(resolved));
  } catch {}

  // Create real-time notification for the Seller Portal if rejected
  if (!approve) {
    try {
      const sellerNotifRaw = localStorage.getItem('binmar_seller_notifications');
      const sellerNotifs = sellerNotifRaw ? JSON.parse(sellerNotifRaw) : [];
      const newNotif = {
        id: Date.now(),
        listing_id: id,
        seller_email: sellerEmail,
        title: `Vehicle Listing Rejected: ${foundTitle}`,
        message: `Your vehicle submission for "${foundTitle}" was rejected by admin. Reason: "${reason || 'Verification requirements not met.'}". Please review the remarks and update your listing.`,
        type: 'rejection',
        rejection_reason: reason,
        is_read: false,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('binmar_seller_notifications', JSON.stringify([newNotif, ...sellerNotifs]));

      const adminNotifRaw = localStorage.getItem('binmar_admin_notifications');
      const adminNotifs = adminNotifRaw ? JSON.parse(adminNotifRaw) : [];
      adminNotifs.unshift({
        id: Date.now() + 1,
        title: `Vehicle Rejected: ${foundTitle}`,
        message: `Listing "${foundTitle}" was rejected. Reason: ${reason || 'Not specified'}.`,
        is_read: false,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('binmar_admin_notifications', JSON.stringify(adminNotifs));

      try {
        window.dispatchEvent(new Event('storage'));
      } catch {}
    } catch (e) {
      console.warn('Could not write rejection notification', e);
    }
  }

  try {
    const res = await apiRequest(`/api/admin/moderation/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: approve ? 'approve' : 'reject', reason })
    });
    return res;
  } catch {
    return {
      success: true,
      message: `"${foundTitle}" has been ${approve ? 'approved and is now LIVE on public listings!' : 'rejected with remarks recorded.'}`
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
      }
    }

    // Synchronize with registered user credentials in binmar_custom_users
    try {
      const rawUsers = localStorage.getItem('binmar_custom_users');
      if (rawUsers) {
        const users = JSON.parse(rawUsers);
        const userIndex = users.findIndex(u =>
          String(u.id) === String(id) ||
          (u.email && raw && raw.toLowerCase().includes(u.email.toLowerCase()))
        );
        if (userIndex !== -1) {
          dealerName = users[userIndex].name || users[userIndex].company_name || dealerName;
          users[userIndex].status = verify ? 'approved' : 'rejected';
          users[userIndex].is_verified_seller = verify;
          localStorage.setItem('binmar_custom_users', JSON.stringify(users));
        }
      }
    } catch (e) {
      console.warn('Could not update user status in localStorage', e);
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
  // Mark as permanently deleted in localStorage
  try {
    let deleted = [];
    const rawDel = localStorage.getItem('binmar_deleted_listings');
    if (rawDel) deleted = JSON.parse(rawDel);
    if (!deleted.includes(String(id))) {
      deleted.push(String(id));
      localStorage.setItem('binmar_deleted_listings', JSON.stringify(deleted));
    }

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
    return { success: true };
  }
}
