'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import CreateConfession from '@/components/CreateConfession';
import ConfessionCard from '@/components/ConfessionCard';
import { Confession } from '@/lib/types';

interface User {
  id: string;
  email: string;
  full_name: string;
  student_id: string;
  role: 'user' | 'admin';
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      router.push('/auth');
      return;
    }

    const parsedUser = JSON.parse(userData);
    
    console.log('Parsed user data:', parsedUser); // Debug log
    
    // Redirect admin to admin dashboard
    if (parsedUser.role === 'admin') {
      router.push('/admin/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchConfessions();
  }, [router]);

  const fetchConfessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/confessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch confessions');
      }
      
      const data = await response.json();
      setConfessions(data);
    } catch (error) {
      console.error('Error fetching confessions:', error);
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
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Section */}
        <div className="text-center mb-12 animate-slideInUp">
          <div className="glass-strong p-8 rounded-3xl mb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-3xl">👋</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Welcome back, {user.full_name?.split(' ')[0] || 'User'}!
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Share your thoughts and connect with your campus community anonymously.
            </p>
          </div>
        </div>

        <div className="mb-8 animate-slideInUp" style={{ animationDelay: '0.2s' }}>
          <CreateConfession onSuccess={fetchConfessions} userId={user.id} />
        </div>

        {/* Confessions Feed */}
        {loading ? (
          <div className="text-center py-16">
            <div className="glass-strong p-12 rounded-2xl max-w-md mx-auto">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-current mx-auto mb-4" style={{ color: 'var(--primary-500)' }}></div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading confessions...</p>
            </div>
          </div>
        ) : confessions.length === 0 ? (
          <div className="text-center py-16 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
            <div className="glass-strong rounded-3xl p-12 max-w-md mx-auto">
              <div className="text-6xl mb-6 animate-bounce">🌟</div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">No confessions yet</h3>
              <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                Be the first to share your story with the community!
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="btn-primary px-8 py-4 rounded-2xl text-lg font-semibold"
              >
                <span className="mr-2">✨</span>
                Share Your Confession
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold gradient-text mb-2">Campus Confessions</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {confessions.length} {confessions.length === 1 ? 'confession' : 'confessions'} shared
              </p>
            </div>
            {confessions.map((confession, index) => (
              <div
                key={confession.id}
                className="animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ConfessionCard
                  confession={confession}
                  currentUserId={user.id}
                  onUpdate={fetchConfessions}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}