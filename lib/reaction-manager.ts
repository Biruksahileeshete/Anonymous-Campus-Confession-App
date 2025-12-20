'use client';

interface ReactionState {
  [confessionId: string]: {
    userReactions: Set<string>;
    counts: { [emoji: string]: number };
    pendingActions: Map<string, 'add' | 'remove'>;
  };
}

class ReactionManager {
  private state: ReactionState = {};
  private listeners: Map<string, Set<() => void>> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  // Subscribe to reaction changes for a confession
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

  // Initialize confession state
  initializeConfession(
    confessionId: string, 
    userReactions: string[], 
    counts: { [emoji: string]: number }
  ) {
    if (!this.state[confessionId]) {
      this.state[confessionId] = {
        userReactions: new Set(userReactions),
        counts: { ...counts },
        pendingActions: new Map()
      };
    }
  }

  // Get current state for a confession
  getState(confessionId: string) {
    const state = this.state[confessionId];
    if (!state) return null;

    return {
      userReactions: Array.from(state.userReactions),
      counts: { ...state.counts },
      isPending: (emoji: string) => state.pendingActions.has(emoji)
    };
  }

  // Optimistically toggle reaction
  async toggleReaction(confessionId: string, emoji: string): Promise<boolean> {
    const state = this.state[confessionId];
    if (!state) return false;

    const wasActive = state.userReactions.has(emoji);
    const action = wasActive ? 'remove' : 'add';

    // Optimistic update
    if (wasActive) {
      state.userReactions.delete(emoji);
      state.counts[emoji] = Math.max(0, (state.counts[emoji] || 0) - 1);
    } else {
      state.userReactions.add(emoji);
      state.counts[emoji] = (state.counts[emoji] || 0) + 1;
    }

    // Mark as pending
    state.pendingActions.set(emoji, action);

    // Notify listeners immediately
    this.notifyListeners(confessionId);

    // Debounce API call
    this.debouncedApiCall(confessionId, emoji, action);

    return !wasActive;
  }

  private debouncedApiCall(confessionId: string, emoji: string, action: 'add' | 'remove') {
    const key = `${confessionId}:${emoji}`;
    
    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      await this.syncWithServer(confessionId, emoji, action);
      this.debounceTimers.delete(key);
    }, 300); // 300ms debounce

    this.debounceTimers.set(key, timer);
  }

  private async syncWithServer(confessionId: string, emoji: string, action: 'add' | 'remove') {
    const state = this.state[confessionId];
    if (!state) return;

    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null') {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/reactions/optimistic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          confessionId,
          emoji,
          action
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      // Update with server response
      if (result.success && result.reactionCounts) {
        state.counts = { ...result.reactionCounts };
        this.notifyListeners(confessionId);
      }

    } catch (error) {
      console.warn('Failed to sync reaction with server:', error);
      // Revert optimistic update on error
      this.revertReaction(confessionId, emoji, action);
    } finally {
      // Remove pending state
      state.pendingActions.delete(emoji);
      this.notifyListeners(confessionId);
    }
  }

  private revertReaction(confessionId: string, emoji: string, action: 'add' | 'remove') {
    const state = this.state[confessionId];
    if (!state) return;

    if (action === 'add') {
      // Revert add: remove the reaction
      state.userReactions.delete(emoji);
      state.counts[emoji] = Math.max(0, (state.counts[emoji] || 0) - 1);
    } else {
      // Revert remove: add the reaction back
      state.userReactions.add(emoji);
      state.counts[emoji] = (state.counts[emoji] || 0) + 1;
    }

    this.notifyListeners(confessionId);
  }

  private notifyListeners(confessionId: string) {
    const listeners = this.listeners.get(confessionId);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in reaction listener:', error);
        }
      });
    }
  }

  // Cleanup
  cleanup(confessionId: string) {
    delete this.state[confessionId];
    this.listeners.delete(confessionId);
    
    // Clear any pending timers
    for (const [key, timer] of this.debounceTimers.entries()) {
      if (key.startsWith(`${confessionId}:`)) {
        clearTimeout(timer);
        this.debounceTimers.delete(key);
      }
    }
  }
}

export const reactionManager = new ReactionManager();