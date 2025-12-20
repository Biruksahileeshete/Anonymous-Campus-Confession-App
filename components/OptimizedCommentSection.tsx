'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstantComments } from '@/lib/use-instant-comments';
import { Send, MessageCircle } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  isOptimistic?: boolean;
}

interface OptimizedCommentSectionProps {
  confessionId: string;
  initialComments?: Comment[];
  onCommentAdded?: () => void;
}

export default function OptimizedCommentSection({
  confessionId,
  initialComments = [],
  onCommentAdded
}: OptimizedCommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const { comments, addComment, isLoading } = useInstantComments(confessionId, initialComments);

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
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-4 pr-12 border rounded-xl resize-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
            rows={3}
            maxLength={500}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="absolute bottom-3 right-3 p-2 bg-coral-500/20 border border-coral-400/50 rounded-lg hover:bg-coral-500/30 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{ 
              willChange: 'transform',
              color: 'var(--coral-500)'
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {commentText.length > 0 && (
          <div className="text-right text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {commentText.length}/500
          </div>
        )}
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2" style={{ color: 'var(--text-secondary)' }}>
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
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
                className={`p-4 border rounded-xl transition-all duration-150 ${
                  comment.isOptimistic ? 'opacity-80 border-coral-400/30' : ''
                }`}
                style={{ 
                  willChange: 'transform, opacity',
                  backgroundColor: comment.isOptimistic ? 'var(--coral-50)' : 'var(--bg-glass)',
                  borderColor: comment.isOptimistic ? 'var(--coral-500)' : 'var(--border-primary)'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-coral-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {comment.author_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {comment.author_name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {formatTime(comment.created_at)}
                        {comment.isOptimistic && (
                          <span className="ml-1 text-coral-500 animate-pulse">• Posting...</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                  {comment.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}