'use client';

import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from './ThemeProvider';
import { useFastNavigation } from '@/lib/fast-navigation';
import { 
  Bell, 
  LogOut, 
  User, 
  Menu, 
  X,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

function Header({ user, onLogout }: HeaderProps) {
  const { fastNavigate, preloadRoutes } = useFastNavigation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
    // Preload routes for faster navigation
    preloadRoutes();
  }, [preloadRoutes]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      // hydrate from cache first for instant UI
      const cached = localStorage.getItem('notifications_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.unreadCount != null && parsed.ts > Date.now() - 60000) { // 1 minute cache
            setUnreadCount(parsed.unreadCount);
          }
        } catch {}
      }

      fetchUnreadCount();
      const interval = setInterval(() => {
        // only poll when tab is visible
        if (document.visibilityState === 'visible') fetchUnreadCount();
      }, 15000); // Check every 15 seconds instead of 30
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const count = Math.max(0, parseInt(data.count) || 0);
        console.log('Notification count fetched:', count); // Debug log
        setUnreadCount(count);
        // cache for instant hydration elsewhere
        try { 
          localStorage.setItem('notifications_cache', JSON.stringify({ 
            unreadCount: count, 
            ts: Date.now() 
          })); 
        } catch {}
      } else {
        console.warn('Failed to fetch unread count:', response.status);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Button functionality handlers
  const handleToggleTheme = useCallback(() => {
    if (!mounted) return;
    toggleTheme();
  }, [mounted, toggleTheme]);

  const handleLogout = useCallback(() => {
    // Clear user data immediately
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('notifications_cache');
    localStorage.removeItem('notifications_cache_full');
    
    // Call parent logout handler if provided
    if (onLogout) {
      onLogout();
    } else {
      // Immediate navigation without any delay
      window.location.href = '/auth';
    }
  }, [onLogout]);

  const handleProfileClick = useCallback(() => {
    window.location.href = '/profile';
  }, []);

  const handleNotificationClick = useCallback(() => {
    setUnreadCount(0); // Clear unread count immediately
    try { localStorage.setItem('notifications_cache', JSON.stringify({ unreadCount: 0, ts: Date.now() })); } catch {}
    window.location.href = '/notifications';
  }, []);

  return (
    <motion.header 
      className={`glass-aurora sticky top-0 z-50 transition-all duration-500 ${
        isScrolled ? 'backdrop-blur-xl border-b border-white/20' : 'backdrop-blur-lg'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 py-4 overflow-visible">
        <div className="flex items-center justify-between overflow-visible">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-coral-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-coral transition-all duration-500 border-2 border-white/30">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-coral-400 to-teal-400 rounded-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-sm"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-aurora bg-clip-text">
                  Aurora Confessions
                </h1>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  ✨ Share your story anonymously
                </p>
              </div>
            </Link>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 overflow-visible">
            {user ? (
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Theme Toggle Button */}
                <motion.button
                  onClick={handleToggleTheme}
                  className="glass-emerald p-3 rounded-2xl hover:scale-105 transition-all duration-300 group w-11 h-11 flex items-center justify-center"
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  whileTap={{ scale: 0.95 }}
                >
                  {mounted && (
                    <>
                      {theme === 'dark' ? (
                        <Sun className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700" />
                      ) : (
                        <Moon className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700" />
                      )}
                    </>
                  )}
                </motion.button>
                
                {/* Notifications Button */}
                <motion.div className="relative notification-container overflow-visible">
                  <motion.button
                    onClick={handleNotificationClick}
                    className="glass-teal p-3 rounded-2xl hover:scale-105 transition-all duration-300 group relative overflow-visible"
                    title="Notifications"
                    whileTap={{ scale: 0.95 }}
                    style={{ overflow: 'visible' }}
                  >
                    <Bell className="w-5 h-5 text-teal-600 group-hover:text-teal-700" />
                  </motion.button>
                  {/* Badge positioned outside the button for full visibility */}
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="notification-badge"
                        style={{ 
                          position: 'absolute',
                          top: '-10px',
                          right: '-10px',
                          zIndex: 9999
                        }}
                      >
                        <div className="notification-badge-inner">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Profile Button */}
                <motion.button
                  onClick={handleProfileClick}
                  className="w-10 h-10 bg-gradient-to-br from-coral-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30 hover:scale-105 transition-all duration-300"
                  title={`${user.full_name} - ${user.role === 'admin' ? 'Administrator' : 'Student'}`}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-white text-sm font-bold">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </motion.button>
                
                {/* Logout Button */}
                <motion.button
                  onClick={handleLogout}
                  className="glass-amber p-3 rounded-2xl hover:scale-105 transition-all duration-300 group"
                  title="Logout"
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-5 h-5 text-amber-600 group-hover:text-amber-700" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  href="/auth"
                  className="btn-aurora px-8 py-3 rounded-2xl flex items-center space-x-3 font-semibold"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Get Started</span>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden glass-aurora p-3 rounded-2xl"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-6 space-y-3 overflow-hidden"
            >
              <motion.button
                onClick={() => {
                  handleNotificationClick();
                  setIsMenuOpen(false);
                }}
                className="w-full glass-amber px-6 py-4 rounded-2xl text-left font-medium relative overflow-visible"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Bell className="w-5 h-5 text-amber-600" />
                    <span style={{ color: 'var(--text-primary)' }}>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <div className="relative">
                      <span className="notification-badge-inner inline-flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </motion.button>

              {/* Theme Toggle Button */}
              <motion.button
                onClick={() => {
                  handleToggleTheme();
                  setIsMenuOpen(false);
                }}
                className="w-full glass-emerald px-6 py-4 rounded-2xl text-left flex items-center space-x-4 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {mounted && (
                  <>
                    {theme === 'dark' ? (
                      <Sun className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Moon className="w-5 h-5 text-emerald-600" />
                    )}
                    <span style={{ color: 'var(--text-primary)' }}>
                      Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                    </span>
                  </>
                )}
                {!mounted && (
                  <>
                    <div className="w-5 h-5 bg-emerald-600/20 rounded animate-pulse"></div>
                    <span style={{ color: 'var(--text-primary)' }}>Theme</span>
                  </>
                )}
              </motion.button>
              
              <motion.button
                onClick={() => {
                  handleProfileClick();
                  setIsMenuOpen(false);
                }}
                className="w-full glass-teal px-6 py-4 rounded-2xl text-left flex items-center space-x-4 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <User className="w-5 h-5 text-teal-600" />
                <span style={{ color: 'var(--text-primary)' }}>Profile Settings</span>
              </motion.button>
              
              <motion.button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full glass-coral px-6 py-4 rounded-2xl text-left flex items-center space-x-4 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-5 h-5 text-coral-600" />
                <span style={{ color: 'var(--text-primary)' }}>Logout</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.header>
  );
}

  export default (React.memo(Header) as unknown) as typeof Header;