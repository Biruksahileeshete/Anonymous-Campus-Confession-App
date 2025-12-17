'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Listen for route changes
    const originalPush = router.push;
    router.push = (...args) => {
      handleStart();
      return originalPush.apply(router, args).finally(handleComplete);
    };

    // Listen for page navigation
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        const url = new URL(link.href);
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          handleStart();
          setTimeout(handleComplete, 1000); // Minimum loading time for UX
        }
      }
    };

    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [router]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="card-aurora p-8 rounded-3xl text-center animate-pulse">
        <div className="w-20 h-20 bg-gradient-to-br from-coral-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
          <span className="text-3xl text-white">✨</span>
        </div>
        <h3 className="text-xl font-bold text-aurora mb-2">Loading Aurora...</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Please wait while we prepare your experience</p>
      </div>
    </div>
  );
}