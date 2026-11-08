import React from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminHeader({
  notifications = [],
  onOpenNotifications,
  onRefresh,
  isRefreshing = false,
  lastRefreshedAt
}) {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>{t('admin_portal_header')}</h1>
        {lastRefreshedAt && (
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
            • Auto-syncing
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`admin-refresh-pill ${isRefreshing ? 'loading' : ''}`}
            title="Refresh all admin data immediately"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1.5px solid var(--card-border)',
              background: '#fff',
              color: 'var(--ink)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: isRefreshing ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin-icon' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        )}

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
