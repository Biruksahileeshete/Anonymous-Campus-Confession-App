'use client';

import { useState, useEffect } from 'react';

export default function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    // Set initial path
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }

    let loadingTimer: NodeJS.Timeout;
    let maxLoadingTimer: NodeJS.Timeout;

    const handleStart = () => {
      setIsLoading(true);
      
      // Maximum loading time of 2 seconds
      maxLoadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };

    const handleComplete = () => {
      clearTimeout(loadingTimer);
      clearTimeout(maxLoadingTimer);
      // Small delay to show completion
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
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

    // Listen for page load completion
    const handlePageLoad = () => {
      handleComplete();
    };

    // Listen for popstate (back/forward navigation)
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const newPath = window.location.pathname;
        if (newPath !== currentPath) {
          setCurrentPath(newPath);
          handleComplete();
        }
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);
    window.addEventListener('load', handlePageLoad);
    window.addEventListener('popstate', handlePopState);
    
    // Hide loading when component mounts (page loaded successfully)
    handleComplete();
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit);
      window.removeEventListener('load', handlePageLoad);
      window.removeEventListener('popstate', handlePopState);
      clearTimeout(loadingTimer);
      clearTimeout(maxLoadingTimer);
    };
  }, [currentPath]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="card-aurora p-12 max-w-md mx-auto">
        <div className="loading-aurora mx-auto mb-4"></div>
        <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Loading...
        </p>
      </div>
    </div>
  );
}