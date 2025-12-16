'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

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

export default function AdminConfessions() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfessions();
  }, []);

  const fetchConfessions = async () => {
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Confession Management</h1>
            <p className="text-white/70 text-lg">Review and manage all confessions</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : confessions.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-white mb-2">No Confessions Yet</h3>
              <p className="text-white/70">Confessions will appear here once users start posting</p>
            </div>
          ) : (
            <div className="space-y-6">
              {confessions.map((confession) => (
                <div key={confession.id} className={`bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 ${confession.is_hidden ? 'opacity-50 border-red-500/50' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {confession.author_name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{confession.author_name}</p>
                        <p className="text-white/60 text-sm">{confession.author_email}</p>
                        <p className="text-white/50 text-xs">{formatDate(confession.created_at)}</p>
                      </div>
                      {confession.is_hidden && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {confession.is_hidden ? (
                        <button 
                          onClick={() => handleAction('unhide_confession', confession.id)}
                          className="px-3 py-1 bg-green-500/80 text-white rounded-lg hover:bg-green-600 transition text-sm backdrop-blur-sm"
                        >
                          Restore
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAction('hide_confession', confession.id)}
                          className="px-3 py-1 bg-yellow-500/80 text-white rounded-lg hover:bg-yellow-600 transition text-sm backdrop-blur-sm"
                        >
                          Hide
                        </button>
                      )}
                      <button 
                        onClick={() => handleAction('delete_confession', confession.id)}
                        className="px-3 py-1 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition text-sm backdrop-blur-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-white">{confession.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <span>👍 {confession.like_count}</span>
                      <span>😂 {confession.laugh_count}</span>
                      <span>😢 {confession.sad_count}</span>
                    </div>
                    <div className="text-xs text-white/50">
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