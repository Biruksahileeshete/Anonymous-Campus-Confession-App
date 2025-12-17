'use client';

import { useState } from 'react';

interface ReportModalProps {
  confessionId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportModal({ confessionId, onClose, onSuccess }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    { value: 'hate_speech', label: 'Hate Speech or Discrimination' },
    { value: 'harassment', label: 'Harassment or Bullying' },
    { value: 'spam', label: 'Spam or Irrelevant Content' },
    { value: 'other', label: 'Other (please explain)' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (!token || !user.id) {
      alert('Please log in to report content');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          confession_id: confessionId,
          reported_by: user.id,
          reason,
          explanation: explanation.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
        // Show success message without blocking
        setTimeout(() => {
          alert('✅ Report submitted successfully! Thank you for keeping our community safe.');
        }, 100);
      } else {
        alert(data.error || 'Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="card-aurora max-w-md w-full p-8 animate-slideInUp">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-aurora flex items-center gap-2">
            🚨 Report Content
          </h3>
          <button
            onClick={onClose}
            className="text-2xl hover:text-coral-500 transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              🤔 Why are you reporting this confession?
            </label>
            <div className="space-y-3">
              {reasons.map((reasonOption) => (
                <label key={reasonOption.value} className="flex items-center glass-coral p-3 rounded-xl cursor-pointer hover:scale-105 transition-transform">
                  <input
                    type="radio"
                    name="reason"
                    value={reasonOption.value}
                    checked={reason === reasonOption.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="mr-4 w-4 h-4 text-coral-500"
                  />
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {reasonOption.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {(reason === 'other' || reason) && (
            <div>
              <label className="block text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                📝 Additional details {reason !== 'other' && '(optional)'}
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="💭 Please provide more details about why you're reporting this content..."
                className="input-modern w-full resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-right text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
                {explanation.length}/500 characters
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 glass-aurora rounded-xl font-semibold hover:scale-105 transition-transform"
              style={{ color: 'var(--text-primary)' }}
            >
              ❌ Cancel
            </button>
            <button
              type="submit"
              disabled={!reason || isSubmitting}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Submitting...
                </span>
              ) : (
                '🚨 Submit Report'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 glass-amber p-4 rounded-xl">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            <strong>⚠️ Important:</strong> All reports are reviewed by our moderation team. 
            False reports may result in account restrictions.
          </p>
        </div>
      </div>
    </div>
  );
}