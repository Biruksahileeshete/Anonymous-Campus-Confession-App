'use client';

import { Suspense, lazy, ComponentType, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Optimized loading component
const LoadingSpinner = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center justify-center p-8"
  >
    <div className="w-8 h-8 border-4 border-coral-200 border-t-coral-500 rounded-full animate-spin"></div>
  </motion.div>
);

// Skeleton loader for better UX
const SkeletonLoader = ({ type = 'card' }: { type?: 'card' | 'list' | 'text' }) => {
  if (type === 'card') {
    return (
      <div className="card-aurora p-6 animate-pulse">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-20 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (type === 'list') {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-white/10 rounded-lg">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      <div className="h-4 bg-gray-300 rounded w-4/6"></div>
    </div>
  );
};

// HOC for lazy loading with optimized loading states
export function withOptimizedLoading<P extends object>(
  Component: ComponentType<P>,
  loadingType: 'spinner' | 'skeleton' = 'spinner',
  skeletonType: 'card' | 'list' | 'text' = 'card'
) {
  return function OptimizedComponent(props: P) {
    return (
      <Suspense 
        fallback={
          loadingType === 'skeleton' ? 
            <SkeletonLoader type={skeletonType} /> : 
            <LoadingSpinner />
        }
      >
        <Component {...props} />
      </Suspense>
    );
  };
}

// Lazy load components with preloading
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  preload = false
) {
  const LazyComponent = lazy(importFn);
  
  // Preload component if requested
  if (preload && typeof window !== 'undefined') {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      importFn().catch(() => {
        // Ignore preload errors
      });
    }, 100);
  }
  
  return LazyComponent;
}

// Intersection Observer based lazy loading
export function LazySection({ 
  children, 
  threshold = 0.1,
  rootMargin = '50px',
  fallback = <LoadingSpinner />
}: {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return (
    <div ref={setRef}>
      {isVisible ? children : fallback}
    </div>
  );
}

export { LoadingSpinner, SkeletonLoader };