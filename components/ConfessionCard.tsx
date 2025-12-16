'use client';

import { useState, useEffect } from 'react';
import ReactionButtons from './ReactionButtons';
import CommentSection from './CommentSection';
import ReportModal from './ReportModal';
import { Confession } from '../lib/types';

interface ConfessionCardProps {
  confession: Confession;
  currentUserId?: string;
  onUpdate: () => void;
}

export default function ConfessionCard({ confession, currentUserId, onUpdate }: ConfessionCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    fetchCommentCount();
  }, [confession.id]);

  const fetchCommentCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments/count?confessionId=${confession.id}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setCommentCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching comment count:', error);
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
    
    // Show full date for older posts
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (confession.is_hidden) {
    return (
      <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-500">
        <p>This confession has been hidden by moderators.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 hover:bg-white/30 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-white font-medium text-sm bg-gradient-to-r from-indigo-500/30 to-purple-500/30 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
            {formatDate(confession.created_at)}
          </span>
          <span className="text-white/60 text-sm font-medium">Anonymous</span>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="text-white/50 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/10"
          title="Report this confession"
        >
          🚩
        </button>
      </div>

      <div className="mb-6">
        <p className="text-white leading-relaxed whitespace-pre-wrap text-lg">
          {confession.content}
        </p>
      </div>

      <div className="flex items-center justify-between">
        {/* Reactions on the left */}
        <div className="flex-1">
          <ReactionButtons
            confessionId={confession.id}
            reactions={confession.reaction_counts || {}}
            onUpdate={onUpdate}
          />
        </div>
        
        {/* Comments on the right */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-white/80 hover:text-white transition-colors text-sm font-medium bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 flex items-center space-x-2"
          >
            <span>💬</span>
            <span>{showComments ? 'Hide' : 'Comments'}</span>
            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
              {commentCount}
            </span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="mt-6 pt-6 border-t border-white/20 animate-fadeIn">
          <CommentSection
            confessionId={confession.id}
            onCommentAdded={fetchCommentCount}
          />
        </div>
      )}

      {showReportModal && (
        <ReportModal
          confessionId={confession.id}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            setShowReportModal(false);
            // Show success toast
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            toast.textContent = 'Report submitted successfully';
            document.body.appendChild(toast);
            setTimeout(() => document.body.removeChild(toast), 3000);
          }}
        />
      )}
    </div>
  );
}