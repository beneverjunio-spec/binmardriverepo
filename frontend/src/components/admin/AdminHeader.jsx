import React from 'react';
import { Bell } from 'lucide-react';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminHeader({ notifications = [], onOpenNotifications }) {
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const { t } = useLanguage();

  const handleBellClick = (e) => {
    e.preventDefault();
    if (onOpenNotifications) {
      onOpenNotifications();
    }
  };

  return (
    <div className="admin-header">
      <h1>{t('admin_portal_header')}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <LanguageSwitcher style={{ background: 'rgba(10, 42, 31, 0.08)', borderColor: 'rgba(198, 161, 91, 0.4)' }} />
        <div className="notif-bell-wrap">
          <div
            className="notif-bell"
            onClick={handleBellClick}
            title="Click to view full Notifications Screen"
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
          >
            <Bell size={20} color="var(--deep)" />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
