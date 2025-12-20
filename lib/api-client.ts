'use client';

import { cacheManager, CACHE_KEYS, CACHE_TTL } from './cache-manager';

interface ApiOptions {
  cache?: boolean;
  cacheTTL?: number;
  skipAuth?: boolean;
}

class ApiClient {
  private baseURL = '';
  
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
      } catch {
        // Ignore JSON parsing errors for error responses
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }

    return response.json();
  }

  async get<T>(url: string, options: ApiOptions = {}): Promise<T> {
    const cacheKey = `GET:${url}`;
    
    // Try cache first if enabled
    if (options.cache !== false) {
      const cached = cacheManager.get<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }
    
    const headers = options.skipAuth ? { 'Content-Type': 'application/json' } : await this.getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    const data = await this.handleResponse<T>(response);
    
    // Cache successful responses
    if (options.cache !== false) {
      cacheManager.set(cacheKey, data, options.cacheTTL || CACHE_TTL.MEDIUM);
    }
    
    return data;
  }

  async post<T>(url: string, body?: any, options: ApiOptions = {}): Promise<T> {
    const headers = options.skipAuth ? { 'Content-Type': 'application/json' } : await this.getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const data = await this.handleResponse<T>(response);
    
    // Invalidate related cache entries
    this.invalidateCache(url);
    
    return data;
  }

  async put<T>(url: string, body?: any, options: ApiOptions = {}): Promise<T> {
    const headers = options.skipAuth ? { 'Content-Type': 'application/json' } : await this.getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const data = await this.handleResponse<T>(response);
    
    // Invalidate related cache entries
    this.invalidateCache(url);
    
    return data;
  }

  async delete<T>(url: string, options: ApiOptions = {}): Promise<T> {
    const headers = options.skipAuth ? { 'Content-Type': 'application/json' } : await this.getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    
    const data = await this.handleResponse<T>(response);
    
    // Invalidate related cache entries
    this.invalidateCache(url);
    
    return data;
  }

  private invalidateCache(url: string): void {
    // Invalidate specific patterns based on the URL
    if (url.includes('/api/reactions')) {
      cacheManager.invalidatePattern('reactions:');
      cacheManager.invalidatePattern('GET:/api/confessions');
    }
    
    if (url.includes('/api/confessions')) {
      cacheManager.invalidatePattern('GET:/api/confessions');
      cacheManager.invalidatePattern('reactions:');
    }
    
    if (url.includes('/api/notifications')) {
      cacheManager.delete(CACHE_KEYS.NOTIFICATIONS);
      cacheManager.delete(CACHE_KEYS.NOTIFICATION_COUNT);
    }
  }

  // Preload data for faster navigation
  async preload(urls: string[]): Promise<void> {
    const promises = urls.map(url => 
      this.get(url, { cache: true, cacheTTL: CACHE_TTL.LONG }).catch(() => {
        // Ignore preload errors
      })
    );
    
    await Promise.allSettled(promises);
  }

  // Clear all cache
  clearCache(): void {
    cacheManager.clear();
  }
}

// Global API client instance
export const apiClient = new ApiClient();

// Specific API methods with caching
export const api = {
  // Confessions
  getConfessions: (limit = 50, offset = 0) => 
    apiClient.get(`/api/confessions?limit=${limit}&offset=${offset}`, { 
      cache: true, 
      cacheTTL: CACHE_TTL.SHORT 
    }),
  
  // Reactions
  getUserReactions: (confessionId: string): Promise<{ userReactions: string[] }> =>
    apiClient.get(`/api/reactions?confessionId=${confessionId}`, {
      cache: true,
      cacheTTL: CACHE_TTL.SHORT
    }),
  
  addReaction: (confessionId: string, type: string) =>
    apiClient.post('/api/reactions', { confessionId, type, action: 'add' }),
  
  removeReaction: (confessionId: string, type: string) =>
    apiClient.post('/api/reactions', { confessionId, type, action: 'remove' }),
  
  // Notifications
  getNotifications: () =>
    apiClient.get('/api/notifications', { 
      cache: true, 
      cacheTTL: CACHE_TTL.SHORT 
    }),
  
  getNotificationCount: () =>
    apiClient.get('/api/notifications/unread-count', { 
      cache: true, 
      cacheTTL: CACHE_TTL.SHORT 
    }),
  
  // Comments
  getComments: (confessionId: string) =>
    apiClient.get(`/api/comments?confessionId=${confessionId}`, {
      cache: true,
      cacheTTL: CACHE_TTL.MEDIUM
    }),
  
  // Preload critical data
  preloadCriticalData: () => {
    const urls = [
      '/api/confessions?limit=20',
      '/api/notifications/unread-count'
    ];
    return apiClient.preload(urls);
  }
};