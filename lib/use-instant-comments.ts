'use client';

import { useState, useEffect, useCallback } from 'react';
import { commentManager } from './comment-manager';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  isOptimistic?: boolean;
}

export function useInstantComments(confessionId: string, initialComments: Comment[] = []) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize and subscribe to comment manager
  useEffect(() => {
    // Initialize with existing comments
    commentManager.initializeComments(confessionId, initialComments);
    
    // Subscribe to changes
    const unsubscribe = commentManager.subscribe(confessionId, () => {
      const state = commentManager.getState(confessionId);
      setComments([...state.comments]); // Create new array to trigger re-render
    });

    // Set initial state
    const initialState = commentManager.getState(confessionId);
    setComments([...initialState.comments]);

    return unsubscribe;
  }, [confessionId, initialComments]);

  // Add comment instantly
  const addComment = useCallback((content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    
    try {
      // This will trigger an immediate UI update
      commentManager.addCommentInstant(confessionId, content.trim());
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      // Reset loading state quickly
      setTimeout(() => setIsLoading(false), 100);
    }
  }, [confessionId]);

  // Get current comment count
  const getCommentCount = useCallback(() => {
    return commentManager.getCommentCount(confessionId);
  }, [confessionId]);

  return {
    comments,
    addComment,
    getCommentCount,
    isLoading
  };
}