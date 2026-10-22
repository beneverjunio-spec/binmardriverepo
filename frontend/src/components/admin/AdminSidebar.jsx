import React from 'react';
import { Car, Clock, ShieldCheck, CheckCircle2, Users, Bell, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminSidebar({
  adminTab,
  setAdminTab,
  moderationCount = 0,
  dealerCount = 0,
  listingsCount = 0,
  adminCount = 0,
  notificationCount = 0,
  onExit
}) {
  const { t, isRTL } = useLanguage();

  return (
    <div className="admin-side">
      <div
        className={`admin-nav-item ${adminTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setAdminTab('dashboard')}
      >
        <Car size={18} />
        <span>{t('admin_tab_dashboard')}</span>
      </div>

      <div
        className={`admin-nav-item ${adminTab === 'moderation' ? 'active' : ''}`}
        onClick={() => setAdminTab('moderation')}
      >
        <Clock size={18} />
        <span>{t('admin_tab_moderation')}</span>
        <span className="admin-nav-count">{moderationCount}</span>
      </div>

      <div
        className={`admin-nav-item ${adminTab === 'dealers' ? 'active' : ''}`}
        onClick={() => setAdminTab('dealers')}
      >
        <ShieldCheck size={18} />
        <span>{t('admin_tab_dealers')}</span>
        <span className="admin-nav-count">{dealerCount}</span>
      </div>

      <div
        className={`admin-nav-item ${adminTab === 'listings' ? 'active' : ''}`}
        onClick={() => setAdminTab('listings')}
      >
        <CheckCircle2 size={18} />
        <span>{t('admin_tab_live_listings')}</span>
        <span className="admin-nav-count">{listingsCount}</span>
      </div>

      <div
        className={`admin-nav-item ${adminTab === 'notifications' ? 'active' : ''}`}
        onClick={() => setAdminTab('notifications')}
      >
        <Bell size={18} />
        <span>{t('admin_tab_notifications')}</span>
        {notificationCount > 0 ? (
          <span className="admin-nav-count" style={{ background: '#dc2626', color: '#fff' }}>
            {notificationCount}
          </span>
        ) : (
          <span className="admin-nav-count">0</span>
        )}
      </div>

      <div
        className={`admin-nav-item ${adminTab === 'admins' ? 'active' : ''}`}
        onClick={() => setAdminTab('admins')}
      >
        <Users size={18} />
        <span>{t('admin_tab_staff')}</span>
        {adminCount > 0 && <span className="admin-nav-count">{adminCount}</span>}
      </div>

      <div
        className="admin-nav-item"
        style={{ marginTop: '2rem', opacity: 0.8 }}
        onClick={onExit}
      >
        <ArrowLeft size={18} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
        <span>{t('admin_exit_marketplace')}</span>
      </div>
    </div>
  );
}
