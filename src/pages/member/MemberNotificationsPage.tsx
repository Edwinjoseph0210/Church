import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { NotificationItem } from '../../types';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';

interface MemberNotificationsPageProps {
  navigate: (path: string) => void;
}

export const MemberNotificationsPage: React.FC<MemberNotificationsPageProps> = ({ navigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await apiRequest<NotificationItem[]>('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await apiRequest('/notifications/mark-all-read', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
            Parish Communications
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Notifications & Broadcasts
          </h1>
          <p className="text-xs text-stone-500 font-editorial mt-0.5">
            {unreadCount > 0
              ? `You have ${unreadCount} unread parish alert${unreadCount > 1 ? 's' : ''}.`
              : 'All notifications are caught up.'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-stone-500" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-stone-500">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center text-xs text-stone-500 bg-stone-50 rounded-xl">
          No notifications in your inbox.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 ${
                !n.isRead
                  ? 'bg-amber-50/60 border-amber-200/80 shadow-xs'
                  : 'bg-stone-50 border-stone-200/70 text-stone-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  !n.isRead ? 'bg-amber-900 text-white' : 'bg-stone-200 text-stone-600'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-bold text-stone-900">
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                    )}
                  </div>
                  <p className="text-xs text-stone-700 font-editorial">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-stone-400 font-mono pt-1">
                    <span>{n.createdAt.split('T')[0]}</span>
                    {n.link && (
                      <button
                        onClick={() => navigate(n.link!)}
                        className="text-amber-900 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="px-2.5 py-1 text-[11px] text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-md shrink-0 cursor-pointer"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
