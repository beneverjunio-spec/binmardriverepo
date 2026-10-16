import { apiRequest } from './client';
import { DEFAULT_ADMIN_DATA } from '../constants';

export async function fetchAdminPortalData() {
  let customListings = [];
  try {
    const raw = localStorage.getItem('binmar_custom_listings');
    if (raw) customListings = JSON.parse(raw);
  } catch {}

  const pendingCustom = customListings.filter(item => item.status === 'pending');
  const approvedCustom = customListings.filter(item => item.status === 'approved');

  let customNotifs = [];
  try {
    const notifRaw = localStorage.getItem('binmar_admin_notifications');
    if (notifRaw) customNotifs = JSON.parse(notifRaw);
  } catch {}

  try {
    const [statsRes, modRes, dealerRes, listRes, notifRes] = await Promise.all([
      apiRequest('/api/admin/stats'),
      apiRequest('/api/admin/moderation'),
      apiRequest('/api/admin/dealers'),
      apiRequest('/api/admin/listings'),
      apiRequest('/api/notifications')
    ]);

    const queue = [...pendingCustom, ...(modRes.queue || [])];
    const liveList = [...approvedCustom, ...(listRes.listings || [])];

    return {
      stats: {
        ...statsRes.stats,
        pendingModeration: queue.length,
        liveListings: liveList.length
      },
      moderationQueue: queue,
      dealerQueue: dealerRes.dealers,
      adminListings: liveList,
      notifications: [...customNotifs, ...(notifRes.notifications || [])]
    };
  } catch {
    const defaultStats = DEFAULT_ADMIN_DATA.stats || {};
    const defaultMod = DEFAULT_ADMIN_DATA.moderationQueue || [];
    const defaultListings = DEFAULT_ADMIN_DATA.adminListings || [];

    const queue = [...pendingCustom, ...defaultMod];
    const liveList = [...approvedCustom, ...defaultListings];

    return {
      ...DEFAULT_ADMIN_DATA,
      stats: {
        ...defaultStats,
        pendingModeration: queue.length,
        liveListings: liveList.length
      },
      moderationQueue: queue,
      adminListings: liveList,
      notifications: [...customNotifs, ...(DEFAULT_ADMIN_DATA.notifications || [])]
    };
  }
}

export async function resolveModerationListing(id, approve) {
  let foundTitle = 'Vehicle';
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
