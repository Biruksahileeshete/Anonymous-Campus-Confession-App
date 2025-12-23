'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect without waiting for mount or animations
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token && user !== 'null' && token !== 'null') {
      try {
        const parsedUser = JSON.parse(user);
        // Immediate navigation without any delays
        if (parsedUser.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/auth';
      }
    } else {
      // Immediate redirect to auth page
      window.location.href = '/auth';
    }
  }, []);

  // Minimal loading state without animations
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coral-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-coral-200 border-t-coral-500 rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Aurora Confessions</h1>
      </div>
    </div>
  );
}