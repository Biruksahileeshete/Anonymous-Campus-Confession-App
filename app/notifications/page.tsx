'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      router.push('/auth');
      return;
    }

    setUser(JSON.parse(userData));
    fetchNotifications();
  }, [router]);

  const fetchNotifications = async () => {
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
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
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

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📢 Notifications</h1>
          <p className="text-white/70 text-lg">Stay updated with your activity</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center backdrop-blur-lg">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-white mb-2">No Notifications</h3>
            <p className="text-white/70">You're all caught up! New notifications will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`glass rounded-2xl p-6 backdrop-blur-lg border-l-4 ${
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
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
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
                    className="mt-3 text-blue-300 hover:text-blue-200 text-sm font-medium"
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