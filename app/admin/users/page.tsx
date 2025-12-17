'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-aurora mb-2">👥 User Management</h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Manage user accounts and permissions
            </p>
          </div>

          {/* Filters */}
          <div className="card-aurora p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="🔍 Search users by name, email, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-modern w-full"
                />
              </div>
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}
                  className="input-modern"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-coral-500 mx-auto"></div>
              <p className="mt-4 text-xl">🚀 Loading users...</p>
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
                    className="btn-aurora px-4 py-2 text-sm rounded-lg disabled:opacity-50"
                  >
                    {loading ? '🔄 Loading...' : '🔄 Refresh'}
                  </button>
                  <div className="flex gap-2 text-sm">
                    <span className="glass-coral px-3 py-1 rounded-full">
                      👑 {users.filter(u => u.role === 'admin').length} Admins
                    </span>
                    <span className="glass-teal px-3 py-1 rounded-full">
                      👤 {users.filter(u => u.role === 'user').length} Users
                    </span>
                    <span className="glass-amber px-3 py-1 rounded-full">
                      📝 {users.reduce((sum, u) => sum + (u.confession_count || 0), 0)} Total Confessions
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
                          📧 {user.email}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                          🎓 {user.student_id} • Joined {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          user.role === 'admin' 
                            ? 'bg-gradient-to-r from-coral-500 to-amber-500 text-white' 
                            : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
                        }`}>
                          {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                          disabled={actionLoading === user.id}
                          className="input-modern text-sm py-2 px-3 disabled:opacity-50"
                        >
                          <option value="user">👤 User</option>
                          <option value="admin">👑 Admin</option>
                        </select>

                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {actionLoading === user.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Deleting...
                            </>
                          ) : (
                            <>🗑️ Delete</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <span className="glass-amber px-3 py-1 rounded-full">
                      📝 {user.confession_count || 0} Confessions
                    </span>
                    <span className="glass-emerald px-3 py-1 rounded-full">
                      📅 Joined {formatDate(user.created_at)}
                    </span>
                    {user.is_banned && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full">
                        🚫 Banned
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="card-aurora p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
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