import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import PerformanceMonitor from '@/components/PerformanceMonitor';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: 'Aurora Confessions',
  description: 'Share your thoughts anonymously with your campus community',
  keywords: 'anonymous, confession, campus, university, students, community, aurora',
  authors: [{ name: 'Aurora Confessions Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Aurora Confessions',
    description: 'Share your thoughts anonymously with your campus community',
    type: 'website',
  },
  other: {
    'theme-color': '#ef7454',
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic';
export const revalidate = false;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        {/* Preload critical CSS */}
        <link rel="preload" href="/api/confessions?limit=20" as="fetch" crossOrigin="anonymous" />
        {/* Performance hints */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <PerformanceMonitor />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}