import React from 'react';
import { Car, Clock, ShieldCheck, CheckCircle2, Users, ArrowLeft } from 'lucide-react';

export default function AdminSidebar({
  adminTab,
  setAdminTab,
  moderationCount,
  dealerCount,
  adminCount,
  onExit
}) {
  return (
    <div className="admin-side">
      <div
        className={`admin-nav-item ${adminTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setAdminTab('dashboard')}
      >
        <Car size={18} />
        <span>Dashboard</span>
      </div>

      <div
        className={`admin-nav-item ${adminTab === 'moderation' ? 'active' : ''}`}
        onClick={() => setAdminTab('moderation')}
      >
        <Clock size={18} />
        <span>Moderation queue</span>
        <span className="admin-nav-count">{moderationCount}</span>
      </div>

      <div
        className={`admin-nav-item ${adminTab === 'dealers' ? 'active' : ''}`}
        onClick={() => setAdminTab('dealers')}
      >
        <ShieldCheck size={18} />
        <span>Dealer verification</span>
        <span className="admin-nav-count">{dealerCount}</span>
      </div>

      <div
        className={`admin-nav-item ${adminTab === 'listings' ? 'active' : ''}`}
        onClick={() => setAdminTab('listings')}
      >
        <CheckCircle2 size={18} />
        <span>All live listings</span>
      </div>

      <div
        className={`admin-nav-item ${adminTab === 'admins' ? 'active' : ''}`}
        onClick={() => setAdminTab('admins')}
      >
        <Users size={18} />
        <span>Staff & Admins</span>
        {adminCount > 0 && <span className="admin-nav-count">{adminCount}</span>}
      </div>

      <div
        className="admin-nav-item"
        style={{ marginTop: '2rem', opacity: 0.8 }}
        onClick={onExit}
      >
        <ArrowLeft size={18} />
        <span>Exit to Marketplace</span>
      </div>
    </div>
  );
}
