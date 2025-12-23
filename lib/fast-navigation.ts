'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useFastNavigation() {
  const router = useRouter();

  const fastNavigate = useCallback((path: string, options?: { replace?: boolean }) => {
    // Immediate navigation without loading states
    if (options?.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  }, [router]);

  const preloadRoutes = useCallback(() => {
    // Preload common routes for faster navigation
    const commonRoutes = ['/dashboard', '/notifications', '/profile'];
    commonRoutes.forEach(route => {
      router.prefetch(route);
    });
  }, [router]);

  return { fastNavigate, preloadRoutes };
}