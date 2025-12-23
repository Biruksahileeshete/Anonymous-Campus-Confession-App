'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  confession_id?: string;
  confession_content?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        try { 
          localStorage.setItem('notifications_cache_full', JSON.stringify({ 
            notifications: data, 
            ts: Date.now() 
          })); 
        } catch (e) {
          console.warn('Failed to cache notifications:', e);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [setNotifications, setLoading]); // ✅ Added dependencies

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      router.push('/auth');
      return;
    }

    const parsed = JSON.parse(userData);
    setUser(parsed);

    // show cached notifications first for instant UI
    try {
      const cached = localStorage.getItem('notifications_cache_full');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (Array.isArray(parsedCache.notifications)) {
          setNotifications(parsedCache.notifications);
          setLoading(false);
        }
      }
    } catch (e) {
      console.warn('Failed to load cache:', e);
    }

    // fetch fresh in background
    fetchNotifications();

    // listen for global refresh events
    const onRefresh = () => {
      setLoading(true);
      fetchNotifications();
    };
    window.addEventListener('aurora:refresh', onRefresh as EventListener);
    return () => window.removeEventListener('aurora:refresh', onRefresh as EventListener);
  }, [router, fetchNotifications]); // ✅ fetchNotifications is now defined

  const markAsRead = useCallback(async (notificationId: string) => {
    // optimistic update
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId })
      });

      // update cache
      try {
        const cached = localStorage.getItem('notifications_cache_full');
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.notifications = parsed.notifications.map((n: Notification) => 
            n.id === notificationId ? { ...n, is_read: true } : n
          );
          localStorage.setItem('notifications_cache_full', JSON.stringify(parsed));
        }
      } catch (e) {
        console.warn('Failed to update cache:', e);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // revert optimistic update on error
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: false } : n));
    }
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'like': return '👍';
      case 'comment': return '💬';
      case 'report_resolved': return '✅';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-red-500/20 border-red-500/30 text-red-200';
      case 'like': return 'bg-blue-500/20 border-blue-500/30 text-blue-200';
      case 'comment': return 'bg-green-500/20 border-green-500/30 text-green-200';
      case 'report_resolved': return 'bg-purple-500/20 border-purple-500/30 text-purple-200';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/auth');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-aurora p-8">
          <div className="loading-aurora mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div>
            <h1 className="text-4xl font-bold text-aurora mb-2">📢 Notifications</h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Stay updated with your activity</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="card-aurora p-12 max-w-md mx-auto">
              <div className="loading-aurora mx-auto mb-4"></div>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading notifications...</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="card-aurora p-12 text-center">
            <div className="text-6xl mb-6">🔔</div>
            <h3 className="text-2xl font-bold text-aurora mb-3">No Notifications</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You're all caught up! New notifications will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`glass rounded-2xl p-6 backdrop-blur-lg border-l-4 cursor-pointer transition-all hover:scale-[1.02] ${
                  notification.is_read ? 'opacity-70' : ''
                } ${getNotificationColor(notification.type)}`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div>
                      <h3 className="font-bold text-white">{notification.title}</h3>
                      <p className="text-white/60 text-sm">{formatDate(notification.created_at)}</p>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                  )}
                </div>

                <p className="text-white/90 mb-4">{notification.message}</p>

                {notification.confession_content && (
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-white/80 text-sm italic">
                      "{notification.confession_content}"
                    </p>
                  </div>
                )}

                {!notification.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    className="mt-3 text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}