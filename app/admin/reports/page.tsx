'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

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

  const handleAdminAction = async (action: string, targetId: string) => {
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
    fetchReports();
  }, []);

  const fetchReports = async () => {
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Reports Management</h1>
            <p className="text-white/70 text-lg">Review and manage reported content</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-white mb-2">No Reports!</h3>
              <p className="text-white/70">All content is clean. Great job, community!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reports.map((report) => (
                <div key={report.id} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReasonColor(report.reason)}`}>
                        {getReasonLabel(report.reason)}
                      </span>
                      <span className="text-white/60 text-sm">
                        Reported {formatDate(report.created_at)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleAdminAction('hide_confession', report.confession_id)}
                        className="px-3 py-1 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition text-sm backdrop-blur-sm"
                      >
                        Hide Content
                      </button>
                      <button 
                        onClick={() => handleAdminAction('warn_user', report.confession_author_id)}
                        className="px-3 py-1 bg-yellow-500/80 text-white rounded-lg hover:bg-yellow-600 transition text-sm backdrop-blur-sm"
                      >
                        Warn Author
                      </button>
                      <button 
                        onClick={() => handleAdminAction('warn_user', report.reported_by)}
                        className="px-3 py-1 bg-orange-500/80 text-white rounded-lg hover:bg-orange-600 transition text-sm backdrop-blur-sm"
                      >
                        Warn Reporter
                      </button>
                      <button 
                        onClick={() => handleAdminAction('dismiss_report', report.id)}
                        className="px-3 py-1 bg-gray-500/80 text-white rounded-lg hover:bg-gray-600 transition text-sm backdrop-blur-sm"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>

                  {/* User Information */}
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">👤 Content Author:</h4>
                      <p className="text-blue-700 font-medium">{report.author_name || 'Unknown'}</p>
                      <p className="text-blue-600 text-sm">{report.author_email || 'No email'}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-medium text-orange-800 mb-2">🚩 Reported By:</h4>
                      <p className="text-orange-700 font-medium">{report.reporter_name || 'Unknown'}</p>
                      <p className="text-orange-600 text-sm">{report.reporter_email || 'No email'}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-white mb-2">📝 Reported Content:</h4>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-white">
                        {report.confession_content || 'Content not available'}
                      </p>
                    </div>
                  </div>

                  {report.explanation && (
                    <div className="mb-4">
                      <h4 className="font-medium text-white mb-2">💬 Reporter's Explanation:</h4>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-white/80">{report.explanation}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-white/50">
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