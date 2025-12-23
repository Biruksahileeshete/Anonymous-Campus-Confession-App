'use client';

import { Comment as LibComment } from '../lib/types';

// Extend your Comment type with optimistic fields
interface ManagerComment extends LibComment {
  author_name?: string;  // We'll add this for display purposes
  isOptimistic?: boolean;
}

interface CommentState {
  [confessionId: string]: {
    comments: ManagerComment[];
    isLoading: boolean;
    optimisticCount: number;
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
    // Convert LibComment to ManagerComment with author_name for display
    const managerComments: ManagerComment[] = comments.map(comment => ({
      ...comment,
      author_name: 'Anonymous', // Add display name
      isOptimistic: false
    }));
    
    if (!this.state[confessionId]) {
      this.state[confessionId] = {
        comments: [...managerComments],
        isLoading: false,
        optimisticCount: 0
      };
      
      // If no initial comments provided, fetch from server
      if (comments.length === 0) {
        this.fetchCommentsFromServer(confessionId);
      }
    } else {
      // Update existing comments but keep optimistic ones
      const existingOptimistic = this.state[confessionId].comments.filter(c => c.isOptimistic);
      this.state[confessionId].comments = [...managerComments, ...existingOptimistic];
    }
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
          'Cache-Control': 'max-age=60'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const serverComments = await response.json();
      
      if (Array.isArray(serverComments) && this.state[confessionId]) {
        // Convert server comments to manager comments
        const managerComments: ManagerComment[] = serverComments.map(comment => ({
          ...comment,
          author_name: comment.author_name || 'Anonymous',
          isOptimistic: false
        }));
        
        // Keep any optimistic comments and merge with server comments
        const existingOptimistic = this.state[confessionId].comments.filter(c => c.isOptimistic);
        this.state[confessionId].comments = [...managerComments, ...existingOptimistic];
        
        // Notify listeners of the update
        this.notifyListeners(confessionId);
      }
    } catch (error) {
      console.error('Failed to fetch comments from server:', error);
    }
  }

  getState(confessionId: string) {
    return this.state[confessionId] || {
      comments: [],
      isLoading: false,
      optimisticCount: 0
    };
  }

  // Instant comment addition with optimistic update
  addCommentInstant(confessionId: string, content: string): string {
    if (!this.state[confessionId]) {
      this.state[confessionId] = {
        comments: [],
        isLoading: false,
        optimisticCount: 0
      };
    }

    const currentState = this.state[confessionId];
    
    // Create optimistic comment with unique ID
    const optimisticId = `optimistic-${Date.now()}-${++this.optimisticId}`;
    const optimisticComment: ManagerComment = {
      id: optimisticId,
      confession_id: confessionId,
      content: content.trim(),
      author_id: 'optimistic-user', // Temporary ID
      author_name: 'You', // Display name for optimistic comment
      created_at: new Date().toISOString(),
      isOptimistic: true
    };

    // Add optimistic comment immediately
    currentState.comments.push(optimisticComment);
    currentState.optimisticCount++;
    
    // Notify listeners IMMEDIATELY
    this.notifyListeners(confessionId);

    // Start background sync (non-blocking)
    this.syncCommentWithServer(confessionId, optimisticId, content);

    return optimisticId;
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
          // Replace optimistic comment with real one
          const index = state.comments.findIndex(c => c.id === optimisticId);
          if (index !== -1) {
            // Convert the server response to match our ManagerComment structure
            const serverComment: ManagerComment = {
              id: result.comment.id,
              confession_id: confessionId,
              content: result.comment.content,
              author_id: result.comment.author_id || 'anonymous',
              author_name: 'Anonymous', // Display name
              created_at: result.comment.created_at || new Date().toISOString(),
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

  // Force refresh comments from server
  async refreshCommentsFromServer(confessionId: string) {
    await this.fetchCommentsFromServer(confessionId);
  }

  cleanup(confessionId: string) {
    delete this.state[confessionId];
    this.listeners.delete(confessionId);
  }
}

export const commentManager = new CommentManager();