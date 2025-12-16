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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Section */}
        <div className="text-center mb-12 animate-fadeIn">
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome back, {user.full_name?.split(' ')[0] || 'User'}! 👋
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Share your thoughts and connect with your campus community anonymously.
          </p>
        </div>

        <div className="mb-8 animate-fadeIn">
          <CreateConfession onSuccess={fetchConfessions} userId={user.id} />
        </div>



        {/* Confessions Feed */}
        {loading ? (
          <div className="text-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto"></div>
              <div className="mt-4 text-white/80">Loading confessions...</div>
            </div>
          </div>
        ) : confessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="glass rounded-2xl p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold text-white mb-2">No confessions yet</h3>
              <p className="text-white/80 mb-6">
                Be the first to share your story with the community!
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
              >
                Share Your Confession
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {confessions.map((confession, index) => (
              <div
                key={confession.id}
                className="animate-fadeIn"
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