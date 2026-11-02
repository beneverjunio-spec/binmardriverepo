import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Car,
  ShieldCheck,
  CheckCheck,
  Trash2,
  ExternalLink,
  Clock,
  Filter
} from 'lucide-react';

export default function NotificationsTab({
  notifications = [],
  setNotifications,
  setAdminTab,
  notify
}) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread' | 'moderation' | 'dealers'

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    setNotifications(updated);
    try {
      localStorage.setItem('binmar_admin_notifications', JSON.stringify(updated));
    } catch {}
    fetch('/api/notifications/read-all', { method: 'PUT' }).catch(() => {});
    notify('All notifications marked as read.');
  };

  const handleClearAll = () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    setNotifications([]);
    try {
      localStorage.setItem('binmar_admin_notifications', JSON.stringify([]));
    } catch {}
    notify('All notifications cleared.');
  };

  const handleToggleRead = (id) => {
    const updated = notifications.map(n => (n.id === id ? { ...n, is_read: !n.is_read } : n));
    setNotifications(updated);
    try {
      localStorage.setItem('binmar_admin_notifications', JSON.stringify(updated));
    } catch {}
    fetch(`/api/notifications/${id}/read`, { method: 'PUT' }).catch(() => {});
  };

  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'unread') return !n.is_read;
    if (filterType === 'moderation') {
      const text = `${n.title} ${n.message}`.toLowerCase();
      return text.includes('vehicle') || text.includes('listing') || text.includes('moderation') || text.includes('reject');
    }
    if (filterType === 'dealers') {
      const text = `${n.title} ${n.message}`.toLowerCase();
      return text.includes('dealer') || text.includes('license') || text.includes('seller') || text.includes('verification');
    }
    return true;
  });

  const getNotifIcon = (n) => {
    const text = `${n.title} ${n.message}`.toLowerCase();
    if (text.includes('reject')) {
      return <AlertTriangle size={18} style={{ color: '#ef4444' }} />;
    }
    if (text.includes('dealer') || text.includes('license') || text.includes('verification')) {
      return <ShieldCheck size={18} style={{ color: '#4ade80' }} />;
    }
    if (text.includes('vehicle') || text.includes('listing') || text.includes('car')) {
      return <Car size={18} style={{ color: 'var(--gold, #d4af37)' }} />;
    }
    return <Bell size={18} style={{ color: '#60a5fa' }} />;
  };

  const getActionTarget = (n) => {
    const text = `${n.title} ${n.message}`.toLowerCase();
    if (text.includes('dealer') || text.includes('license') || text.includes('verification')) {
      return { tab: 'dealers', label: 'Go to Dealer Verification' };
    }
    if (text.includes('vehicle') || text.includes('listing') || text.includes('moderation')) {
      return { tab: 'moderation', label: 'Inspect in Moderation Queue' };
    }
    return null;
  };

  return (
    <div className="panel">
      {/* Top Header */}
      <div className="panel-head" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold, #d4af37)'
            }}>
              <Bell size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Admin Notification Center</h2>
              <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Complete activity logs and real-time alerts across dealer registrations, vehicle moderation, and seller actions.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '6px',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                color: '#4ade80',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <CheckCheck size={14} /> Mark All Read ({unreadCount})
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setFilterType('all')}
          style={{
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: filterType === 'all' ? '1px solid var(--gold, #d4af37)' : '1px solid rgba(255, 255, 255, 0.15)',
            background: filterType === 'all' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
            color: filterType === 'all' ? 'var(--gold, #d4af37)' : '#94a3b8'
          }}
        >
          All ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('unread')}
          style={{
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: filterType === 'unread' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)',
            background: filterType === 'unread' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
            color: filterType === 'unread' ? '#f59e0b' : '#94a3b8'
          }}
        >
          Unread ({unreadCount})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('moderation')}
          style={{
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: filterType === 'moderation' ? '1px solid var(--gold, #d4af37)' : '1px solid rgba(255, 255, 255, 0.15)',
            background: filterType === 'moderation' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
            color: filterType === 'moderation' ? 'var(--gold, #d4af37)' : '#94a3b8'
          }}
        >
          Vehicle Moderation
        </button>

        <button
          type="button"
          onClick={() => setFilterType('dealers')}
          style={{
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: filterType === 'dealers' ? '1px solid #4ade80' : '1px solid rgba(255, 255, 255, 0.15)',
            background: filterType === 'dealers' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
            color: filterType === 'dealers' ? '#4ade80' : '#94a3b8'
          }}
        >
          Dealer Verification
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((n) => {
            const action = getActionTarget(n);
            const dateStr = n.created_at ? new Date(n.created_at).toLocaleString() : 'Recent';

            return (
              <div
                key={n.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '10px',
                  background: n.is_read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(212, 175, 55, 0.07)',
                  border: n.is_read ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(212, 175, 55, 0.35)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '14px',
                  transition: 'all 0.2s',
                  boxShadow: n.is_read ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: n.is_read ? 'rgba(255, 255, 255, 0.05)' : 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {getNotifIcon(n)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc' }}>
                        {n.title}
                      </h4>
                      {!n.is_read && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.4)'
                        }}>
                          New
                        </span>
                      )}
                    </div>

                    <p style={{ margin: '4px 0 8px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.45' }}>
                      {n.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {dateStr}
                      </span>

                      {action && (
                        <button
                          type="button"
                          onClick={() => setAdminTab(action.tab)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--gold, #d4af37)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: 0
                          }}
                        >
                          {action.label} &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleRead(n.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '5px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: n.is_read ? '#64748b' : '#94a3b8',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    title={n.is_read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {n.is_read ? 'Mark Unread' : 'Mark Read'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.1)'
          }}>
            <Bell size={36} style={{ color: '#475569', margin: '0 auto 10px', display: 'block' }} />
            <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem', fontWeight: 700 }}>
              No notifications in this view
            </h4>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.82rem' }}>
              All activity and operational alerts will appear here as dealers register and vehicles are submitted.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
