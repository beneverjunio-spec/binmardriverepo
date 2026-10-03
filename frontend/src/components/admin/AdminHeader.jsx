import React, { useState } from 'react';
import { Bell } from 'lucide-react';

export default function AdminHeader({ notifications = [] }) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="admin-header">
      <h1>Admin Operations Portal</h1>
      <div className="notif-bell-wrap">
        <div className="notif-bell" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
          <Bell size={20} color="var(--deep)" />
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </div>

        {showNotifDropdown && (
          <div className="notif-dropdown">
            <div className="notif-head">Real-time Admin Notifications</div>
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                  <div className="notif-item-title">{n.title}</div>
                  <div>{n.message}</div>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--ink-2)' }}>
                No new notifications
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
