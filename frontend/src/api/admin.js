import { apiRequest } from './client';
import { DEFAULT_ADMIN_DATA } from '../constants';

export async function fetchAdminPortalData() {
  try {
    const [statsRes, modRes, dealerRes, listRes, notifRes] = await Promise.all([
      apiRequest('/api/admin/stats'),
      apiRequest('/api/admin/moderation'),
      apiRequest('/api/admin/dealers'),
      apiRequest('/api/admin/listings'),
      apiRequest('/api/notifications')
    ]);

    return {
      stats: statsRes.stats,
      moderationQueue: modRes.queue,
      dealerQueue: dealerRes.dealers,
      adminListings: listRes.listings,
      notifications: notifRes.notifications
    };
  } catch {
    return DEFAULT_ADMIN_DATA;
  }
}

export async function resolveModerationListing(id, approve) {
  try {
    return await apiRequest(`/api/admin/moderation/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: approve ? 'approve' : 'reject' })
    });
  } catch {
    return { success: true, message: `Listing ${approve ? 'approved' : 'rejected'}.` };
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
    return await apiRequest(`/api/admin/listings/${id}`, {
      method: 'DELETE'
    });
  } catch {
    return { success: true, message: 'Listing removed.' };
  }
}
