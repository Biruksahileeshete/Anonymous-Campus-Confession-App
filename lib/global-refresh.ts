'use client';

// Global refresh event system for fast updates
export class GlobalRefresh {
  private static listeners: Set<() => void> = new Set();
  private static isInitialized = false;

  static init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    // Listen for the global refresh event
    window.addEventListener('aurora:refresh', () => {
      this.triggerRefresh();
    });

    // Listen for visibility changes to refresh when tab becomes active
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Delay refresh slightly to allow for smooth transition
        setTimeout(() => this.triggerRefresh(), 100);
      }
    });

    this.isInitialized = true;
  }

  static subscribe(callback: () => void) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  static triggerRefresh() {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in refresh callback:', error);
      }
    });
  }

  static emit() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('aurora:refresh'));
    }
  }
}

// Hook for components to use global refresh
export function useGlobalRefresh(callback: () => void) {
  if (typeof window !== 'undefined') {
    GlobalRefresh.init();
    
    // Subscribe on mount, unsubscribe on unmount
    const unsubscribe = GlobalRefresh.subscribe(callback);
    
    return unsubscribe;
  }
  
  return () => {}; // No-op for SSR
}