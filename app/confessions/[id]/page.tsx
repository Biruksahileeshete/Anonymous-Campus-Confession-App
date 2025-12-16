'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import ConfessionCard from '@/components/ConfessionCard';
import { useRouter } from 'next/navigation';
import { Confession } from '@/lib/types';

export default function ConfessionPage() {
  const params = useParams();
  const router = useRouter();
  const confessionId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [confession, setConfession] = useState<Confession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      router.push('/auth');
      return;
    }

    setUser(JSON.parse(userData));
    fetchConfession();
  }, [confessionId, router]);

  const fetchConfession = async () => {
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
      const confessions = await response.json();
      const foundConfession = confessions.find((c: Confession) => c.id === confessionId);
      
      if (!foundConfession) {
        setError('Confession not found');
      } else {
        setConfession(foundConfession);
      }
    } catch (error) {
      console.error('Error fetching confession:', error);
      setError('Failed to load confession');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/auth');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  if (error || !confession) {
    return (
      <div className="min-h-screen">
        <Header user={user} onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="glass rounded-2xl p-12 text-center backdrop-blur-lg">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {error || 'Confession not found'}
            </h2>
            <p className="text-white/70 mb-6">
              This confession might have been removed or doesn't exist.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/80 hover:text-white transition"
          >
            ← Back to all confessions
          </Link>
        </div>

        <div className="mb-8">
          <ConfessionCard
            confession={confession}
            currentUserId={user?.id}
            onUpdate={fetchConfession}
          />
        </div>

        <div className="glass rounded-2xl p-6 backdrop-blur-lg">
          <h3 className="text-lg font-bold mb-4 text-white">Share this confession</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition backdrop-blur-sm"
            >
              <span>🔗</span>
              <span>Copy Link</span>
            </button>
            <div className="text-sm text-white/70">
              Share this anonymous confession with others
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}