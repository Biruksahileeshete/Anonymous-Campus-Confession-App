'use client';

import { Comment as LibComment } from '../lib/types';

// Extend your Comment type with optimistic fields
interface ManagerComment extends LibComment {
  author_name?: string;
  isOptimistic?: boolean;
}

interface CommentState {
  [confessionId: string]: {
    comments: ManagerComment[];
    isLoading: boolean;
    optimisticCount: number;
    lastFetch: number;
  };
}

class CommentManager {
  private state: CommentState = {};
  private listeners: Map<string, Set<() => void>> = new Map();
  private optimisticId = 0;

  subscribe(confessionId: string, callback: () => void): () => void {
    if (!this.listeners.has(confessionId)) {
      this.listeners.set(confessionId, new Set());
    }
    this.listeners.get(confessionId)!.add(callback);

    return () => {
      const listeners = this.listeners.get(confessionId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(confessionId);
        }
      }
    };
  }

  initializeComments(confessionId: string, comments: LibComment[]) {
    // Convert LibComment to ManagerComment with proper sorting (newest first)
    const managerComments: ManagerComment[] = comments
      .map(comment => ({
        ...comment,
        author_name: 'Anonymous',
        isOptimistic: false,
        // Ensure proper UTC date format
        created_at: new Date(comment.created_at).toISOString()
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Most recent first
    
    if (!this.state[confessionId]) {
      this.state[confessionId] = {
        comments: [...managerComments],
        isLoading: false,
        optimisticCount: 0,
        lastFetch: Date.now()
      };
    } else {
      // CRITICAL: Preserve optimistic comments, don't let server data overwrite them
      const existingOptimistic = this.state[confessionId].comments.filter(c => c.isOptimistic);
      
      // Merge: optimistic comments first (newest), then server comments (newest first)
      this.state[confessionId].comments = [...existingOptimistic, ...managerComments];
      this.state[confessionId].lastFetch = Date.now();
    }
    
    // Auto-fetch if no initial comments provided and not recently fetched
    if (comments.length === 0 && (!this.state[confessionId].lastFetch || Date.now() - this.state[confessionId].lastFetch > 30000)) {
      this.fetchCommentsFromServer(confessionId);
    }
  }

  getState(confessionId: string) {
    return this.state[confessionId] || {
      comments: [],
      isLoading: false,
      optimisticCount: 0,
      lastFetch: 0
    };
  }

  // Instant comment addition with optimistic update
  addCommentInstant(confessionId: string, content: string): string {
    if (!this.state[confessionId]) {
      this.state[confessionId] = {
        comments: [],
        isLoading: false,
        optimisticCount: 0,
        lastFetch: 0
      };
    }

    const currentState = this.state[confessionId];
    
    // Create optimistic comment with unique ID
    const optimisticId = `optimistic-${Date.now()}-${++this.optimisticId}`;
    const optimisticComment: ManagerComment = {
      id: optimisticId,
      confession_id: confessionId,
      content: content.trim(),
      author_id: 'optimistic-user',
      author_name: 'You',
      created_at: new Date().toISOString(), // UTC timestamp
      isOptimistic: true
    };

    // Add optimistic comment at the beginning (most recent first)
    currentState.comments.unshift(optimisticComment);
    currentState.optimisticCount++;
    
    // Notify listeners IMMEDIATELY
    this.notifyListeners(confessionId);

    // Start background sync (non-blocking)
    this.syncCommentWithServer(confessionId, optimisticId, content);

    return optimisticId;
  }

  private async fetchCommentsFromServer(confessionId: string) {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null') {
        return;
      }

      const response = await fetch(`/api/comments?confessionId=${confessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const serverComments = await response.json();
      
      if (Array.isArray(serverComments) && this.state[confessionId]) {
        // Convert server comments to manager comments with proper sorting and UTC dates
        const managerComments: ManagerComment[] = serverComments
          .map(comment => ({
            ...comment,
            author_name: comment.author_name || 'Anonymous',
            isOptimistic: false,
            // Ensure proper UTC date format
            created_at: new Date(comment.created_at).toISOString()
          }))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        // CRITICAL: Keep optimistic comments at the top, don't let server data overwrite them
        const existingOptimistic = this.state[confessionId].comments.filter(c => c.isOptimistic);
        this.state[confessionId].comments = [...existingOptimistic, ...managerComments];
        this.state[confessionId].lastFetch = Date.now();
        
        // Notify listeners of the update
        this.notifyListeners(confessionId);
      }
    } catch (error) {
      console.error('Failed to fetch comments from server:', error);
    }
  }

  private async syncCommentWithServer(confessionId: string, optimisticId: string, content: string) {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null') {
        throw new Error('No authentication token');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('/api/comments/optimistic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          confessionId,
          content
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.comment) {
        const state = this.state[confessionId];
        if (state) {
          // Replace optimistic comment with real one at the same position
          const index = state.comments.findIndex(c => c.id === optimisticId);
          if (index !== -1) {
            const serverComment: ManagerComment = {
              id: result.comment.id,
              confession_id: confessionId,
              content: result.comment.content,
              author_id: result.comment.author_id || 'anonymous',
              author_name: 'Anonymous',
              // Ensure proper UTC date format from server
              created_at: result.comment.created_at 
                ? new Date(result.comment.created_at).toISOString()
                : new Date().toISOString(),
              isOptimistic: false
            };
            
            state.comments[index] = serverComment;
            state.optimisticCount = Math.max(0, state.optimisticCount - 1);
            this.notifyListeners(confessionId);
          }
        }
      }

    } catch (error) {
      console.warn('Failed to sync comment with server:', error);
      
      // Remove optimistic comment on error
      const state = this.state[confessionId];
      if (state) {
        const index = state.comments.findIndex(c => c.id === optimisticId);
        if (index !== -1) {
          state.comments.splice(index, 1);
          state.optimisticCount = Math.max(0, state.optimisticCount - 1);
          this.notifyListeners(confessionId);
        }
      }
    }
  }

  // Force refresh comments from server
  async refreshCommentsFromServer(confessionId: string) {
    if (this.state[confessionId]) {
      this.state[confessionId].lastFetch = 0; // Reset to force fetch
    }
    await this.fetchCommentsFromServer(confessionId);
  }

  // Get total comment count including optimistic ones
  getCommentCount(confessionId: string): number {
    const state = this.state[confessionId];
    return state ? state.comments.length : 0;
  }

  private notifyListeners(confessionId: string) {
    const listeners = this.listeners.get(confessionId);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in comment listener:', error);
        }
      });
    }
  }

  cleanup(confessionId: string) {
    delete this.state[confessionId];
    this.listeners.delete(confessionId);
  }
}

export const commentManager = new CommentManager();