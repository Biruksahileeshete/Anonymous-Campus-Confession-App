'use client';

import { useState } from 'react';

interface CreateConfessionProps {
  onSuccess: () => void;
  userId: string;
}

export default function CreateConfession({ onSuccess, userId }: CreateConfessionProps) {
  const [content, setContent] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Confession cannot be empty');
      return;
    }
    
    if (content.length > 1000) {
      setError('Confession is too long (max 1000 characters)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to post a confession');
        return;
      }

      const response = await fetch('/api/confessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post confession');
      }
      
      setContent('');
      onSuccess();
      
      // Show success message
      alert('Confession posted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-8 backdrop-blur-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Share Your Confession</h2>
        <p className="text-white/80">Express yourself anonymously in a safe space</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">


        <div>
          <label className="block text-white font-medium mb-3">Your confession</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share your thoughts, feelings, or experiences... Your confession is completely anonymous and safe."
            className="w-full p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all h-40 resize-none"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-white/60 text-sm">
              💡 Tip: Be respectful and kind to create a positive community
            </div>
            <div className={`text-sm font-medium ${content.length > 900 ? 'text-yellow-300' : 'text-white/60'}`}>
              {content.length}/1000
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 px-6 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
        >
          {submitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
              <span>Posting...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>✨</span>
              <span>Post Confession Anonymously</span>
            </div>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-4 text-white/80 text-sm">
          <div className="flex items-center space-x-1">
            <span>🔒</span>
            <span>100% Anonymous</span>
          </div>
          <div className="w-1 h-1 bg-white/40 rounded-full"></div>
          <div className="flex items-center space-x-1">
            <span>🛡️</span>
            <span>Safe & Secure</span>
          </div>
          <div className="w-1 h-1 bg-white/40 rounded-full"></div>
          <div className="flex items-center space-x-1">
            <span>❤️</span>
            <span>Community Driven</span>
          </div>
        </div>
      </div>
    </div>
  );
}