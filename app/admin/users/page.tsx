'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Users, Search, RefreshCw, Crown, User, FileText, Calendar, Ban, Trash2 } from 'lucide-react';

// Dynamically import AdminSidebar to avoid SSR issues
const AdminSidebar = dynamic(() => import('@/components/AdminSidebar'), {
  ssr: false,
  loading: () => <div className="w-64 h-screen bg-gray-100 animate-pulse" />
});

interface User {
  id: string;
  email: string;
  full_name: string;
  student_id: string;
  role: 'user' | 'admin';
  created_at: string;
  confession_count?: number;
  last_active?: string;
  is_banned?: boolean;
  ban_reason?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchUsers();
    }
  }, [mounted]);

  const fetchUsers = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users:', response.status);
        alert('Failed to load users. Please refresh the page.');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    if (typeof window === 'undefined') return;
    
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, role: newRole })
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        // Show success message without blocking
        setTimeout(() => {
          alert(`✅ User role updated to ${newRole === 'admin' ? '👑 Admin' : '👤 User'}`);
        }, 100);
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to update role: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('❌ Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (typeof window === 'undefined') return;
    
    const user = users.find(u => u.id === userId);
    if (!confirm(`⚠️ Are you sure you want to delete "${user?.full_name}"?\n\nThis will permanently delete:\n• User account\n• All their confessions\n• All their comments\n• All their reactions\n\nThis action CANNOT be undone!`)) {
      return;
    }

    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        setTimeout(() => {
          alert('✅ User deleted successfully');
        }, 100);
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to delete user: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen">
        <div className="w-64 h-screen bg-gray-100 animate-pulse" />
        <div className="flex-1 ml-64 p-8">
          <div className="card-aurora p-12 text-center">
            <div className="loading-aurora mx-auto mb-4"></div>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8 animate-slideInUp">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-coral-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30">
                <Users className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-aurora">User Management</h1>
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                  Manage user accounts and permissions
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card-aurora p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or student ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-modern w-full pl-12 pr-4 py-3"
                    style={{ paddingLeft: '3rem' }}
                  />
                </div>
              </div>
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}
                  className="input-modern py-3 px-4"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="card-aurora p-12 max-w-md mx-auto">
                <div className="loading-aurora mx-auto mb-4"></div>
                <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading users...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-aurora">
                  {filteredUsers.length} Users Found
                </h2>
                <div className="flex gap-4 items-center">
                  <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="btn-aurora px-4 py-2 text-sm rounded-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Loading...' : 'Refresh'}
                  </button>
                  <div className="flex gap-2 text-sm">
                    <span className="glass-coral px-3 py-1 rounded-full flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      {users.filter(u => u.role === 'admin').length} Admins
                    </span>
                    <span className="glass-teal px-3 py-1 rounded-full flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {users.filter(u => u.role === 'user').length} Users
                    </span>
                    <span className="glass-amber px-3 py-1 rounded-full flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {users.reduce((sum, u) => sum + (u.confession_count || 0), 0)} Total Confessions
                    </span>
                  </div>
                </div>
              </div>

              {filteredUsers.map((user) => (
                <div key={user.id} className="card-aurora p-6 hover:scale-[1.01] transition-transform">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-coral-500 to-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                          {user.full_name}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {user.email}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                          {user.student_id} • Joined {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${
                          user.role === 'admin' 
                            ? 'bg-gradient-to-r from-coral-500 to-amber-500 text-white' 
                            : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
                        }`}>
                          {user.role === 'admin' ? <><Crown className="w-4 h-4" /> Admin</> : <><User className="w-4 h-4" /> User</>}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                          disabled={actionLoading === user.id}
                          className="input-modern text-sm py-2 px-3 disabled:opacity-50"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>

                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {actionLoading === user.id ? (
                            <>
                              <div className="loading-aurora w-4 h-4"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <span className="glass-amber px-3 py-1 rounded-full flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {user.confession_count || 0} Confessions
                    </span>
                    <span className="glass-emerald px-3 py-1 rounded-full flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {formatDate(user.created_at)}
                    </span>
                    {user.is_banned && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                        <Ban className="w-4 h-4" />
                        Banned
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="card-aurora p-12 text-center">
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold text-aurora mb-2">No Users Found</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}