'use client';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  isOptimistic?: boolean;
}

interface CommentState {
  [confessionId: string]: {
    comments: Comment[];
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

  initializeComments(confessionId: string, comments: Comment[]) {
    if (!this.state[confessionId]) {
      this.state[confessionId] = {
        comments: [...comments],
        isLoading: false,
        optimisticCount: 0
      };
    } else {
      // Update existing comments but keep optimistic ones
      const existingOptimistic = this.state[confessionId].comments.filter(c => c.isOptimistic);
      this.state[confessionId].comments = [...comments, ...existingOptimistic];
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
    const state = this.state[confessionId];
    if (!state) {
      this.state[confessionId] = {
        comments: [],
        isLoading: false,
        optimisticCount: 0
      };
    }

    const currentState = this.state[confessionId];
    
    // Create optimistic comment with unique ID
    const optimisticId = `optimistic-${Date.now()}-${++this.optimisticId}`;
    const optimisticComment: Comment = {
      id: optimisticId,
      content: content.trim(),
      author_name: 'You',
      created_at: new Date().toISOString(),
      isOptimistic: true
    };

    // Add optimistic comment immediately to the END of the array (newest first)
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

      // Use fetch with shorter timeout for faster failure detection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
            state.comments[index] = {
              ...result.comment,
              author_name: 'Anonymous', // Keep anonymous
              isOptimistic: false
            };
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

  cleanup(confessionId: string) {
    delete this.state[confessionId];
    this.listeners.delete(confessionId);
  }
}

export const commentManager = new CommentManager();