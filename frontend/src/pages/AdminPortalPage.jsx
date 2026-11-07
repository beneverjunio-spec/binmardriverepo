import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardTab from '../components/admin/DashboardTab';
import ModerationTab from '../components/admin/ModerationTab';
import DealersTab from '../components/admin/DealersTab';
import LiveListingsTab from '../components/admin/LiveListingsTab';
import AdminsTab from '../components/admin/AdminsTab';
import NotificationsTab from '../components/admin/NotificationsTab';
import {
  fetchAdminPortalData,
  resolveModerationListing,
  resolveDealerApplication,
  deleteLiveListing,
  toggleDisableLiveListing
} from '../api/admin';
import { DEFAULT_ADMIN_DATA } from '../constants';

export default function AdminPortalPage({
  currentUser,
  onExit,
  onRefreshListings,
  notify
}) {
  const [adminTab, setAdminTab] = useState('dashboard');
  const [adminStats, setAdminStats] = useState({
    liveListings: 0,
    pendingModeration: 0,
    verifiedDealers: 0,
    pendingDealers: 0
  });
  const [moderationQueue, setModerationQueue] = useState([]);
  const [dealerQueue, setDealerQueue] = useState([]);
  const [adminListings, setAdminListings] = useState([]);
  const [admins, setAdmins] = useState(DEFAULT_ADMIN_DATA.admins || []);
  const [notifications, setNotifications] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminDataError, setAdminDataError] = useState('');

  const loadAdminData = async () => {
    setAdminDataError('');
    try {
      const data = await fetchAdminPortalData();
      setAdminStats(data.stats);
      setModerationQueue(data.moderationQueue);
      setDealerQueue(data.dealerQueue);
      setAdminListings(data.adminListings);
      let deletedAdmins = [];
      try {
        const rawDel = localStorage.getItem('binmar_deleted_admins');
        if (rawDel) deletedAdmins = JSON.parse(rawDel);
      } catch {}

      let storedAdmins = [];
      try {
        const staffRes = await fetch('/api/admin/staff');
        if (staffRes.ok) {
          const staffData = await staffRes.json();
          if (staffData.success && Array.isArray(staffData.admins)) {
            storedAdmins = staffData.admins;
          }
        }
      } catch (staffErr) {
        console.warn('API staff fetch fallback to local:', staffErr);
      }

      if (!storedAdmins.length) {
        try {
          const local = localStorage.getItem('binmar_custom_admins');
          if (local) storedAdmins = JSON.parse(local);
        } catch {}
      }

      // Combine default seeded admins with any created custom staff admins
      const defaultAdmins = DEFAULT_ADMIN_DATA.admins || [];
      const combinedAdmins = [...storedAdmins];
      for (const da of defaultAdmins) {
        if (!combinedAdmins.some(a => a.email.toLowerCase() === da.email.toLowerCase())) {
          combinedAdmins.push(da);
        }
      }

      // Filter out permanently deleted admins
      const activeAdmins = combinedAdmins.filter(a =>
        !deletedAdmins.includes(String(a.id)) &&
        (!a.email || !deletedAdmins.includes(a.email.toLowerCase()))
      );

      setAdmins(activeAdmins);
      try {
        localStorage.setItem('binmar_custom_admins', JSON.stringify(activeAdmins));
      } catch {}
      setNotifications(data.notifications);
    } catch (e) {
      let deletedAdmins = [];
      try {
        const rawDel = localStorage.getItem('binmar_deleted_admins');
        if (rawDel) deletedAdmins = JSON.parse(rawDel);
      } catch {}

      let storedAdmins = [];
      try {
        const staffRes = await fetch('/api/admin/staff');
        if (staffRes.ok) {
          const staffData = await staffRes.json();
          if (staffData.success && Array.isArray(staffData.admins)) {
            storedAdmins = staffData.admins;
          }
        }
      } catch (staffErr) {
        console.warn('API staff fetch fallback to local:', staffErr);
      }

      if (!storedAdmins.length) {
        try {
          const local = localStorage.getItem('binmar_custom_admins');
          if (local) storedAdmins = JSON.parse(local);
        } catch {}
      }
      const defaultAdmins = DEFAULT_ADMIN_DATA.admins || [];
      const combinedAdmins = [...storedAdmins];
      for (const da of defaultAdmins) {
        if (!combinedAdmins.some(a => a.email.toLowerCase() === da.email.toLowerCase())) {
          combinedAdmins.push(da);
        }
      }
      const activeAdmins = combinedAdmins.filter(a =>
        !deletedAdmins.includes(String(a.id)) &&
        (!a.email || !deletedAdmins.includes(a.email.toLowerCase()))
      );
      setAdmins(activeAdmins);
      setAdminDataError(e.message || 'Unable to load admin data. Please try again.');
    }
  };

  // Reload admin data on mount and whenever switching tabs
  useEffect(() => {
    loadAdminData();
  }, [adminTab]);

  // Synchronize immediately when another tab registers or window regains focus
  useEffect(() => {
    const handleSync = () => {
      loadAdminData();
    };
    window.addEventListener('focus', handleSync);
    window.addEventListener('storage', handleSync);
    // Also refresh when seller marks a listing as sold/rented in same session
    window.addEventListener('binmar_listings_updated', handleSync);
    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('binmar_listings_updated', handleSync);
    };
  }, []);

  const handleResolveModeration = async (id, approve, reason = '') => {
    try {
      const targetItem = moderationQueue.find(item => item.id === id);
      const data = await resolveModerationListing(id, approve, reason);
      notify(data.message);
      setModerationQueue(prev => prev.filter(item => item.id !== id));
      if (approve && targetItem) {
        const approvedItem = {
          ...targetItem,
          status: 'approved',
          approved_at: new Date().toISOString()
        };
        setAdminListings(prev => [approvedItem, ...prev.filter(l => l.id !== id)]);
      }
      setAdminStats(prev => ({
        ...prev,
        pendingModeration: Math.max(0, prev.pendingModeration - 1),
        liveListings: approve ? prev.liveListings + 1 : prev.liveListings
      }));
      if (onRefreshListings) onRefreshListings();
    } catch (err) {
      notify(err.message || 'Unable to update moderation. Please try again.');
    }
  };


  const handleResolveDealer = async (id, verify) => {
    try {
      const data = await resolveDealerApplication(id, verify);
      notify(data.message);
      const newStatus = verify ? 'verified' : 'rejected';
      setDealerQueue(prev =>
        prev.map(dealer => (dealer.id === id ? { ...dealer, status: newStatus } : dealer))
      );
      setAdminStats(prev => {
        const updated = dealerQueue.map(dealer => (dealer.id === id ? { ...dealer, status: newStatus } : dealer));
        return {
          ...prev,
          pendingDealers: updated.filter(d => !d.status || d.status === 'pending').length,
          verifiedDealers: updated.filter(d => d.status === 'verified' || d.status === 'approved').length,
          rejectedDealers: updated.filter(d => d.status === 'rejected').length
        };
      });
      window.dispatchEvent(new Event('binmar_dealers_updated'));
    } catch (err) {
      notify(err.message || 'Unable to update dealer. Please try again.');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    } catch {}
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, is_read: true }));
      try {
        localStorage.setItem('binmar_admin_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    notify('All notifications marked as read.');
  };

  const handleClearAllNotifications = async () => {
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
    } catch {}
    setNotifications([]);
    try {
      localStorage.setItem('binmar_admin_notifications', JSON.stringify([]));
    } catch {}
    notify('All notifications cleared.');
  };

  const handleToggleNotificationRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, is_read: !n.is_read } : n));
      try {
        localStorage.setItem('binmar_admin_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleToggleDisableListing = async (id, shouldDisable) => {
    try {
      await toggleDisableLiveListing(id, shouldDisable);
      setAdminListings(prev => prev.map(l => String(l.id) === String(id) ? { ...l, disabled: shouldDisable } : l));
      notify(shouldDisable ? 'Listing disabled from public marketplace.' : 'Listing re-enabled on public marketplace.');
      if (onRefreshListings) onRefreshListings();
      window.dispatchEvent(new Event('binmar_listings_updated'));
    } catch (e) {
      notify(e.message || 'Unable to update listing state.');
    }
  };

  const handleRemoveListing = async (id) => {
    if (!window.confirm('Are you sure you want to remove this listing from the live marketplace?')) return;
    try {
      await deleteLiveListing(id);
      notify('Listing removed from marketplace');
      setAdminListings(prev => prev.filter(l => l.id !== id));
      setAdminStats(prev => ({
        ...prev,
        liveListings: Math.max(0, prev.liveListings - 1)
      }));
      if (onRefreshListings) onRefreshListings();
    } catch (e) {
      notify(e.message || 'Unable to remove listing. Please try again.');
    }
  };

  const handleRemoveAllListings = async () => {
    if (!window.confirm('Are you sure you want to delete ALL live listings and reset the marketplace to zero?')) return;
    try {
      for (const l of adminListings) {
        await deleteLiveListing(l.id);
      }
      localStorage.removeItem('binmar_custom_listings');
      setAdminListings([]);
      setAdminStats(prev => ({
        ...prev,
        liveListings: 0
      }));
      notify('All live listings deleted. Marketplace is now 0.');
      if (onRefreshListings) onRefreshListings();
    } catch (e) {
      notify(e.message || 'Unable to clear listings. Please try again.');
    }
  };

  const handleAddAdmin = async (newAdmin) => {
    // Save online to server database
    try {
      await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin)
      });
    } catch (err) {
      console.warn('Could not post admin to server:', err);
    }

    // If this admin was previously deleted, remove from deleted list
    try {
      const rawDel = localStorage.getItem('binmar_deleted_admins');
      if (rawDel) {
        const deleted = JSON.parse(rawDel);
        const filtered = deleted.filter(x => x !== String(newAdmin.id) && x !== newAdmin.email?.toLowerCase());
        localStorage.setItem('binmar_deleted_admins', JSON.stringify(filtered));
      }
    } catch {}

    setAdmins(prev => {
      const updated = [newAdmin, ...prev.filter(a => a.email?.toLowerCase() !== newAdmin.email?.toLowerCase())];
      try {
        localStorage.setItem('binmar_custom_admins', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    notify(`Admin account for ${newAdmin.name} created! Saved online to database.`);
  };

  const handleRemoveAdmin = async (id) => {
    const target = admins.find(a => String(a.id) === String(id));
    if (!window.confirm(`Are you sure you want to remove admin access for ${target?.name || 'this user'}?`)) return;

    // Delete online from server database
    try {
      await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Could not delete admin from server:', err);
    }

    // Permanently record deletion in binmar_deleted_admins
    try {
      let deleted = [];
      const rawDel = localStorage.getItem('binmar_deleted_admins');
      if (rawDel) deleted = JSON.parse(rawDel);
      if (!deleted.includes(String(id))) {
        deleted.push(String(id));
      }
      if (target?.email && !deleted.includes(target.email.toLowerCase())) {
        deleted.push(target.email.toLowerCase());
      }
      localStorage.setItem('binmar_deleted_admins', JSON.stringify(deleted));
    } catch {}

    setAdmins(prev => {
      const updated = prev.filter(a => String(a.id) !== String(id));
      try {
        localStorage.setItem('binmar_custom_admins', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    notify(`Administrator "${target?.name || ''}" removed successfully.`);
  };

  const handleToggleAdminStatus = async (id) => {
    const target = admins.find(a => String(a.id) === String(id));
    const newStatus = target?.status === 'Active' ? 'Suspended' : 'Active';

    // Patch online on server database
    try {
      await fetch(`/api/admin/staff/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.warn('Could not patch admin status:', err);
    }

    setAdmins(prev => {
      const updated = prev.map(a =>
        a.id === id ? { ...a, status: newStatus } : a
      );
      try {
        localStorage.setItem('binmar_custom_admins', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    notify('Administrator status updated.');
  };

  return (
    <div className="admin-shell">
      <AdminSidebar
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        moderationCount={moderationQueue.length}
        dealerCount={dealerQueue.length}
        listingsCount={adminListings.length}
        notificationCount={notifications.filter(n => !n.is_read).length}
        adminCount={admins.length}
        onExit={onExit}
      />

      <div className="admin-main">
        {adminDataError && (
          <p className="err" role="alert">
            {adminDataError}{' '}
            <button type="button" className="btn-secondary" onClick={loadAdminData}>
              Retry
            </button>
          </p>
        )}

        <AdminHeader
          notifications={notifications}
          onOpenNotifications={() => setAdminTab('notifications')}
        />

        {adminTab === 'dashboard' && (
          <DashboardTab
            adminStats={adminStats}
            moderationQueue={moderationQueue}
            dealerQueue={dealerQueue}
            setAdminTab={setAdminTab}
            onResolveModeration={handleResolveModeration}
            onResolveDealer={handleResolveDealer}
          />
        )}

        {adminTab === 'moderation' && (
          <ModerationTab
            moderationQueue={moderationQueue}
            onResolveModeration={handleResolveModeration}
          />
        )}

        {adminTab === 'dealers' && (
          <DealersTab
            dealerQueue={dealerQueue}
            onResolveDealer={handleResolveDealer}
          />
        )}

        {adminTab === 'listings' && (
          <LiveListingsTab
            adminListings={adminListings}
            adminSearch={adminSearch}
            setAdminSearch={setAdminSearch}
            onRemoveListing={handleRemoveListing}
            onToggleDisableListing={handleToggleDisableListing}
            onRemoveAllListings={handleRemoveAllListings}
          />
        )}

        {adminTab === 'notifications' && (
          <NotificationsTab
            notifications={notifications}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onClearAll={handleClearAllNotifications}
            onToggleRead={handleToggleNotificationRead}
            setAdminTab={setAdminTab}
          />
        )}

        {adminTab === 'admins' && (
          <AdminsTab
            admins={admins}
            onAddAdmin={handleAddAdmin}
            onRemoveAdmin={handleRemoveAdmin}
            onToggleAdminStatus={handleToggleAdminStatus}
          />
        )}
      </div>
    </div>
  );
}
