'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Flag,
  Sparkles
} from 'lucide-react';
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
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);


  useEffect(() => {
    fetchStats();
  }, [confession.id]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch comment count
      const commentResponse = await fetch(`/api/comments/count?confessionId=${confession.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (commentResponse.ok) {
        const commentData = await commentResponse.json();
        setCommentCount(commentData.count || 0);
      }

      // Fetch like count and user like status
      const likeResponse = await fetch(`/api/reactions/count?confessionId=${confession.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (likeResponse.ok) {
        const likeData = await likeResponse.json();
        setLikeCount(likeData.count || 0);
        setIsLiked(likeData.userLiked || false);
      }


      
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          confessionId: confession.id,
          emoji: '❤️'
        })
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        onUpdate();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
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
    
    if (diffInMs < 0) return 'Just now';
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

  if (confession.is_hidden) {
    return (
      <motion.div 
        className="card-aurora opacity-60"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            className="text-6xl mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔒
          </motion.div>
          <h3 className="text-xl font-bold text-aurora mb-2">
            Hidden Content
          </h3>
          <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
            This confession has been hidden by moderators for review.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="card-aurora group relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -8 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-coral-500 via-teal-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-xl animate-aurora-glow">
              <Sparkles className="w-7 h-7 text-white animate-aurora-pulse" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-coral-400 via-teal-400 to-emerald-400 rounded-3xl opacity-20 blur-sm"></div>
          </motion.div>
          
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-bold text-lg text-aurora">Anonymous</h3>
              <span className="badge-aurora text-xs">
                {formatDate(confession.created_at)}
              </span>
            </div>

          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => setShowReportModal(true)}
            className="glass-aurora p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            title="Report this confession"
          >
            <Flag className="w-4 h-4 text-red-400" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p 
          className="leading-relaxed whitespace-pre-wrap text-lg font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {confession.content}
        </p>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {/* Left side - Reactions */}
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl transition-all duration-300 ${
              isLiked 
                ? 'glass-coral text-coral-600' 
                : 'glass-aurora hover:glass-coral'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart 
                className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
                style={{ color: isLiked ? 'var(--coral-600)' : 'var(--text-secondary)' }}
              />
            </motion.div>
            <span className="font-semibold" style={{ color: isLiked ? 'var(--coral-600)' : 'var(--text-secondary)' }}>
              {likeCount}
            </span>
          </motion.button>

          <ReactionButtons
            confessionId={confession.id}
            onUpdate={onUpdate}
          />
        </div>
        
        {/* Right side - Comments */}
        <motion.button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
            showComments 
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-400/50 text-blue-600 dark:text-blue-400 shadow-lg' 
              : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-400/30 hover:border-blue-400/50 text-blue-600 dark:text-blue-400 shadow-sm hover:shadow-md'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="w-5 h-5" />
          <span>Comments</span>
          <motion.span 
            className="bg-blue-500/20 text-blue-700 dark:text-blue-300 min-w-[24px] h-6 flex items-center justify-center rounded-full text-sm font-bold"
            animate={{ scale: commentCount > 0 ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            {commentCount}
          </motion.span>
        </motion.button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="mt-8 pt-6 overflow-hidden"
            style={{ borderTop: `2px solid var(--border-primary)` }}
          >
            <CommentSection
              confessionId={confession.id}
              onCommentAdded={() => {
                fetchStats();
                setCommentCount(prev => prev + 1);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <ReportModal
            confessionId={confession.id}
            onClose={() => setShowReportModal(false)}
            onSuccess={() => {
              setShowReportModal(false);
              // Show beautiful success notification
              const notification = document.createElement('div');
              notification.className = 'notification-aurora fixed top-6 right-6 z-50 animate-slide-in-right';
              notification.innerHTML = `
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <p class="font-semibold text-emerald-600">Report Submitted</p>
                    <p class="text-sm" style="color: var(--text-secondary)">Thank you for keeping our community safe</p>
                  </div>
                </div>
              `;
              document.body.appendChild(notification);
              setTimeout(() => {
                notification.style.animation = 'slide-in-right 0.4s ease-out reverse';
                setTimeout(() => document.body.removeChild(notification), 400);
              }, 4000);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}