'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { MessageSquare, ThumbsUp, Laugh, Frown, Eye, EyeOff, Trash2, RotateCcw } from 'lucide-react';

interface Confession {
  id: string;
  content: string;
  author_name: string;
  author_email: string;
  is_hidden: boolean;
  like_count: number;
  laugh_count: number;
  sad_count: number;
  created_at: string;
}

// Force dynamic rendering

export default function AdminConfessions() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfessions();
  }, []);

  const fetchConfessions = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/confessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfessions(data);
      }
    } catch (error) {
      console.error('Error fetching confessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, confessionId: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          targetId: confessionId,
          reason: 'Admin action from confessions management'
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchConfessions(); // Refresh the list
      } else {
        alert('Failed to perform action');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('An error occurred');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8 animate-slideInUp">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30">
                <MessageSquare className="w-7 h-8 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-aurora">Confession Management</h1>
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Review and manage all confessions</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="card-aurora p-12 max-w-md mx-auto">
                <div className="loading-aurora mx-auto mb-4"></div>
                <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading confessions...</p>
              </div>
            </div>
          ) : confessions.length === 0 ? (
            <div className="card-aurora p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-aurora mb-2">No Confessions Yet</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Confessions will appear here once users start posting</p>
            </div>
          ) : (
            <div className="space-y-6">
              {confessions.map((confession) => (
                <div key={confession.id} className={`card-aurora p-6 ${confession.is_hidden ? 'opacity-50 border-red-500/50' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-coral-500 to-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {confession.author_name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{confession.author_name}</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{confession.author_email}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{formatDate(confession.created_at)}</p>
                      </div>
                      {confession.is_hidden && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-600 text-xs rounded-full border border-red-500/30">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {confession.is_hidden ? (
                        <button 
                          onClick={() => handleAction('unhide_confession', confession.id)}
                          className="px-3 py-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm flex items-center gap-1"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Restore
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAction('hide_confession', confession.id)}
                          className="px-3 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm flex items-center gap-1"
                        >
                          <EyeOff className="w-4 h-4" />
                          Hide
                        </button>
                      )}
                      <button 
                        onClick={() => handleAction('delete_confession', confession.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="glass p-4 rounded-lg">
                      <p style={{ color: 'var(--text-primary)' }}>{confession.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {confession.like_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Laugh className="w-4 h-4" />
                        {confession.laugh_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Frown className="w-4 h-4" />
                        {confession.sad_count}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      ID: {confession.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}