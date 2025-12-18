'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token) {
      const parsedUser = JSON.parse(user);
      // Redirect based on role
      if (parsedUser.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } else {
      // Redirect to auth page
      router.push('/auth');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card-aurora p-12 max-w-md mx-auto">
        <div className="loading-aurora mx-auto mb-4"></div>
        <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Loading...
        </p>
      </div>
    </div>
  );
}