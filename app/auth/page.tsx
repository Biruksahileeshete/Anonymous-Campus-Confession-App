'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: false 
      });
      
      if (result?.error) {
        setError('Google sign-in failed. Please try again.');
      } else if (result?.ok) {
        const session = await getSession();
        if (session?.user) {
          localStorage.setItem('user', JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.full_name,
            student_id: session.user.student_id,
            role: session.user.role
          }));
          
          localStorage.setItem('token', `google_${session.user.id}_${Date.now()}`);
          
          if (session.user.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/dashboard');
          }
        }
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      studentId: '',
      fullName: ''
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Branding */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-coral-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30">
                  <span className="text-3xl text-white">✨</span>
                </div>
                <h1 className="text-5xl font-bold text-aurora">
                  Aurora Confessions
                </h1>
              </div>
              
              <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Where <span className="text-aurora">Anonymous</span> Voices Connect
              </h2>
              <p className="text-xl mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Share your thoughts, confess your feelings, and connect with your campus community—all while keeping your identity protected.
              </p>
            </div>

            <div className="space-y-6">
              <div className="glass-coral p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-coral-500 to-coral-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-coral-600">Verified Community</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Only authenticated students from your campus</p>
                  </div>
                </div>
              </div>

              <div className="glass-teal p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">👁️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-teal-600">Complete Anonymity</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>No personal data stored with your posts</p>
                  </div>
                </div>
              </div>

              <div className="glass-amber p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">🛡️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-amber-600">Community Moderation</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Report system and admin oversight for safety</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="max-w-md mx-auto w-full auth-form-container">
            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 glass-aurora rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => {
                  if (!isLogin) toggleMode();
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-center font-medium transition-all duration-300 ${
                  isLogin 
                    ? 'btn-aurora shadow-lg text-white' 
                    : 'hover:glass-aurora'
                }`}
                style={{ color: isLogin ? 'white' : 'var(--text-secondary)' }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isLogin) toggleMode();
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-center font-medium transition-all duration-300 ${
                  !isLogin 
                    ? 'btn-aurora shadow-lg text-white' 
                    : 'hover:glass-aurora'
                }`}
                style={{ color: !isLogin ? 'white' : 'var(--text-secondary)' }}
              >
                Sign Up
              </button>
            </div>

            {/* Auth Card */}
            <div className="card-aurora p-8 shadow-2xl auth-form-content">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-aurora">
                  {isLogin ? 'Welcome Back' : 'Join Our Community'}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {isLogin 
                    ? 'Sign in to continue your journey' 
                    : 'Create your account to get started'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">👤</span>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
                          style={{ 
                            backgroundColor: 'var(--bg-primary)', 
                            borderColor: 'var(--border-primary)',
                            color: 'var(--text-primary)'
                          }}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Student ID
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">🎓</span>
                        <input
                          type="text"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
                          style={{ 
                            backgroundColor: 'var(--bg-primary)', 
                            borderColor: 'var(--border-primary)',
                            color: 'var(--text-primary)'
                          }}
                          placeholder="Enter your student ID"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">📧</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
                      style={{ 
                        backgroundColor: 'var(--bg-primary)', 
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
                      style={{ 
                        backgroundColor: 'var(--bg-primary)', 
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl hover:text-coral-400 transition-colors"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">🔒</span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-12 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
                        style={{ 
                          backgroundColor: 'var(--bg-primary)', 
                          borderColor: 'var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl hover:text-coral-400 transition-colors"
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">⚠️</span>
                      <span className="text-red-300">{error}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-aurora w-full py-4 px-6 font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                    </div>
                  ) : (
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  )}
                </button>
              </form>

              {/* Google Sign-In - Light Mode Only */}
              <div className="block dark:hidden mt-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className={`w-full py-4 px-6 border-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-xl hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    color: 'var(--text-primary)', 
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>

            <p className="text-center text-sm mt-6" style={{ color: 'var(--text-tertiary)' }}>
              By continuing, you agree to our{' '}
              <a 
                href="/terms" 
                className="text-coral-500 hover:text-coral-600 transition-colors font-medium"
                style={{ textDecoration: 'none' }}
              >
                Terms
              </a>
              {' '}and{' '}
              <a 
                href="/privacy" 
                className="text-coral-500 hover:text-coral-600 transition-colors font-medium"
                style={{ textDecoration: 'none' }}
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  ); 
}