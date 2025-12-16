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

  const StatCard = ({ title, value, icon, gradient }: {
    title: string;
    value: number;
    icon: string;
    gradient: string;
  }) => (
    <div className="glass rounded-3xl p-6 hover:glass-strong transition-all duration-300 group animate-slideInUp">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{title}</p>
          <p className="text-4xl font-bold gradient-text">{value}</p>
        </div>
        <div className={`w-16 h-16 ${gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-2xl">{icon}</span>
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h1 className="text-5xl font-bold gradient-text">Admin Dashboard</h1>
                <p className="text-xl mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Monitor and manage campus confession activity
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="glass-strong p-12 rounded-3xl max-w-md mx-auto">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-current mx-auto mb-4" style={{ color: 'var(--primary-500)' }}></div>
                <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon="👥"
                  gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                />
                <StatCard
                  title="Total Confessions"
                  value={stats.totalConfessions}
                  icon="💭"
                  gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                  title="Pending Reports"
                  value={stats.totalReports}
                  icon="🚩"
                  gradient="bg-gradient-to-br from-red-500 to-red-600"
                />
                <StatCard
                  title="Total Comments"
                  value={stats.totalComments}
                  icon="💬"
                  gradient="bg-gradient-to-br from-green-500 to-green-600"
                />
                <StatCard
                  title="Hidden Posts"
                  value={stats.hiddenConfessions}
                  icon="👁️"
                  gradient="bg-gradient-to-br from-gray-500 to-gray-600"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-strong rounded-3xl p-8 animate-slideInUp" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <span className="text-xl">📈</span>
                    </div>
                    <h3 className="text-2xl font-bold gradient-text">Recent Activity</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="glass p-4 rounded-2xl hover:glass-strong transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                          <span className="text-xl">💭</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>New confession posted</p>
                          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>2 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="glass p-4 rounded-2xl hover:glass-strong transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                          <span className="text-xl">🚩</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Content reported</p>
                          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>15 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="glass p-4 rounded-2xl hover:glass-strong transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                          <span className="text-xl">💬</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>New comment added</p>
                          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-strong rounded-3xl p-8 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                      <span className="text-xl">⚡</span>
                    </div>
                    <h3 className="text-2xl font-bold gradient-text">Quick Actions</h3>
                  </div>
                  <div className="space-y-4">
                    <button className="w-full glass p-4 rounded-2xl hover:glass-strong transition-all duration-300 text-left group">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <span className="text-xl">🚩</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Review Reports</p>
                          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Check flagged content</p>
                        </div>
                      </div>
                    </button>
                    <button className="w-full glass p-4 rounded-2xl hover:glass-strong transition-all duration-300 text-left group">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <span className="text-xl">📊</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>View Analytics</p>
                          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Platform statistics</p>
                        </div>
                      </div>
                    </button>
                    <button className="w-full glass p-4 rounded-2xl hover:glass-strong transition-all duration-300 text-left group">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <span className="text-xl">⚙️</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</p>
                          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Platform configuration</p>
                        </div>
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