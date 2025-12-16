'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

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

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: number;
    icon: string;
    color: string;
  }) => (
    <div className={`${color} rounded-2xl p-6 text-white backdrop-blur-sm border border-white/10`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/70 text-lg">Monitor and manage campus confession activity</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon="👥"
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                />
                <StatCard
                  title="Total Confessions"
                  value={stats.totalConfessions}
                  icon="💭"
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                  title="Pending Reports"
                  value={stats.totalReports}
                  icon="🚩"
                  color="bg-gradient-to-br from-red-500 to-red-600"
                />
                <StatCard
                  title="Total Comments"
                  value={stats.totalComments}
                  icon="💬"
                  color="bg-gradient-to-br from-green-500 to-green-600"
                />
                <StatCard
                  title="Hidden Posts"
                  value={stats.hiddenConfessions}
                  icon="👁️"
                  color="bg-gradient-to-br from-gray-500 to-gray-600"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                  <h3 className="text-lg font-bold mb-4 text-white">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                      <span className="text-blue-300 text-xl">💭</span>
                      <div>
                        <p className="text-sm font-medium text-white">New confession posted</p>
                        <p className="text-xs text-gray-300">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                      <span className="text-red-300 text-xl">🚩</span>
                      <div>
                        <p className="text-sm font-medium text-white">Content reported</p>
                        <p className="text-xs text-gray-300">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                      <span className="text-green-300 text-xl">💬</span>
                      <div>
                        <p className="text-sm font-medium text-white">New comment added</p>
                        <p className="text-xs text-gray-300">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                  <h3 className="text-lg font-bold mb-4 text-white">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center space-x-3 p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl border border-red-500/30 transition text-left">
                      <span className="text-red-300 text-xl">🚩</span>
                      <div>
                        <p className="font-medium text-white">Review Reports</p>
                        <p className="text-sm text-gray-300">Check flagged content</p>
                      </div>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl border border-blue-500/30 transition text-left">
                      <span className="text-blue-300 text-xl">📊</span>
                      <div>
                        <p className="font-medium text-white">View Analytics</p>
                        <p className="text-sm text-gray-300">Platform statistics</p>
                      </div>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 bg-gray-500/20 hover:bg-gray-500/30 rounded-xl border border-gray-500/30 transition text-left">
                      <span className="text-gray-300 text-xl">⚙️</span>
                      <div>
                        <p className="font-medium text-white">Settings</p>
                        <p className="text-sm text-gray-300">Platform configuration</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}