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

    const token = localStorage.getItem('token');
    if (!token) {
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
          confessionId,
          reason,
          explanation: explanation.trim() || undefined,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        alert('Report submitted successfully. Thank you for helping keep our community safe.');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Report Confession</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why are you reporting this confession?
            </label>
            <div className="space-y-2">
              {reasons.map((reasonOption) => (
                <label key={reasonOption.value} className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value={reasonOption.value}
                    checked={reason === reasonOption.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="mr-3 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{reasonOption.label}</span>
                </label>
              ))}
            </div>
          </div>

          {(reason === 'other' || reason) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Please provide more details about why you're reporting this content..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {explanation.length}/500
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason || isSubmitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All reports are reviewed by our moderation team. 
            False reports may result in restrictions on your account.
          </p>
        </div>
      </div>
    </div>
  );
}