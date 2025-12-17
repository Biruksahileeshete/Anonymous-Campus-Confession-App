'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  RefreshCw, 
  LogOut, 
  User, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
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
    <motion.header 
      className={`glass-aurora sticky top-0 z-50 transition-all duration-500 ${
        isScrolled ? 'backdrop-blur-xl border-b border-white/20' : 'backdrop-blur-lg'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
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
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Reload Button */}
                <motion.button
                  onClick={() => window.location.reload()}
                  className="glass-coral p-3 rounded-2xl hover:scale-110 transition-all duration-300 group"
                  title="Refresh Feed"
                  whileHover={{ rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <RefreshCw className="w-5 h-5 text-coral-600 group-hover:text-coral-700" />
                </motion.button>

                {/* Theme Toggle Button */}
                <ThemeToggle />
                
                {/* Notifications */}
                <motion.div className="relative">
                  <Link
                    href="/notifications"
                    className="glass-teal p-3 rounded-2xl hover:scale-110 transition-all duration-300 group relative"
                    onClick={() => setUnreadCount(0)}
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5 text-teal-600 group-hover:text-teal-700" />
                    <AnimatePresence>
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-2 -right-2 badge-aurora text-xs min-w-[20px] h-5 flex items-center justify-center"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>

                {/* Profile */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/profile"
                    className="card-aurora p-2 rounded-full hover:shadow-aurora transition-all duration-300"
                    title={`${user.full_name} - ${user.role === 'admin' ? 'Administrator' : 'Student'}`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-coral-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                        <span className="text-white text-sm font-bold">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-coral-400 to-teal-400 rounded-full opacity-20 blur-sm"></div>
                    </div>
                  </Link>
                </motion.div>
                
                {/* Logout */}
                <motion.button
                  onClick={onLogout}
                  className="glass-amber p-3 rounded-2xl hover:scale-110 transition-all duration-300 group"
                  title="Logout"
                  whileHover={{ rotate: -10 }}
                  whileTap={{ scale: 0.9 }}
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
                  window.location.reload();
                  setIsMenuOpen(false);
                }}
                className="w-full glass-coral px-6 py-4 rounded-2xl text-left flex items-center space-x-4 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-5 h-5 text-coral-600" />
                <span style={{ color: 'var(--text-primary)' }}>Refresh Feed</span>
              </motion.button>
              
              <motion.div>
                <Link
                  href="/notifications"
                  className="block w-full glass-teal px-6 py-4 rounded-2xl font-medium"
                  onClick={() => {
                    setUnreadCount(0);
                    setIsMenuOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Bell className="w-5 h-5 text-teal-600" />
                      <span style={{ color: 'var(--text-primary)' }}>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="badge-aurora text-xs">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
              
              <motion.div>
                <Link
                  href="/profile"
                  className="block w-full glass-emerald px-6 py-4 rounded-2xl font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center space-x-4">
                    <User className="w-5 h-5 text-emerald-600" />
                    <span style={{ color: 'var(--text-primary)' }}>Profile Settings</span>
                  </div>
                </Link>
              </motion.div>
              
              <motion.button
                onClick={() => {
                  onLogout?.();
                  setIsMenuOpen(false);
                }}
                className="w-full glass-amber px-6 py-4 rounded-2xl text-left flex items-center space-x-4 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-5 h-5 text-amber-600" />
                <span style={{ color: 'var(--text-primary)' }}>Logout</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}