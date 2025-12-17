'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BarChart3, Flag, MessageSquare, Users, LogOut, Zap } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
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
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/auth');
  };

  return (
    <div className="w-64 glass-strong h-screen fixed left-0 top-0 z-40" style={{ borderRight: `1px solid var(--border-primary)` }}>
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-coral-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30">
            <Zap className="w-8 h-8 text-white admin-logo-icon" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-aurora">Admin Panel</h1>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Aurora Confessions</p>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="mb-8 glass p-4 rounded-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-coral-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30">
                <span className="text-white text-lg font-bold admin-logo-icon">
                  {user.full_name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {user.full_name || 'Admin'}
                </p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  Administrator
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 font-medium group ${
                pathname === item.href
                  ? 'btn-aurora shadow-xl'
                  : 'glass-aurora hover:glass-strong'
              }`}
              style={pathname !== item.href ? { color: 'var(--text-primary)' } : {}}
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 admin-icon" />
              <span>{item.label}</span>
            </Link>
          ))}
          
          
          {/* Separator */}
          <div className="border-t border-white/10 my-4"></div>
          
          {/* Dedicated Users Button */}
          <Link
            href="/admin/users"
            className={`flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 font-medium group ${
              pathname === '/admin/users'
                ? 'btn-aurora shadow-xl'
                : 'glass-emerald hover:glass-strong hover:scale-105'
            }`}
            style={pathname !== '/admin/users' ? { color: 'var(--text-primary)' } : {}}
          >
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 admin-icon" />
            <span>👥 User Management</span>
          </Link>
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 w-full font-medium group glass-aurora hover:glass-strong hover:border-red-500/30"
          style={{ color: 'var(--text-primary)' }}
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 admin-icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}