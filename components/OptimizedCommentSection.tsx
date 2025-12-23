'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstantComments } from '@/lib/use-instant-comments';
import { commentManager } from '@/lib/comment-manager';
import { Send, MessageCircle } from 'lucide-react';
import { Comment as LibComment } from '@/lib/types';

interface DisplayComment extends LibComment {
  author_name?: string;
  isOptimistic?: boolean;
}

interface OptimizedCommentSectionProps {
  confessionId: string;
  initialComments?: DisplayComment[];
  onCommentAdded?: () => void;
}

export default function OptimizedCommentSection({
  confessionId,
  initialComments = [],
  onCommentAdded
}: OptimizedCommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const { comments, addComment, isLoading } = useInstantComments(confessionId, initialComments);

  // Force refresh comments when component mounts if no initial comments
  useEffect(() => {
    if (initialComments.length === 0) {
      commentManager.refreshCommentsFromServer(confessionId);
    }
  }, [confessionId, initialComments.length]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;

    const content = commentText.trim();
    
    // Clear input IMMEDIATELY
    setCommentText('');
    
    // Add comment instantly (this triggers immediate UI update)
    addComment(content);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Notify parent
    onCommentAdded?.();
    
  }, [commentText, addComment, onCommentAdded]);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return `${Math.floor(diff / 86400000)}d ago`;
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts on this confession..."
            className="w-full p-4 pr-16 border rounded-xl resize-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
            rows={4}
            maxLength={500}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="absolute bottom-4 right-4 p-3 bg-coral-500/20 border border-coral-400/50 rounded-lg hover:bg-coral-500/30 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{ 
              willChange: 'transform',
              color: 'var(--coral-500)'
            }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex justify-between items-center">
          {commentText.length > 0 && (
            <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {commentText.length}/500 characters
            </div>
          )}
          <div className="flex items-center space-x-2" style={{ color: 'var(--text-secondary)' }}>
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ 
                duration: 0.15, 
                delay: comment.isOptimistic ? 0 : Math.min(index * 0.02, 0.1),
                ease: [0.4, 0, 0.2, 1]
              }}
              className={`p-5 border rounded-xl transition-all duration-150 ${
                comment.isOptimistic ? 'opacity-80 border-coral-400/30' : ''
              }`}
              style={{ 
                willChange: 'transform, opacity',
                backgroundColor: comment.isOptimistic ? 'var(--coral-50)' : 'var(--bg-glass)',
                borderColor: comment.isOptimistic ? 'var(--coral-500)' : 'var(--border-primary)'
              }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-coral-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {(comment.author_name || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {comment.author_name || 'Anonymous'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {formatTime(comment.created_at)}
                        {comment.isOptimistic && (
                          <span className="ml-2 text-coral-500 animate-pulse">• Posting...</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                    {comment.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No comments yet</p>
            <p className="text-sm">Be the first to share your thoughts on this confession!</p>
          </div>
        )}
      </div>
    </div>
  );
}