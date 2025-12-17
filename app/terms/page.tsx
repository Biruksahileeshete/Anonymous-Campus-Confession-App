'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-coral-50 via-teal-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/auth" 
            className="inline-flex items-center gap-2 text-coral-500 hover:text-coral-600 font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-coral-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30">
                <span className="text-2xl text-white">📋</span>
              </div>
              <h1 className="text-4xl font-bold text-aurora">Terms of Service</h1>
            </div>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Last updated: December 17, 2024
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="card-aurora p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-coral-600 mb-4">1. Acceptance of Terms</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              By accessing and using Aurora Confessions, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-teal-600 mb-4">2. Use License</h2>
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Permission is granted to temporarily use Aurora Confessions for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: 'var(--text-secondary)' }}>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-amber-600 mb-4">3. Community Guidelines</h2>
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Aurora Confessions is a safe space for anonymous sharing. Users must:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: 'var(--text-secondary)' }}>
              <li>Respect other community members</li>
              <li>Not post harmful, offensive, or illegal content</li>
              <li>Not attempt to identify other users</li>
              <li>Not spam or post repetitive content</li>
              <li>Report inappropriate content when encountered</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-emerald-600 mb-4">4. Privacy and Anonymity</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We are committed to protecting your anonymity. While we collect minimal data for authentication purposes, 
              your confessions are not linked to your identity. However, we reserve the right to cooperate with law 
              enforcement if illegal activities are suspected.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-coral-600 mb-4">5. Content Moderation</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We reserve the right to remove content that violates our community guidelines. Repeated violations 
              may result in account suspension or termination. Our moderation team reviews reported content and 
              takes appropriate action to maintain a safe environment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-teal-600 mb-4">6. Disclaimer</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The materials on Aurora Confessions are provided on an 'as is' basis. Aurora Confessions makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties including without limitation, 
              implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
              of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-amber-600 mb-4">7. Limitations</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              In no event shall Aurora Confessions or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability to 
              use the materials on Aurora Confessions, even if Aurora Confessions or an authorized representative has been 
              notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-emerald-600 mb-4">8. Contact Information</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              If you have any questions about these Terms of Service, please contact us through the appropriate channels 
              within the application or through your institution's support system.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link 
            href="/auth" 
            className="btn-aurora px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}