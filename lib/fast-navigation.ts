'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

// Fast navigation hook with preloading and caching
export function useFastNavigation() {
  const router = useRouter();

  // Preload critical routes
  const preloadRoutes = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Preload common routes
      router.prefetch('/dashboard');
      router.prefetch('/notifications');
      router.prefetch('/profile');
      router.prefetch('/confessions');
    }
  }, [router]);

  // Fast navigate with optimistic updates
  const fastNavigate = useCallback((path: string, options?: { replace?: boolean }) => {
    // Use replace for better performance when appropriate
    if (options?.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  }, [router]);

  // Navigate with loading state management
  const navigateWithLoading = useCallback((
    path: string, 
    setLoading?: (loading: boolean) => void,
    options?: { replace?: boolean }
  ) => {
    if (setLoading) setLoading(true);
    
    // Use requestIdleCallback for better performance
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        fastNavigate(path, options);
        if (setLoading) {
          setTimeout(() => setLoading(false), 100);
        }
      });
    } else {
      fastNavigate(path, options);
      if (setLoading) {
        setTimeout(() => setLoading(false), 100);
      }
    }
  }, [fastNavigate]);

  return {
    fastNavigate,
    navigateWithLoading,
    preloadRoutes,
    router
  };
}

// Global navigation performance utilities
export const NavigationUtils = {
  // Preload a route
  preload: (path: string) => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = path;
      document.head.appendChild(link);
    }
  },

  // Clear navigation cache
  clearCache: () => {
    if (typeof window !== 'undefined') {
      // Clear any cached navigation data
      try {
        localStorage.removeItem('navigation_cache');
        sessionStorage.removeItem('navigation_cache');
      } catch (error) {
        console.warn('Could not clear navigation cache:', error);
      }
    }
  },

  // Optimize page transitions
  optimizeTransition: () => {
    if (typeof window !== 'undefined') {
      // Add CSS for smooth transitions
      const style = document.createElement('style');
      style.textContent = `
        * {
          transition: opacity 0.15s ease-in-out;
        }
        
        .page-transition-enter {
          opacity: 0;
        }
        
        .page-transition-enter-active {
          opacity: 1;
        }
        
        .page-transition-exit {
          opacity: 1;
        }
        
        .page-transition-exit-active {
          opacity: 0;
        }
      `;
      document.head.appendChild(style);
    }
  }
};