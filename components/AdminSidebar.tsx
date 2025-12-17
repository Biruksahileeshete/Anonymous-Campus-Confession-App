'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BarChart3, Flag, MessageSquare, Users, LogOut, Zap } from 'lucide-react';

export default function AdminSidebar() {
  let pathname = '';
  let router: any = null;
  
  try {
    pathname = usePathname();
    router = useRouter();
  } catch (error) {
    console.error('Router context error:', error);
    // Fallback to window location if available
    if (typeof window !== 'undefined') {
      pathname = window.location.pathname;
    }
  }
  
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const menuItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: BarChart3
    },
    {
      href: '/admin/reports',
      label: 'Reports',
      icon: Flag
    },
    {
      href: '/admin/confessions',
      label: 'Confessions',
      icon: MessageSquare
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: Users
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (router) {
      router.push('/auth');
    } else {
      // Fallback navigation
      window.location.href = '/auth';
    }
  };

  return (
    <div className="w-64 glass-strong h-screen fixed left-0 top-0 z-40 flex flex-col" style={{ borderRight: `1px solid var(--border-primary)` }}>
      {/* Admin Header Section - Flexible */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-coral-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/30 flex-shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-aurora truncate">Admin Panel</h1>
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>Aurora Confessions</p>
          </div>
        </div>
      </div>

      {/* User Info Section */}
      {user && (
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-coral-500 to-teal-500 rounded-xl flex items-center justify-center shadow border border-white/30 flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {user.full_name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {user.full_name || 'Admin'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                Administrator
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu - Flexible Section */}
      <div className="flex-1 overflow-y-auto p-3">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-5 rounded-xl transition-all duration-300 font-semibold text-base group ${
                pathname === item.href
                  ? 'btn-aurora shadow-lg'
                  : 'glass-aurora hover:glass-strong'
              }`}
              style={pathname !== item.href ? { color: 'var(--text-primary)' } : {}}
            >
              <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section - Logout Button */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-5 rounded-xl transition-all duration-300 w-full font-semibold text-base group glass-aurora hover:glass-strong hover:border-red-500/30"
          style={{ color: 'var(--text-primary)' }}
        >
          <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}