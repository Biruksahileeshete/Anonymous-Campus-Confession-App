'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
  student_id: string;
  role: 'user' | 'admin';
}

interface HeaderProps {
  user?: User;
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">🎭</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                Campus Confessions
              </h1>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            {user ? (
              <>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-br from-indigo-500 to-purple-500 backdrop-blur-sm text-white p-2 rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
                  title="Reload"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2M15 15v5h-.582M8.644 21A8.001 8.001 0 0019.418 15m0 0V15a8 8 0 00-15.356-2" />
                  </svg>
                </button>
                
                <Link
                  href="/notifications"
                  className="bg-gradient-to-br from-indigo-500 to-purple-500 backdrop-blur-sm text-white p-2 rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg relative"
                  onClick={() => setUnreadCount(0)}
                  title="Notifications"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium">
                    {user.full_name?.split(' ')[0] || 'User'}
                  </span>
                </Link>
                
                <button
                  onClick={onLogout}
                  className="bg-gradient-to-br from-indigo-500 to-purple-500 backdrop-blur-sm text-white p-2 rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2"
              >
                <span>🚀</span>
                <span>Get Started</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && user && (
          <div className="md:hidden mt-4 space-y-2 animate-slideIn">
            <button
              onClick={() => {
                window.location.reload();
                setIsMenuOpen(false);
              }}
              className="w-full bg-gradient-to-br from-indigo-500 to-purple-500 backdrop-blur-sm text-white px-4 py-3 rounded-lg text-left flex items-center space-x-2 hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2M15 15v5h-.582M8.644 21A8.001 8.001 0 0019.418 15m0 0V15a8 8 0 00-15.356-2" />
              </svg>
              <span>Reload</span>
            </button>
            <Link
              href="/notifications"
              className="block w-full bg-gradient-to-br from-indigo-500 to-purple-500 backdrop-blur-sm text-white px-4 py-3 rounded-lg relative hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
              onClick={() => {
                setUnreadCount(0);
                setIsMenuOpen(false);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            </Link>
            <Link
              href="/profile"
              className="block w-full bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              👤 Profile Settings
            </Link>
            <button
              onClick={() => {
                onLogout?.();
                setIsMenuOpen(false);
              }}
              className="w-full bg-gradient-to-br from-indigo-500 to-purple-500 backdrop-blur-sm text-white px-4 py-3 rounded-lg text-left flex items-center space-x-2 hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013-3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}