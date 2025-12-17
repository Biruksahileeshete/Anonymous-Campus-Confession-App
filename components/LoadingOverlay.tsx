'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let loadingTimer: NodeJS.Timeout;

    const handleStart = () => {
      setIsLoading(true);
      // Auto-hide after 500ms to prevent long loading
      loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    const handleComplete = () => {
      clearTimeout(loadingTimer);
      setIsLoading(false);
    };

    // Listen for link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:') && !link.href.startsWith('#')) {
        const url = new URL(link.href);
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          handleStart();
        }
      }
    };

    // Listen for form submissions
    const handleSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      if (form && form.method === 'post') {
        handleStart();
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);
    
    // Hide loading when route changes
    handleComplete();
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit);
      clearTimeout(loadingTimer);
    };
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="card-aurora p-6 rounded-2xl text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-coral-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
          <span className="text-2xl text-white">✨</span>
        </div>
        <h3 className="text-lg font-bold text-aurora">Loading...</h3>
      </div>
    </div>
  );
}