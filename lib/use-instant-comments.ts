'use client';

import { useState, useEffect, useCallback } from 'react';
import { commentManager } from './comment-manager';
import { Comment as LibComment } from '../lib/types';

// Create a type that includes the display properties
interface DisplayComment extends LibComment {
  author_name?: string;
  isOptimistic?: boolean;
}

export function useInstantComments(confessionId: string, initialComments: LibComment[] = []) {
  const [comments, setComments] = useState<DisplayComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize and subscribe to comment manager
  useEffect(() => {
    // Initialize with existing comments
    commentManager.initializeComments(confessionId, initialComments);
    
    // Get initial state
    const initialState = commentManager.getState(confessionId);
    setComments([...initialState.comments]);
    
    // Subscribe to changes
    const unsubscribe = commentManager.subscribe(confessionId, () => {
      const state = commentManager.getState(confessionId);
      setComments([...state.comments]);
    });

    return unsubscribe;
  }, [confessionId]);

  // Add comment instantly
  const addComment = useCallback((content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    
    try {
      commentManager.addCommentInstant(confessionId, content.trim());
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [confessionId]);

  // Get current comment count
  const getCommentCount = useCallback(() => {
    return commentManager.getCommentCount(confessionId);
  }, [confessionId]);

  // Force refresh from manager
  const refreshComments = useCallback(() => {
    const state = commentManager.getState(confessionId);
    setComments([...state.comments]);
  }, [confessionId]);

  // Force refresh from server
  const refreshFromServer = useCallback(async () => {
    await commentManager.refreshCommentsFromServer(confessionId);
  }, [confessionId]);

  return {
    comments,
    addComment,
    getCommentCount,
    refreshComments,
    refreshFromServer,
    isLoading
  };
}