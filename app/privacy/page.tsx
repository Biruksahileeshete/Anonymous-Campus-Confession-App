'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30">
                <span className="text-2xl text-white">🔒</span>
              </div>
              <h1 className="text-4xl font-bold text-aurora">Privacy Policy</h1>
            </div>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Last updated: December 17, 2024
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="card-aurora p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-coral-600 mb-4">1. Information We Collect</h2>
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Aurora Confessions is designed with privacy at its core. We collect minimal information necessary for the service to function:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: 'var(--text-secondary)' }}>
              <li><strong>Account Information:</strong> Email address, full name, and student ID for authentication</li>
              <li><strong>Content:</strong> Confessions, comments, and reactions (stored anonymously)</li>
              <li><strong>Usage Data:</strong> Basic analytics to improve the service</li>
              <li><strong>Device Information:</strong> Browser type and IP address for security purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-teal-600 mb-4">2. How We Protect Your Anonymity</h2>
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Your anonymity is our top priority:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: 'var(--text-secondary)' }}>
              <li>Confessions are not linked to your account or personal information</li>
              <li>We use advanced encryption to protect all data</li>
              <li>No tracking of individual user behavior on confessions</li>
              <li>Regular security audits to ensure data protection</li>
              <li>Staff cannot identify confession authors</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-amber-600 mb-4">3. How We Use Your Information</h2>
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              We use collected information only for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: 'var(--text-secondary)' }}>
              <li>Authenticating your access to the platform</li>
              <li>Providing customer support when needed</li>
              <li>Improving the service through anonymous analytics</li>
              <li>Ensuring platform security and preventing abuse</li>
              <li>Complying with legal requirements when necessary</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-emerald-600 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              We do not sell, trade, or share your personal information with third parties, except:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: 'var(--text-secondary)' }}>
              <li>When required by law or legal process</li>
              <li>To protect the rights, property, or safety of users</li>
              <li>With service providers who help operate the platform (under strict confidentiality)</li>
              <li>In case of a business transfer (users will be notified)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-coral-600 mb-4">5. Data Security</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We implement industry-standard security measures including encryption, secure servers, 
              regular security updates, and access controls. However, no method of transmission over 
              the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-teal-600 mb-4">6. Your Rights</h2>
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: 'var(--text-secondary)' }}>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of non-essential communications</li>
              <li>Request data portability where applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-amber-600 mb-4">7. Cookies and Tracking</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We use minimal cookies for essential functionality like keeping you logged in and 
              remembering your preferences. We do not use tracking cookies for advertising or 
              behavioral analysis. You can control cookie settings in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-emerald-600 mb-4">8. Changes to This Policy</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We may update this privacy policy from time to time. We will notify users of any 
              material changes through the platform or email. Your continued use of the service 
              after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-coral-600 mb-4">9. Contact Us</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              If you have questions about this privacy policy or how we handle your data, 
              please contact us through the appropriate channels within the application or 
              through your institution's support system.
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