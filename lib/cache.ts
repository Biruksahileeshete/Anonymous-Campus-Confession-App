// Simple in-memory cache for API responses
interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SimpleCache {
  private cache = new Map<string, CacheItem>();
  private maxSize = 1000; // Maximum cache entries

  set(key: string, data: any, ttlSeconds = 300) { // Default 5 minutes
    // Clean up if cache is getting too large
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  // Delete all keys that match a pattern
  deletePattern(pattern: string) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // Clean up expired entries
  private cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

export const cache = new SimpleCache();

// Cache key generators
export const cacheKeys = {
  confessions: (page = 0) => `confessions:page:${page}`,
  confession: (id: string) => `confession:${id}`,
  comments: (confessionId: string) => `comments:${confessionId}`,
  reactions: (confessionId: string) => `reactions:${confessionId}`,
  userReactions: (confessionId: string, userId: string) => `user_reactions:${confessionId}:${userId}`,
  notifications: (userId: string) => `notifications:${userId}`,
  unreadCount: (userId: string) => `unread_count:${userId}`,
  stats: () => 'admin:stats'
};