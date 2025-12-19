'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Flag, AlertTriangle, Shield, MessageSquare, Eye, EyeOff, UserX, AlertCircle, CheckCircle } from 'lucide-react';

// Dynamically import AdminSidebar to avoid SSR issues
const AdminSidebar = dynamic(() => import('@/components/AdminSidebar'), {
  ssr: false,
  loading: () => <div className="w-64 h-screen bg-gray-100 animate-pulse" />
});

interface Report {
  id: string;
  confession_id: string;
  reported_by: string;
  reason: string;
  explanation?: string;
  created_at: string;
  confession_content?: string;
  confession_author_id?: string;
  reporter_name?: string;
  reporter_email?: string;
  author_name?: string;
  author_email?: string;
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAdminAction = async (action: string, targetId: string) => {
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
          targetId,
          reason: 'Admin action from reports'
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchReports(); // Refresh the reports
      } else {
        alert('Failed to perform action');
      }
    } catch (error) {
      console.error('Error performing admin action:', error);
      alert('An error occurred');
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchReports();
    }
  }, [mounted]);

  const fetchReports = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        console.error('Failed to fetch reports:', response.status);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'hate_speech': return 'Hate Speech';
      case 'harassment': return 'Harassment';
      case 'spam': return 'Spam';
      case 'other': return 'Other';
      default: return reason;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'hate_speech': return 'bg-red-100 text-red-800';
      case 'harassment': return 'bg-orange-100 text-orange-800';
      case 'spam': return 'bg-yellow-100 text-yellow-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (!mounted) {
    return (
      <div className="flex min-h-screen">
        <div className="w-64 h-screen bg-gray-100 animate-pulse" />
        <div className="flex-1 ml-64 p-8">
          <div className="card-aurora p-12 text-center">
            <div className="loading-aurora mx-auto mb-4"></div>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8 animate-slideInUp">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30">
                <Flag className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-aurora">Reports Management</h1>
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Review and manage reported content</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="card-aurora p-12 max-w-md mx-auto">
                <div className="loading-aurora mx-auto mb-4"></div>
                <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading reports...</p>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="card-aurora p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
              <h3 className="text-xl font-bold text-aurora mb-2">No Reports!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>All content is clean. Great job, community!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reports.map((report) => (
                <div key={report.id} className="card-aurora p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReasonColor(report.reason)}`}>
                        {getReasonLabel(report.reason)}
                      </span>
                      <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        Reported {formatDate(report.created_at)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleAdminAction('hide_confession', report.confession_id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                      >
                        Hide Content
                      </button>
                      <button 
                        onClick={() => handleAdminAction('warn_user', report.confession_author_id)}
                        className="px-3 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm"
                      >
                        Warn Author
                      </button>
                      <button 
                        onClick={() => handleAdminAction('warn_user', report.reported_by)}
                        className="px-3 py-1 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition text-sm"
                      >
                        Warn Reporter
                      </button>
                      <button 
                        onClick={() => handleAdminAction('dismiss_report', report.id)}
                        className="px-3 py-1 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition text-sm"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>

                  {/* User Information */}
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-teal p-4 rounded-lg">
                      <h4 className="font-medium text-teal-600 mb-2">Content Author:</h4>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{report.author_name || 'Unknown'}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{report.author_email || 'No email'}</p>
                    </div>
                    <div className="glass-coral p-4 rounded-lg">
                      <h4 className="font-medium text-coral-600 mb-2">Reported By:</h4>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{report.reporter_name || 'Unknown'}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{report.reporter_email || 'No email'}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Reported Content:</h4>
                    <div className="glass p-4 rounded-lg">
                      <p style={{ color: 'var(--text-primary)' }}>
                        {report.confession_content || 'Content not available'}
                      </p>
                    </div>
                  </div>

                  {report.explanation && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Reporter's Explanation:</h4>
                      <div className="glass p-4 rounded-lg">
                        <p style={{ color: 'var(--text-secondary)' }}>{report.explanation}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    <span>Report ID: {report.id}</span>
                    <span>Confession ID: {report.confession_id}</span>
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