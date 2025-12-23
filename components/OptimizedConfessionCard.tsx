'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactionButtons from './ReactionButtons';
import OptimizedCommentSection from './OptimizedCommentSection';
import { commentManager } from '@/lib/comment-manager';
import { MessageCircle, Clock } from 'lucide-react';

interface Confession {
  id: string;
  content: string;
  created_at: string;
  comment_count: number;
}

interface OptimizedConfessionCardProps {
  confession: Confession;
  onUpdate?: () => void;
}

export default function OptimizedConfessionCard({ 
  confession, 
  onUpdate 
}: OptimizedConfessionCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(0);

  // Update comment count from comment manager
  useEffect(() => {
    const updateCount = () => {
      const managerCount = commentManager.getCommentCount(confession.id);
      setLocalCommentCount(managerCount);
    };

    const unsubscribe = commentManager.subscribe(confession.id, updateCount);
    updateCount(); // Initial count

    return unsubscribe;
  }, [confession.id]);

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

  const handleCommentAdded = () => {
    // Comment count is now managed by comment manager
    onUpdate?.();
  };

  // Use the higher of the two counts (server count + optimistic count)
  const displayCommentCount = Math.max(confession.comment_count, localCommentCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="card-aurora hover-lift"
      style={{ willChange: 'transform' }}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2" style={{ color: 'var(--text-secondary)' }}>
            <Clock className="w-4 h-4" />
            <span className="text-sm">{formatTime(confession.created_at)}</span>
          </div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            #{confession.id.slice(-6)}
          </div>
        </div>

        {/* Content */}
        <div className="leading-relaxed whitespace-pre-wrap text-lg" style={{ color: 'var(--text-primary)' }}>
          {confession.content}
        </div>

        {/* Reactions */}
        <ReactionButtons
          confessionId={confession.id}
          onUpdate={onUpdate || (() => {})}
        />

        {/* Comment Toggle */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <button
            onClick={() => {
              setShowComments(!showComments);
              // Only refresh if we don't have any comments yet and we're showing comments
              if (!showComments && localCommentCount === 0) {
                setTimeout(() => {
                  commentManager.refreshCommentsFromServer(confession.id);
                }, 100);
              }
            }}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-400/30 hover:border-blue-400/50 text-blue-600 dark:text-blue-400 font-medium shadow-sm hover:shadow-md"
            style={{ willChange: 'transform' }}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">
              {displayCommentCount} comment{displayCommentCount !== 1 ? 's' : ''}
            </span>
          </button>
        </div>

        {/* Comments Section - Full Width */}
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="border-t pt-6"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center space-x-2 mb-6" style={{ color: 'var(--text-secondary)' }}>
              <MessageCircle className="w-5 h-5" />
              <span className="text-lg font-semibold">Comments</span>
            </div>
            
            <OptimizedCommentSection
              confessionId={confession.id}
              onCommentAdded={handleCommentAdded}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}