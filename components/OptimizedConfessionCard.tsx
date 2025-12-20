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
  reaction_counts: { [key: string]: number };
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-3 space-y-4 p-6">
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
            reactions={confession.reaction_counts}
            onUpdate={onUpdate || (() => {})}
          />

          {/* Comment Toggle */}
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 transition-all duration-150 hover:scale-105 active:scale-95 px-3 py-2 rounded-lg hover:bg-coral-50"
              style={{ color: 'var(--text-secondary)', willChange: 'transform' }}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {displayCommentCount} comment{displayCommentCount !== 1 ? 's' : ''} 
                {showComments ? ' (Hide)' : ' (Show)'}
              </span>
            </button>
          </div>
        </div>

        {/* Comments Section - Right Side - Always Visible */}
        <div className="lg:col-span-1 border-l lg:border-l lg:border-t-0 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="p-4 h-full">
            <div className="flex items-center space-x-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Comments</span>
            </div>
            
            {showComments ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <OptimizedCommentSection
                  confessionId={confession.id}
                  onCommentAdded={handleCommentAdded}
                />
              </motion.div>
            ) : (
              <div className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Click "Show" to view and add comments</p>
                <p className="text-xs mt-1">{displayCommentCount} comment{displayCommentCount !== 1 ? 's' : ''}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}