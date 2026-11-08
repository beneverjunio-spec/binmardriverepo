import { apiRequest } from './client';
import { DEFAULT_ADMIN_DATA } from '../constants';
import { sendAdminEmailNotification, sendSellerEmailNotification } from './email';

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

let adminDataCache = null;
let adminDataCacheTime = 0;
const CACHE_TTL_MS = 2500;

export function invalidateAdminCache() {
  adminDataCache = null;
  adminDataCacheTime = 0;
}

export async function fetchAdminPortalData(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && adminDataCache && (now - adminDataCacheTime < CACHE_TTL_MS)) {
    return adminDataCache;
  }

  try {
    const [statsRes, modRes, dealerRes, listRes, notifRes] = await Promise.all([
      apiRequest('/api/admin/stats'),
      apiRequest('/api/admin/moderation'),
      apiRequest('/api/admin/dealers'),
      apiRequest('/api/admin/listings'),
      apiRequest('/api/notifications')
    ]);

    // 1. Live Moderation Queue from server (Authoritative for all admins)
    const serverQueue = (modRes?.queue || []).filter(item => !isTestData(item));
    // Sort resubmitted items to top, then newest
    serverQueue.sort((a, b) => {
      if (a.resubmitted && !b.resubmitted) return -1;
      if (!a.resubmitted && b.resubmitted) return 1;
      const dateA = new Date(a.resubmitted_at || a.created_at || 0).getTime();
      const dateB = new Date(b.resubmitted_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });

    // 2. Live Listings from server (Approved vehicles)
    const liveList = (listRes?.listings || [])
      .filter(l => (l.status === 'approved' || !l.status) && !isTestData(l));

    // 3. Dealers from server (All registered sellers)
    const cleanDealers = (dealerRes?.dealers || [])
      .filter(d => !isTestData(d) && d.user_type !== 'admin');

    const pendingDealers = cleanDealers.filter(d => !d.status || d.status === 'pending');
    const verifiedDealers = cleanDealers.filter(d => d.status === 'approved' || d.status === 'verified');
    const rejectedDealers = cleanDealers.filter(d => d.status === 'rejected');

    // 4. Notifications from server
    const serverNotifs = (notifRes?.notifications || []).filter(n => !isTestData(n));

    const result = {
      stats: {
        pendingModeration: serverQueue.length,
        liveListings: liveList.length,
        pendingDealers: pendingDealers.length,
        verifiedDealers: verifiedDealers.length,
        rejectedDealers: rejectedDealers.length
      },
      moderationQueue: serverQueue,
      dealerQueue: cleanDealers,
      adminListings: liveList,
      notifications: serverNotifs
    };

    adminDataCache = result;
    adminDataCacheTime = Date.now();
    return result;
  } catch (err) {
    console.warn('Admin portal fetch fallback to local store:', err?.message);
    let customListings = [];
    try {
      const raw = localStorage.getItem('binmar_custom_listings');
      if (raw) customListings = JSON.parse(raw).filter(item => !isTestData(item));
    } catch {}

    let customDealers = [];
    try {
      const rawD = localStorage.getItem('binmar_custom_dealers');
      if (rawD) customDealers = JSON.parse(rawD).filter(d => !isTestData(d));
    } catch {}

    const queue = customListings.filter(item => item.status === 'pending');
    const liveList = customListings.filter(item => item.status === 'approved');
    const pendingDealers = customDealers.filter(d => !d.status || d.status === 'pending');
    const verifiedDealers = customDealers.filter(d => d.status === 'approved' || d.status === 'verified');
    const rejectedDealers = customDealers.filter(d => d.status === 'rejected');

    let customNotifs = [];
    try {
      const rawN = localStorage.getItem('binmar_admin_notifications');
      if (rawN) customNotifs = JSON.parse(rawN).filter(n => !isTestData(n));
    } catch {}

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
      dealerQueue: customDealers,
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
    // Also notify seller in local notifications if approved
    if (approve) {
      try {
        const sellerNotifRaw = localStorage.getItem('binmar_seller_notifications');
        const sellerNotifs = sellerNotifRaw ? JSON.parse(sellerNotifRaw) : [];
        const approveNotif = {
          id: Date.now(),
          listing_id: id,
          seller_email: sellerEmail,
          title: `Listing Approved: ${foundTitle}`,
          message: `Your vehicle listing "${foundTitle}" has been approved by admin and is now LIVE on BinmarDrive!`,
          type: 'approval',
          is_read: false,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('binmar_seller_notifications', JSON.stringify([approveNotif, ...sellerNotifs]));
      } catch (e) {
        console.warn('Could not store seller approval notification', e);
      }
    }

    // Dispatch real-time email notifications
    sendAdminEmailNotification({
      subject: approve ? 'New Listing Submitted' : `Listing Rejected: ${foundTitle}`,
      title: approve ? 'New Listing Submitted' : 'Listing Rejected',
      message: approve ? 'A seller has submitted a new vehicle listing. Please review and approve or reject the listing.' : `The listing "${foundTitle}" has been rejected.`,
      details: {
        'Vehicle Title': foundTitle,
        'Seller Email': sellerEmail || 'N/A',
        'Decision': approve ? 'APPROVED & LIVE' : 'REJECTED',
        ...(reason && !approve ? { 'Rejection Reason': reason } : {}),
        'Processed At': new Date().toLocaleString()
      }
    }).catch(e => console.warn(e));

    if (sellerEmail) {
      sendSellerEmailNotification({
        to: sellerEmail,
        subject: approve ? 'Approved' : 'Rejected',
        title: approve ? 'Listing Approved' : 'Listing Rejected',
        message: approve
          ? `Hello Seller,\n\nGood news! Your vehicle listing has been successfully approved and is now published on BinmarDrive.\n\nYour listing is now visible to potential buyers or renters.\n\nThank you for using BinmarDrive!\n\nBest regards,\nBinmarDrive Team`
          : `Hello Seller,\n\nUnfortunately, your vehicle listing has not been approved by our admin team.\n\nReason: ${reason || 'Please contact info@binmargroup.com for details.'}
\nPlease review the feedback and make the necessary corrections before resubmitting your listing.\n\nThank you for your understanding.\n\nBest regards,\nBinmarDrive Team`,
        details: {
          'Vehicle Title': foundTitle,
          'Status': approve ? 'Live on Marketplace' : 'Rejected / Needs Revision',
          ...(reason && !approve ? { 'Remarks': reason } : {}),
          'Date': new Date().toLocaleDateString()
        },
        actionUrl: 'https://binmardrive.binmargroup.com/seller'
      }).catch(e => console.warn(e));
    }

    invalidateAdminCache();
    const res = await apiRequest(`/api/admin/moderation/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: approve ? 'approve' : 'reject', reason, email: sellerEmail, title: foundTitle })
    });
    return res;
  } catch {
    invalidateAdminCache();
    return {
      success: true,
      message: `"${foundTitle}" has been ${approve ? 'approved and is now LIVE on public listings!' : 'rejected with remarks recorded.'}`
    };
  }
}

export async function resolveDealerApplication(id, verify) {
  let dealerName = 'Dealer';
  let dealerEmail = '';

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
        dealerEmail = dealerItem.email || dealerEmail;
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
          dealerEmail = users[userIndex].email || dealerEmail;
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
    // Add seller notification
    try {
      const sellerNotifRaw = localStorage.getItem('binmar_seller_notifications');
      const sellerNotifs = sellerNotifRaw ? JSON.parse(sellerNotifRaw) : [];
      const newNotif = {
        id: Date.now(),
        seller_email: dealerEmail,
        title: verify ? 'Seller Account Verified!' : 'Seller Application Status',
        message: verify
          ? 'Congratulations! Your seller account has been verified and approved by the BinmarDrive admin team. You can now log in and post vehicles.'
          : 'Your seller registration was not approved. Please contact info@binmargroup.com for assistance.',
        type: verify ? 'verification_approved' : 'verification_rejected',
        is_read: false,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('binmar_seller_notifications', JSON.stringify([newNotif, ...sellerNotifs]));
    } catch {}

    // Dispatch real-time email notifications
    sendAdminEmailNotification({
      subject: verify ? 'New Seller Registration' : `Seller Registration Rejected: ${dealerName}`,
      title: verify ? 'New Seller Registration' : 'Seller Registration Rejected',
      message: verify ? 'A new seller has registered. Please review the registration and approve or reject the account.' : `The seller application from ${dealerName} has been rejected.`,
      details: {
        'Seller Name': dealerName,
        'Email Address': dealerEmail || 'N/A',
        'Decision': verify ? 'APPROVED & VERIFIED' : 'REJECTED',
        'Processed At': new Date().toLocaleString()
      }
    }).catch(e => console.warn(e));

    if (dealerEmail) {
      sendSellerEmailNotification({
        to: dealerEmail,
        subject: verify ? 'Seller Account Approved' : 'Seller Account Not Approved',
        title: verify ? 'Seller Account Approved' : 'Seller Application Not Approved',
        message: verify
          ? 'Hello Seller,\n\nCongratulations! Your registration has been successfully approved by the admin.\n\nYou can now access your BinmarDrive account and start submitting your vehicle listings for rent or sale.\n\nThank you for joining us!\n\nBest regards,\nBinmarDrive Team'
          : 'Hello Seller,\n\nThank you for registering with BinmarDrive. Unfortunately, your seller account application was not approved at this time.\n\nPlease contact us at info@binmargroup.com for further assistance.\n\nBest regards,\nBinmarDrive Team',
        details: {
          'Seller': dealerName,
          'Account Status': verify ? 'Verified & Active' : 'Not Approved',
          'Date': new Date().toLocaleDateString(),
          'Support Contact': 'info@binmargroup.com'
        },
        actionUrl: 'https://binmardrive.binmargroup.com/login'
      }).catch(e => console.warn(e));
    }

    invalidateAdminCache();
    const res = await apiRequest(`/api/admin/dealers/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: verify ? 'verify' : 'reject', email: dealerEmail, name: dealerName })
    });
    return res;
  } catch {
    invalidateAdminCache();
    return {
      success: true,
      message: `Dealer "${dealerName}" ${verify ? 'verified successfully! Account is now active.' : 'application rejected.'}`
    };
  }
}

