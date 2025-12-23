'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, MessageCircle, ArrowUp } from 'lucide-react';
import Header from '@/components/Header';
import CreateConfession from '@/components/CreateConfession';
import OptimizedConfessionCard from '@/components/OptimizedConfessionCard';
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
    // Immediate authentication check
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token || userData === 'null' || token === 'null') {
      window.location.replace('/auth');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      // Immediate redirect for admin
      if (parsedUser.role === 'admin') {
        window.location.replace('/admin/dashboard');
        return;
      }

      setUser(parsedUser);
      fetchConfessions();
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.clear();
      window.location.replace('/auth');
    }
  }, []);

  const fetchConfessions = async (page = 0) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/confessions?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'max-age=60' // Use browser cache for 1 minute
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch confessions');
      }
      
      const data = await response.json();
      
      if (page === 0) {
        setConfessions(data);
      } else {
        // Append for pagination
        setConfessions(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error('Error fetching confessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace('/auth');
  };



  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-aurora p-12 max-w-md mx-auto">
          <div className="loading-aurora mx-auto mb-4"></div>
          <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Hero Welcome Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="card-aurora p-12 max-w-4xl mx-auto relative overflow-hidden">

            
            <motion.h1 
              className="text-4xl font-bold text-aurora mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Welcome back, {user.full_name?.split(' ')[0] || 'Aurora'}! ✨
            </motion.h1>
            
            <motion.p 
              className="text-lg max-w-2xl mx-auto leading-relaxed mt-8"
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Share your stories and connect with your campus community in a safe, anonymous space. 🌌
            </motion.p>


          </div>
        </motion.div>

        {/* Create Confession Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <CreateConfession onSuccess={fetchConfessions} />
        </motion.div>

        {/* Confessions Feed */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="text-center py-16">
              <div className="card-aurora p-12 max-w-md mx-auto">
                <div className="loading-aurora mx-auto mb-4"></div>
                <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Loading confessions...
                </p>
              </div>
            </div>
          ) : confessions.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="card-aurora p-16 max-w-lg mx-auto">
                <motion.div
                  className="text-8xl mb-8"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🌟
                </motion.div>
                <h3 className="text-3xl font-bold text-aurora mb-6">The Aurora Awaits</h3>
                <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
                  Be the first to paint the sky with your story. Let your confession 
                  be the first star in our constellation of shared experiences.
                </p>
                <motion.button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="btn-aurora px-10 py-4 text-lg font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  Illuminate the Aurora
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Feed Header */}
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                
              </motion.div>

              {/* Confession Cards */}
              {confessions.map((confession, index) => (
                <motion.div
                  key={confession.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.1,
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                >
                  <OptimizedConfessionCard
                    confession={confession}
                    onUpdate={fetchConfessions}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button - Scroll to Top */}
      <motion.button
        className="fab-aurora"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.1, y: -3 }}
        whileTap={{ scale: 0.95, y: -1 }}
        title="Back to top"
      >
        <ArrowUp className="w-6 h-6" />
      </motion.button>
    </div>
  );
}