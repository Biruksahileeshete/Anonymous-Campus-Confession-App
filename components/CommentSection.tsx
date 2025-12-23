'use client';

import { useState } from 'react';
import { Comment as LibComment } from '../lib/types';
import { useInstantComments } from '../lib/use-instant-comments';

interface CommentSectionProps {
  confessionId: string;
  initialComments?: LibComment[];
  onCommentAdded?: () => void;
}

export default function CommentSection({ confessionId, initialComments = [], onCommentAdded }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  
  // Use the instant comments hook
  const { comments, addComment, isLoading } = useInstantComments(
    confessionId, 
    initialComments
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isLoading) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to comment');
      return;
    }
    
    try {
      // Use the addComment from the hook (this does optimistic update)
      addComment(newComment.trim());
      setNewComment('');
      onCommentAdded?.(); // Update comment count in parent
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('An error occurred while posting comment');
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Unknown time';
    }
    
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMs < 0) {
      return 'Just now';
    }
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {localStorage.getItem('token') && (
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this confession..."
              className="input-aurora resize-none w-full h-32 min-h-[8rem]"
              maxLength={500}
              rows={4}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
                {newComment.length}/500 characters
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || isLoading}
                className="btn-comment-aurora"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="loading-aurora w-4 h-4"></div>
                    Posting...
                  </span>
                ) : (
                  'Post Comment'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <div className="glass-aurora p-6 rounded-2xl">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div 
              key={comment.id} 
              className={`glass-aurora p-4 rounded-2xl ${comment.isOptimistic ? 'opacity-70' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    comment.isOptimistic 
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                      : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                  }`}>
                    <span className="text-white text-sm font-bold">
                      {comment.isOptimistic ? 'Y' : 'A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {comment.author_name || 'Anonymous'}
                    </span>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {formatDate(comment.created_at)}
                      {comment.isOptimistic && ' • Sending...'}
                    </div>
                  </div>
                </div>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}