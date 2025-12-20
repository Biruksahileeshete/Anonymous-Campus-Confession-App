'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import OptimizedCommentSection from './OptimizedCommentSection';

export default function CommentPerformanceTest() {
  const [testConfessionId] = useState('test-confession-123');
  const [performanceLog, setPerformanceLog] = useState<string[]>([]);

  const logPerformance = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setPerformanceLog(prev => [...prev.slice(-4), `${timestamp}: ${message}`]);
  };

  const handleCommentAdded = () => {
    logPerformance('Comment added - UI updated instantly!');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-aurora p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-4">
          ⚡ Instant Comment Performance Test
        </h2>
        
        <p className="text-white/80 mb-6">
          Test the instant comment system. Comments should appear immediately when you submit them,
          just like on Instagram or Twitter!
        </p>

        {/* Performance Log */}
        <div className="bg-black/20 rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-2">Performance Log:</h3>
          <div className="space-y-1 text-sm font-mono">
            {performanceLog.length === 0 ? (
              <p className="text-white/60">Add a comment to see performance metrics...</p>
            ) : (
              performanceLog.map((log, index) => (
                <p key={index} className="text-green-400">{log}</p>
              ))
            )}
          </div>
        </div>

        {/* Comment Section */}
        <OptimizedCommentSection
          confessionId={testConfessionId}
          initialComments={[
            {
              id: 'demo-1',
              content: 'This is a demo comment to show the interface!',
              author_name: 'Demo User',
              created_at: new Date(Date.now() - 60000).toISOString()
            }
          ]}
          onCommentAdded={handleCommentAdded}
        />
      </motion.div>

      <div className="text-center text-white/60 text-sm">
        <p>💡 Try adding multiple comments quickly to test the performance!</p>
        <p>Comments appear instantly with optimistic updates.</p>
      </div>
    </div>
  );
}