import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardTab from '../components/admin/DashboardTab';
import ModerationTab from '../components/admin/ModerationTab';
import DealersTab from '../components/admin/DealersTab';
import LiveListingsTab from '../components/admin/LiveListingsTab';
import AdminsTab from '../components/admin/AdminsTab';
import {
  fetchAdminPortalData,
  resolveModerationListing,
  resolveDealerApplication,
  deleteLiveListing
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
      let storedAdmins = [];
      try {
        const local = localStorage.getItem('binmar_custom_admins');
        if (local) storedAdmins = JSON.parse(local);
      } catch {}
      if (storedAdmins.length > 0) {
        setAdmins(storedAdmins);
      } else if (data.admins && data.admins.length > 0) {
        setAdmins(data.admins);
      }
      setNotifications(data.notifications);
    } catch (e) {
      let storedAdmins = [];
      try {
        const local = localStorage.getItem('binmar_custom_admins');
        if (local) storedAdmins = JSON.parse(local);
      } catch {}
      if (storedAdmins.length > 0) {
        setAdmins(storedAdmins);
      }
      setAdminDataError(e.message || 'Unable to load admin data. Please try again.');
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleResolveModeration = async (id, approve) => {
    try {
      const targetItem = moderationQueue.find(item => item.id === id);
      const data = await resolveModerationListing(id, approve);
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
      setDealerQueue(prev => prev.filter(dealer => dealer.id !== id));
      setAdminStats(prev => ({
        ...prev,
        pendingDealers: Math.max(0, prev.pendingDealers - 1),
        verifiedDealers: verify ? prev.verifiedDealers + 1 : prev.verifiedDealers
      }));
    } catch (err) {
      notify(err.message || 'Unable to update dealer. Please try again.');
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

  const handleAddAdmin = (newAdmin) => {
    setAdmins(prev => {
      const updated = [newAdmin, ...prev];
      try {
        localStorage.setItem('binmar_custom_admins', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    notify(`Admin account for ${newAdmin.name} created! Password saved.`);
  };

  const handleRemoveAdmin = (id) => {
    const target = admins.find(a => a.id === id);
    if (!window.confirm(`Are you sure you want to remove admin access for ${target?.name || 'this user'}?`)) return;
    setAdmins(prev => {
      const updated = prev.filter(a => a.id !== id);
      try {
        localStorage.setItem('binmar_custom_admins', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    notify('Administrator removed from the portal.');
  };

  const handleToggleAdminStatus = (id) => {
    setAdmins(prev => {
      const updated = prev.map(a =>
        a.id === id ? { ...a, status: a.status === 'Active' ? 'Suspended' : 'Active' } : a
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

        <AdminHeader notifications={notifications} />

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
            onRemoveAllListings={handleRemoveAllListings}
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
