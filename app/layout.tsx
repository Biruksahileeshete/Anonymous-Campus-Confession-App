import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import LoadingOverlay from '@/components/LoadingOverlay';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aurora Confessions',
  description: 'Share your thoughts anonymously with your campus community',
  keywords: 'anonymous, confession, campus, university, students, community, aurora',
  authors: [{ name: 'Aurora Confessions Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <SessionProvider>
            <LoadingOverlay />
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}