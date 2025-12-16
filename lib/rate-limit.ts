// Rate limiting utilities

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory rate limiting (for production, use Redis or database)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Function to clear rate limit store (useful for development)
export function clearRateLimit(identifier?: string) {
  if (identifier) {
    rateLimitStore.delete(identifier);
  } else {
    rateLimitStore.clear();
  }
}

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 5, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  // Bypass rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: Date.now() + windowMs
    };
  }

  const now = Date.now();
  const key = identifier;
  
  // Clean up expired entries
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((v, k) => {
    if (v.resetTime < now) {
      keysToDelete.push(k);
    }
  });
  keysToDelete.forEach(k => rateLimitStore.delete(k));
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    // First request or window expired
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime
    };
  }
  
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }
  
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

export function getRateLimitHeaders(result: ReturnType<typeof checkRateLimit>) {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };
}

// Specific rate limits for different actions
export const RATE_LIMITS = {
  CONFESSION_POST: { 
    maxRequests: process.env.NODE_ENV === 'development' ? 100 : 5, 
    windowMs: process.env.NODE_ENV === 'development' ? 60 * 1000 : 60 * 60 * 1000 
  }, // Dev: 100 per minute, Prod: 5 per hour
  COMMENT_POST: { 
    maxRequests: process.env.NODE_ENV === 'development' ? 200 : 20, 
    windowMs: process.env.NODE_ENV === 'development' ? 60 * 1000 : 60 * 60 * 1000 
  }, // Dev: 200 per minute, Prod: 20 per hour
  REACTION: { 
    maxRequests: process.env.NODE_ENV === 'development' ? 500 : 100, 
    windowMs: process.env.NODE_ENV === 'development' ? 60 * 1000 : 60 * 60 * 1000 
  }, // Dev: 500 per minute, Prod: 100 per hour
  REPORT: { 
    maxRequests: process.env.NODE_ENV === 'development' ? 50 : 10, 
    windowMs: process.env.NODE_ENV === 'development' ? 60 * 1000 : 24 * 60 * 60 * 1000 
  }, // Dev: 50 per minute, Prod: 10 per day
  LOGIN: {
    maxRequests: process.env.NODE_ENV === 'development' ? 100 : 10,
    windowMs: process.env.NODE_ENV === 'development' ? 60 * 1000 : 15 * 60 * 1000
  } // Dev: 100 per minute, Prod: 10 per 15 minutes
};