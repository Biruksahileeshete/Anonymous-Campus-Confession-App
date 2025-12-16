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
      <div className="glass-strong rounded-2xl p-8 opacity-75">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🔒</div>
          <p className="font-semibold text-lg" style={{ color: 'var(--text-secondary)' }}>
            This confession has been hidden by moderators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 group hover:glass-strong transition-all duration-300 animate-slideInUp">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <span className="text-white text-lg">🎭</span>
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Anonymous</p>
              <span 
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ 
                  background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))',
                  color: 'var(--text-inverse)'
                }}
              >
                {formatDate(confession.created_at)}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="p-3 rounded-xl glass hover:glass-strong transition-all duration-300 group/report"
          style={{ color: 'var(--text-tertiary)' }}
          title="Report this confession"
        >
          <span className="group-hover/report:scale-110 transition-transform duration-300 inline-block text-lg">🚩</span>
        </button>
      </div>

      <div className="mb-8">
        <p 
          className="leading-relaxed whitespace-pre-wrap text-lg font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
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
            className="glass px-4 py-3 rounded-xl hover:glass-strong transition-all duration-300 flex items-center space-x-3 font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            <span className="text-lg">💬</span>
            <span>{showComments ? 'Hide Comments' : 'Comments'}</span>
            <span 
              className="text-sm px-2 py-1 rounded-full font-bold"
              style={{ 
                background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))',
                color: 'var(--text-inverse)'
              }}
            >
              {commentCount}
            </span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="mt-8 pt-6" style={{ borderTop: `1px solid var(--border-primary)` }}>
          <div className="animate-slideInUp">
            <CommentSection
              confessionId={confession.id}
              onCommentAdded={fetchCommentCount}
            />
          </div>
        </div>
      )}

      {showReportModal && (
        <ReportModal
          confessionId={confession.id}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            setShowReportModal(false);
            // Show modern success toast
            const toast = document.createElement('div');
            toast.className = 'fixed top-6 right-6 glass-strong text-green-400 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center space-x-3 animate-slideInRight';
            toast.innerHTML = '<span class="text-xl">✅</span><span class="font-semibold">Report submitted successfully</span>';
            document.body.appendChild(toast);
            setTimeout(() => {
              toast.style.animation = 'slideInRight 0.3s ease-out reverse';
              setTimeout(() => document.body.removeChild(toast), 300);
            }, 3000);
          }}
        />
      )}
    </div>
  );
}