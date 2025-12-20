'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Immediate redirect without waiting for mount
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token && user !== 'null' && token !== 'null') {
      try {
        const parsedUser = JSON.parse(user);
        // Use replace for better performance
        if (parsedUser.role === 'admin') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.replace('/auth');
      }
    } else {
      // Redirect to auth page
      router.replace('/auth');
    }
  }, [router]);

  // Optimized loading state with hardware acceleration
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coral-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="w-16 h-16 border-4 border-coral-200 border-t-coral-500 rounded-full animate-spin mx-auto mb-6"></div>
        <motion.h1 
          className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          Aurora Confessions
        </motion.h1>
        <motion.p 
          className="text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          Loading your experience...
        </motion.p>
      </motion.div>
    </div>
  );
}