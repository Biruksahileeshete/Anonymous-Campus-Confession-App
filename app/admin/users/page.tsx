'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

interface User {
  id: string;
  email: string;
  full_name: string;
  student_id: string;
  role: string;
  created_at: string;
  is_banned: boolean;
  ban_reason?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);

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
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, userId: string, newRole?: string) => {
    let reason = '';
    
    if (action === 'delete_user') {
      if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
      }
      reason = 'Admin deletion';
    } else if (action === 'change_role') {
      if (!newRole) return;
      reason = `Role changed to ${newRole}`;
    } else {
      reason = prompt(`Enter reason for ${action}:`);
      if (!reason) return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          targetId: userId,
          reason,
          newRole
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchUsers(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to perform action');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('An error occurred');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
            <p className="text-white/70 text-lg">Manage user accounts and permissions</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-white mb-2">No Users Yet</h3>
              <p className="text-white/70">Users will appear here once they register</p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-white font-medium">User</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Student ID</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Role</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Status</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Joined</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((user) => (
                      <tr key={user.id} className={user.is_banned ? 'opacity-50' : ''}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {user.full_name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.full_name}</p>
                              <p className="text-white/60 text-sm">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/80">{user.student_id}</td>
                        <td className="px-6 py-4">
                          {editingRole === user.id ? (
                            <div className="flex items-center space-x-2">
                              <select
                                value={user.role}
                                onChange={(e) => {
                                  const newRole = e.target.value;
                                  handleAction('change_role', user.id, newRole);
                                  setEditingRole(null);
                                }}
                                className="bg-white/20 text-white border border-white/30 rounded px-2 py-1 text-xs"
                              >
                                <option value="user" className="text-black">User</option>
                                <option value="admin" className="text-black">Admin</option>
                              </select>
                              <button
                                onClick={() => setEditingRole(null)}
                                className="text-white/60 hover:text-white text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingRole(user.id)}
                              className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition ${
                                user.role === 'admin' 
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              {user.role}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.is_banned ? (
                            <div>
                              <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                                Banned
                              </span>
                              {user.ban_reason && (
                                <p className="text-xs text-white/60 mt-1">{user.ban_reason}</p>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-white/60 text-sm">{formatDate(user.created_at)}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleAction('delete_user', user.id)}
                            className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30 font-medium hover:bg-red-500/30 transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}