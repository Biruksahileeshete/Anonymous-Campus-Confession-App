// Firebase configuration - REMOVED FOR SECURITY
// This app now uses NextAuth.js for authentication instead of Firebase
// All Firebase credentials have been removed for security reasons
const firebaseConfig = {
  // Configuration removed - using NextAuth.js instead
};

// LEGACY FILE - NO LONGER USED
// This app now uses NextAuth.js for authentication instead of Firebase
// All Firebase functionality has been replaced with NextAuth.js + PostgreSQL

// Placeholder exports to prevent import errors (if any exist)
export const auth = null;

export async function anonymousSignIn() {
  console.warn('Firebase authentication is deprecated. Use NextAuth.js instead.');
  return null;
}

export function onAuthChange(callback: (user: any) => void) {
  console.warn('Firebase authentication is deprecated. Use NextAuth.js instead.');
  return () => {};
}