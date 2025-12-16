// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzAMdO_DDSMpxKIqzOOtiEAPD6_5dncoU",
  authDomain: "anonymous-campus-confession.firebaseapp.com",
  projectId: "anonymous-campus-confession",
  storageBucket: "anonymous-campus-confession.firebasestorage.app",
  messagingSenderId: "418634680706",
  appId: "1:418634680706:web:dfffeae2e07e9d0b3ce79b",
  measurementId: "G-V5RKCXTSNS"
};

// Initialize Firebase only on client side
let app: any = null;
let auth: any = null;

if (typeof window !== 'undefined') {
  const { initializeApp } = require('firebase/app');
  const { getAuth, signInAnonymously, onAuthStateChanged } = require('firebase/auth');
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { auth };

export async function anonymousSignIn() {
  if (typeof window === 'undefined') {
    // Server side - return mock user
    return { uid: 'mock-user-' + Date.now() };
  }
  
  try {
    const { signInAnonymously } = await import('firebase/auth');
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous sign-in error:', error);
    // Return mock user for development
    return { uid: 'mock-user-' + Date.now() };
  }
}

export function onAuthChange(callback: (user: any) => void) {
  if (typeof window === 'undefined') {
    // Server side - call with mock user
    setTimeout(() => callback({ uid: 'mock-user-' + Date.now() }), 100);
    return () => {};
  }
  
  try {
    const { onAuthStateChanged } = require('firebase/auth');
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    console.error('Auth state change error:', error);
    // Fallback with mock user
    setTimeout(() => callback({ uid: 'mock-user-' + Date.now() }), 100);
    return () => {};
  }
}