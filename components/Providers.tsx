"use client";

import SessionProvider from './SessionProvider';
import { ThemeProvider } from './ThemeProvider';
import LoadingOverlay from './LoadingOverlay';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <LoadingOverlay />
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}
