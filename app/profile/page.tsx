'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface User {
  id: string;
  email: string;
  full_name: string;
  student_id: string;
  role: 'user' | 'admin';
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      router.push('/auth');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData(prev => ({
      ...prev,
      fullName: parsedUser.full_name || ''
    }));
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update local storage
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setSuccess('Profile updated successfully!');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/auth');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-strong p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-current mx-auto" style={{ color: 'var(--primary-500)' }}></div>
          <p className="mt-4 text-center" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="glass-strong rounded-3xl p-8 animate-slideInUp">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-gradient-to-br from-coral-500 via-teal-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-white/30">
              <span className="text-4xl text-white font-bold">
                {user.full_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-aurora mb-3">Profile Settings</h1>
            <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
              Manage your account information
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-8">
            <div className="grid gap-6">
              <div>
                <label className="block font-semibold mb-3 text-lg" style={{ color: 'var(--text-primary)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="input-modern w-full text-lg"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-3 text-lg" style={{ color: 'var(--text-primary)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="input-modern w-full text-lg opacity-60 cursor-not-allowed"
                />
                <p className="text-sm mt-2 flex items-center space-x-2" style={{ color: 'var(--text-tertiary)' }}>
                  <span>🔒</span>
                  <span>Email cannot be changed</span>
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-3 text-lg" style={{ color: 'var(--text-primary)' }}>
                  Student ID
                </label>
                <input
                  type="text"
                  value={user.student_id}
                  disabled
                  className="input-modern w-full text-lg opacity-60 cursor-not-allowed"
                />
                <p className="text-sm mt-2 flex items-center space-x-2" style={{ color: 'var(--text-tertiary)' }}>
                  <span>🔒</span>
                  <span>Student ID cannot be changed</span>
                </p>
              </div>
            </div>

            <div className="pt-8" style={{ borderTop: `2px solid var(--border-primary)` }}>
              <h3 className="text-2xl font-bold text-aurora mb-6 flex items-center space-x-3">
                <span>🔐</span>
                <span>Change Password</span>
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-semibold mb-3 text-lg" style={{ color: 'var(--text-primary)' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="input-modern w-full text-lg"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-3 text-lg" style={{ color: 'var(--text-primary)' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="input-modern w-full text-lg"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-3 text-lg" style={{ color: 'var(--text-primary)' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input-modern w-full text-lg"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="glass p-4 rounded-2xl border-2 border-red-500/30 animate-slideInUp">
                <div className="flex items-center space-x-3 text-red-400">
                  <span className="text-xl">⚠️</span>
                  <span className="font-semibold">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="glass p-4 rounded-2xl border-2 border-green-500/30 animate-slideInUp">
                <div className="flex items-center space-x-3 text-green-400">
                  <span className="text-xl">✅</span>
                  <span className="font-semibold">{success}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-aurora w-full py-4 px-8 text-lg font-semibold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-transparent border-t-current"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}