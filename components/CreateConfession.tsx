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
    <div className="glass-strong rounded-3xl p-8 group hover:glass transition-all duration-300">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl group-hover:scale-105 transition-transform duration-300">
          <span className="text-2xl">✨</span>
        </div>
        <h2 className="text-3xl font-bold gradient-text mb-3">Share Your Confession</h2>
        <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
          Express yourself anonymously in a safe space
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-4 text-lg" style={{ color: 'var(--text-primary)' }}>
            Your confession
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share your thoughts, feelings, or experiences... Your confession is completely anonymous and safe."
            className="input-modern w-full h-40 resize-none text-lg"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center space-x-2" style={{ color: 'var(--text-tertiary)' }}>
              <span className="text-lg">💡</span>
              <span className="text-sm font-medium">Be respectful and kind to create a positive community</span>
            </div>
            <div className={`text-sm font-bold px-3 py-1 rounded-full ${
              content.length > 900 
                ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' 
                : 'bg-gray-500/20'
            }`} style={{ color: content.length > 900 ? undefined : 'var(--text-tertiary)' }}>
              {content.length}/1000
            </div>
          </div>
        </div>

        {error && (
          <div className="glass p-4 rounded-2xl border-2 border-red-500/30 animate-slideInUp">
            <div className="flex items-center space-x-3 text-red-400">
              <span className="text-xl">⚠️</span>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="btn-primary w-full py-4 px-8 text-lg font-semibold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {submitting ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-3 border-transparent border-t-current"></div>
              <span>Posting...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <span className="text-xl">🚀</span>
              <span>Post Confession Anonymously</span>
            </div>
          )}
        </button>
      </form>

      <div className="mt-8 glass p-6 rounded-2xl">
        <div className="flex items-center justify-center space-x-6 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔒</span>
            <span>100% Anonymous</span>
          </div>
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--border-secondary)' }}></div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🛡️</span>
            <span>Safe & Secure</span>
          </div>
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--border-secondary)' }}></div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">❤️</span>
            <span>Community Driven</span>
          </div>
        </div>
      </div>
    </div>
  );
}