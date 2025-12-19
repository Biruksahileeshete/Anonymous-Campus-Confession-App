'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    // Check authentication and admin role
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!user || !token) {
      router.push('/auth');
      return;
    }

    try {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth');
    }
  }, [mounted, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-aurora p-12 max-w-md mx-auto">
          <div className="loading-aurora mx-auto mb-4"></div>
          <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}