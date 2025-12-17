'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
// Using simple icons to avoid TypeScript issues

interface DashboardStats {
  totalConfessions: number;
  totalReports: number;
  totalComments: number;
  hiddenConfessions: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalConfessions: 0,
    totalReports: 0,
    totalComments: 0,
    hiddenConfessions: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, gradient }: {
    title: string;
    value: number;
    icon: string;
    gradient: string;
  }) => (
    <div className="card-aurora p-8 hover:glass-strong transition-all duration-300 group animate-slideInUp h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div className="pr-4">
            <p className="text-base font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>{title}</p>
            <p className="text-5xl font-bold text-aurora">{value}</p>
          </div>
          <div className={`w-20 h-20 flex-shrink-0 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 border-2 border-white/20`}>
            <span className="text-4xl text-white drop-shadow-lg">{icon}</span>
          </div>
        </div>
        
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2" style={{ color: 'var(--text-secondary)' }}>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-10 animate-slideInUp">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-coral-500 via-teal-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30">
                <span className="text-3xl text-white drop-shadow-lg">📊</span>
              </div>
              <div>
                <h1 className="text-5xl font-bold text-aurora">Admin Dashboard</h1>
                <p className="text-xl mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Monitor and manage campus confession activity
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="card-aurora p-12 max-w-md mx-auto">
                <div className="loading-aurora mx-auto mb-4"></div>
                <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-8 mb-10">
                {/* Top row - 3 large boxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon="👥"
                    gradient="from-coral-500 to-coral-600"
                  />
                  <StatCard
                    title="Total Confessions"
                    value={stats.totalConfessions}
                    icon="💭"
                    gradient="from-teal-500 to-teal-600"
                  />
                  <StatCard
                    title="Pending Reports"
                    value={stats.totalReports}
                    icon="🚩"
                    gradient="from-red-500 to-red-600"
                  />
                </div>

                {/* Bottom row - 2 large boxes spanning more width */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StatCard
                    title="Total Comments"
                    value={stats.totalComments}
                    icon="💬"
                    gradient="from-amber-500 to-amber-600"
                  />
                  <StatCard
                    title="Hidden Posts"
                    value={stats.hiddenConfessions}
                    icon="👁️"
                    gradient="from-emerald-500 to-emerald-600"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}