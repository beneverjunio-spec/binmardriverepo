import React from 'react';
import { Bell, ExternalLink } from 'lucide-react';

export default function AdminHeader({ notifications = [], onOpenNotifications }) {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleBellClick = (e) => {
    e.preventDefault();
    if (onOpenNotifications) {
      onOpenNotifications();
    }
  };

  return (
    <div className="admin-header">
      <h1>Admin Operations Portal</h1>
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
  );
}
