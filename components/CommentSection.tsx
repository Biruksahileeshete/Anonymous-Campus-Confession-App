'use client';

import { useState, useEffect } from 'react';
import { Comment } from '../lib/types';

interface CommentSectionProps {
  confessionId: string;
  onCommentAdded?: () => void;
}

export default function CommentSection({ confessionId, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [confessionId]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments?confessionId=${confessionId}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to comment');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          confessionId,
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments(); // Refresh comments
        onCommentAdded?.(); // Update comment count in parent
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('An error occurred while posting comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    // Handle both string and Date objects from database
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Unknown time';
    }
    
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    // Handle future dates (shouldn't happen but just in case)
    if (diffInMs < 0) {
      return 'Just now';
    }
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    // Show full date for older comments
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="loading-aurora mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {localStorage.getItem('token') && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts on this confession..."
            className="input-aurora resize-none h-24"
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {newComment.length}/500 characters
            </span>
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="btn-teal px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
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
            <div key={comment.id} className="glass-aurora p-4 rounded-2xl">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-sm font-bold">A</span>
                  </div>
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Anonymous</span>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {formatDate(comment.created_at)}
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