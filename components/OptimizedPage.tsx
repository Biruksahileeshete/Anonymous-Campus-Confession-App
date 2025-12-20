'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api-client';

interface OptimizedPageProps {
  children: React.ReactNode;
  title?: string;
  preloadData?: boolean;
  className?: string;
}

export default function OptimizedPage({ 
  children, 
  title, 
  preloadData = true,
  className = '' 
}: OptimizedPageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Preload critical data
    if (preloadData) {
      api.preloadCriticalData().catch(() => {
        // Ignore preload errors
      });
    }

    // Mark as loaded after a short delay to ensure smooth animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [preloadData]);

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} - Aurora Confessions`;
    }
  }, [title]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={title || 'page'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.3, 
          ease: [0.4, 0, 0.2, 1] 
        }}
        className={`min-h-screen ${className}`}
        style={{
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}