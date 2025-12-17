'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  MessageCircle, 
  Bookmark,
  MoreVertical,
  Clock,
  Eye,
  Users,
  Copy,
  Check,
  AlertCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Header from '@/components/Header';
import { Confession } from '@/lib/types';
import CommentSection from '@/components/CommentSection';

export default function ConfessionPage() {
  const params = useParams();
  const router = useRouter();
  const confessionId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [confession, setConfession] = useState<Confession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [views, setViews] = useState(0);
  const [showComments, setShowComments] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      router.push('/auth');
      return;
    }

    setUser(JSON.parse(userData));
    fetchConfession();
  }, [confessionId, router]);

  const fetchConfession = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/confessions/${confessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch confession');
      }
      
      const data = await response.json();
      setConfession(data.confession);
      setViews(data.views || 0);
      setLiked(data.userLiked || false);
      setBookmarked(data.userBookmarked || false);
    } catch (error) {
      console.error('Error fetching confession:', error);
      setError('Failed to load confession');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/auth');
  };

  const handleLike = async () => {
    if (!user || !confession) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/confessions/${confessionId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setLiked(!liked);
        fetchConfession(); // Refresh confession data
      }
    } catch (error) {
      console.error('Error liking confession:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user || !confession) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/confessions/${confessionId}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setBookmarked(!bookmarked);
      }
    } catch (error) {
      console.error('Error bookmarking confession:', error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Anonymous Confession',
          text: 'Check out this confession on Campus Confessions',
          url: url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return postDate.toLocaleDateString();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 border-2 border-purple-500/20 border-t-purple-500 rounded-full"
          />
        </div>
      </div>
    );
  }

  if (error || !confession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header user={user} onLogout={handleLogout} />
        
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group mb-8"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-3xl blur opacity-30" />
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl mb-6"
                >
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </motion.div>
                
                <h1 className="text-3xl font-bold text-white mb-3">
                  {error || 'Confession Not Found'}
                </h1>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  This confession might have been removed or doesn't exist in our database.
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                  </Link>
                  <button
                    onClick={fetchConfession}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Confession Details</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-blue-400">#{confession.id.slice(0, 8)}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Confession Card */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl blur opacity-30" />
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="absolute -inset-1 border border-blue-500/30 rounded-xl" />
                        </div>
                        <div>
                          <h1 className="text-xl font-bold text-white">Anonymous Confession</h1>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(confession.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {views.toLocaleString()} views
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {confession.content}
                    </p>

                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="p-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 transition-all ${
                          liked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                        <span>0</span>
                      </button>
                      
                      <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>0</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleBookmark}
                        className={`p-2 rounded-lg transition-colors ${
                          bookmarked 
                            ? 'bg-yellow-500/10 text-yellow-400' 
                            : 'text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                      </button>
                      
                      <button
                        onClick={handleShare}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur opacity-30" />
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-green-400" />
                  Share this confession
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopyLink}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                        copied
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Share via...</span>
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-400">
                    Share this anonymous confession with others. The link will direct them to this page.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Comments Section */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <CommentSection confessionId={confessionId} onCommentAdded={() => {}} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Stats Card */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur opacity-30" />
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Confession Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Views</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {views.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Likes</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      0
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Comments</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      0
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Posted</span>
                    <span className="text-white font-semibold">
                      {formatTimeAgo(confession.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Confessions */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur opacity-30" />
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Related</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    <p className="text-sm text-white line-clamp-2">
                      "I wish I could tell my crush how I feel..."
                    </p>
                    <span className="text-xs text-gray-400 mt-1">2 hours ago</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    <p className="text-sm text-white line-clamp-2">
                      "This semester has been tougher than expected..."
                    </p>
                    <span className="text-xs text-gray-400 mt-1">1 day ago</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    <p className="text-sm text-white line-clamp-2">
                      "To the person who returned my lost wallet..."
                    </p>
                    <span className="text-xs text-gray-400 mt-1">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Button */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl blur opacity-30" />
              <button className="relative w-full p-4 bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>Report Content</span>
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}