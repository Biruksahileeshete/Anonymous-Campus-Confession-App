'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface CreateConfessionProps {
  onSuccess: () => void;
}

export default function CreateConfession({ onSuccess }: CreateConfessionProps) {
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
    <motion.div 
      className="card-aurora group relative overflow-hidden p-8 md:p-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      {/* Header */}
      <motion.div 
        className="text-center mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-4xl font-bold text-aurora mb-4">
          ✨ Share Your Aurora Story ✨
        </h2>
        <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Let your thoughts dance across the digital sky like the northern lights. 
          Your story matters, and here it shines anonymously and beautifully.
        </p>
      </motion.div>
      
      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4"
        >
          <label className="block font-bold mb-4 text-xl text-aurora">
            🌌 Your Confession
          </label>
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What constellation of thoughts would you like to share? Pour your heart out... every word is a star in our digital aurora. ✨"
              className="input-aurora w-full h-48 resize-none text-lg p-6"
              maxLength={1000}
            />

          </div>
          
          <motion.div 
            className="flex items-center justify-between mt-4 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center space-x-3" style={{ color: 'var(--text-tertiary)' }}>
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-sm">💡</span>
              </div>
              <span className="font-medium">
                Spread kindness and create magic in our community
              </span>
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {content.length}/1000 characters
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="notification-aurora border-2 border-red-500/30"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">⚠️</span>
                </div>
                <div>
                  <p className="font-bold text-red-500">Oops! Something went wrong</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={submitting || !content.trim()}
          className="btn-aurora w-full py-5 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={!submitting && content.trim() ? { scale: 1.02 } : {}}
          whileTap={!submitting && content.trim() ? { scale: 0.98 } : {}}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {submitting ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center space-x-4"
              >
                <div className="loading-aurora w-6 h-6"></div>
                <span>Painting the Aurora...</span>
              </motion.div>
            ) : (
              <motion.div
                key="submit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center space-x-4"
              >
                <Sparkles className="w-7 h-7" />
                <span>Share Your Story</span>
                <Sparkles className="w-7 h-7" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </form>

      <motion.div 
        className="mt-10 card-aurora p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <motion.div 
            className="flex flex-col items-center space-y-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-coral-500 to-coral-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <h4 className="font-bold text-coral-600">100% Anonymous</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Your identity is completely protected
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center space-y-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h4 className="font-bold text-teal-600">Safe & Secure</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Advanced encryption keeps you safe
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center space-y-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">❤️</span>
            </div>
            <div>
              <h4 className="font-bold text-emerald-600">Community Love</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Supportive community that cares
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating particles effect */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-br from-coral-400 to-teal-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              x: [-5, 5, -5],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}