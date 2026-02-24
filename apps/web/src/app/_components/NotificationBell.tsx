'use client';

import { useState, useEffect, useRef } from 'react';

interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.ok ? r.json() : [])
      .then((data: Notification[]) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => null);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications([]);
      setOpen(false);
    } finally {
      setMarking(false);
    }
  };

  const unread = notifications.length;

  return (
    <div className="notif-bell" ref={containerRef}>
      <button
        className="notif-bell__btn"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M8 1a4.5 4.5 0 0 0-4.5 4.5c0 2.1-.6 3.3-1.1 4H13.6c-.5-.7-1.1-1.9-1.1-4A4.5 4.5 0 0 0 8 1z"
            stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"
          />
          <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        </svg>
        {unread > 0 && (
          <span className="notif-bell__badge" aria-hidden="true">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-bell__dropdown" role="dialog" aria-label="Notifications">
          <div className="notif-bell__header">
            <span className="notif-bell__title">Notifications</span>
            {unread > 0 && (
              <button
                className="notif-bell__mark-read"
                onClick={markAllRead}
                disabled={marking}
              >
                {marking ? '…' : 'Mark all read'}
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="notif-bell__empty">No new notifications</p>
          ) : (
            <ul className="notif-bell__list">
              {notifications.map(n => (
                <li key={n.id} className="notif-bell__item">
                  <span className="notif-bell__item-title">{n.title}</span>
                  <span className="notif-bell__item-body">{n.body}</span>
                  <span className="notif-bell__item-time">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
