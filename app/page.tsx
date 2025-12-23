'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect without any UI
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token && user !== 'null' && token !== 'null') {
      try {
        const parsedUser = JSON.parse(user);
        // Immediate navigation without any delays
        if (parsedUser.role === 'admin') {
          window.location.replace('/admin/dashboard');
        } else {
          window.location.replace('/dashboard');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.replace('/auth');
      }
    } else {
      // Immediate redirect to auth page
      window.location.replace('/auth');
    }
  }, []);

  // Return null to show nothing while redirecting
  return null;
}