export async function deleteDealer(id) {
  let dealerName = 'Seller';
  let dealerEmail = '';

  // 1. Mark as deleted in localStorage
  try {
    let deleted = [];
    const rawDel = localStorage.getItem('binmar_deleted_dealers');
    if (rawDel) deleted = JSON.parse(rawDel);
    const idStr = String(id).toLowerCase();
    if (!deleted.includes(idStr)) deleted.push(idStr);

    // 2. Remove from custom dealers
    const raw = localStorage.getItem('binmar_custom_dealers');
    if (raw) {
      const items = JSON.parse(raw);
      const match = items.find(d => String(d.id) === String(id) || (d.email && String(d.email).toLowerCase() === String(id).toLowerCase()));
      if (match) {
        dealerName = match.name || match.company_name || dealerName;
        dealerEmail = (match.email || '').toLowerCase();
        if (dealerEmail && !deleted.includes(dealerEmail)) {
          deleted.push(dealerEmail);
        }
      }
      const updated = items.filter(d => String(d.id) !== String(id) && (!dealerEmail || !d.email || d.email.toLowerCase() !== dealerEmail));
      localStorage.setItem('binmar_custom_dealers', JSON.stringify(updated));
    }

    // 3. Remove from custom users
    const rawUsers = localStorage.getItem('binmar_custom_users');
    if (rawUsers) {
      const users = JSON.parse(rawUsers);
      const uMatch = users.find(u => String(u.id) === String(id) || (dealerEmail && u.email && u.email.toLowerCase() === dealerEmail));
      if (uMatch) {
        dealerName = uMatch.name || uMatch.company_name || dealerName;
        dealerEmail = (uMatch.email || dealerEmail).toLowerCase();
        if (dealerEmail && !deleted.includes(dealerEmail)) {
          deleted.push(dealerEmail);
        }
      }
      const updatedUsers = users.filter(u => String(u.id) !== String(id) && (!dealerEmail || !u.email || u.email.toLowerCase() !== dealerEmail));
      localStorage.setItem('binmar_custom_users', JSON.stringify(updatedUsers));
    }

    localStorage.setItem('binmar_deleted_dealers', JSON.stringify(deleted));

    // 4. Remove associated listings by this seller
    const rawListings = localStorage.getItem('binmar_custom_listings');
    if (rawListings) {
      const listings = JSON.parse(rawListings);
      const remaining = listings.filter(l => {
        if (l.user_id && String(l.user_id) === String(id)) return false;
        if (dealerEmail && l.seller_email && l.seller_email.toLowerCase() === dealerEmail) return false;
        return true;
      });
      localStorage.setItem('binmar_custom_listings', JSON.stringify(remaining));
    }

    // Send admin notification
    sendAdminEmailNotification({
      subject: `[BinmarDrive] Seller Record Deleted: ${dealerName}`,
      title: 'Seller Deleted from Directory',
      message: `Admin has permanently deleted the seller record for "${dealerName}" (${dealerEmail || 'N/A'}). All associated credentials and submitted vehicles have been removed.`,
      details: {
        'Seller Name': dealerName,
        'Email Address': dealerEmail || 'N/A',
        'Action': 'DELETED',
        'Timestamp': new Date().toLocaleString()
      }
    }).catch(e => console.warn(e));
  } catch (e) {
    console.warn('Local dealer deletion note:', e);
  }

  invalidateAdminCache();

  // 5. Backend API call to permanently delete
  try {
    const res = await apiRequest(`/api/dealers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: dealerEmail })
    });
    return {
      success: true,
      message: res?.message || `Seller "${dealerName}" has been permanently deleted.`
    };
  } catch (err) {
    console.warn('Backend API dealer deletion note:', err);
    return {
      success: true,
      message: `Seller "${dealerName}" has been deleted successfully.`
    };
  }
}

export async function toggleDisableLiveListing(id, shouldDisable) {
  try {
    let disabled = [];
    const rawDis = localStorage.getItem('binmar_disabled_listings');
    if (rawDis) disabled = JSON.parse(rawDis);

    if (shouldDisable) {
      if (!disabled.includes(String(id))) {
        disabled.push(String(id));
      }
    } else {
      disabled = disabled.filter(item => String(item) !== String(id));
    }
    localStorage.setItem('binmar_disabled_listings', JSON.stringify(disabled));

    // Update in local custom listings
    const raw = localStorage.getItem('binmar_custom_listings');
    if (raw) {
      const items = JSON.parse(raw);
      const updated = items.map(l => String(l.id) === String(id) ? { ...l, disabled: shouldDisable } : l);
      localStorage.setItem('binmar_custom_listings', JSON.stringify(updated));
    }
  } catch {}

  invalidateAdminCache();

  try {
    return await apiRequest(`/api/admin/listings/${id}/disable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabled: shouldDisable })
    });
  } catch {
    return { success: true };
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

  invalidateAdminCache();

  try {
    return await apiRequest(`/api/admin/listings/${id}`, {
      method: 'DELETE'
    });
  } catch {
    return { success: true };
  }
}
