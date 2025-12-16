// Simple authentication system for demo purposes
// This replaces Firebase auth to avoid compatibility issues

let currentUser: { uid: string } | null = null;
let authCallbacks: ((user: any) => void)[] = [];

export function getCurrentUser() {
  return currentUser;
}

export async function anonymousSignIn() {
  // Generate a simple anonymous user ID
  const uid = 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  currentUser = { uid };
  
  // Store in localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('anonymous_user_id', uid);
  }
  
  // Notify callbacks
  authCallbacks.forEach(callback => callback(currentUser));
  
  return currentUser;
}

export function onAuthChange(callback: (user: any) => void) {
  // Add callback to list
  authCallbacks.push(callback);
  
  // Check for existing user in localStorage
  if (typeof window !== 'undefined') {
    const existingUid = localStorage.getItem('anonymous_user_id');
    if (existingUid) {
      currentUser = { uid: existingUid };
      callback(currentUser);
    } else {
      // Auto sign in anonymously
      anonymousSignIn();
    }
  }
  
  // Return unsubscribe function
  return () => {
    const index = authCallbacks.indexOf(callback);
    if (index > -1) {
      authCallbacks.splice(index, 1);
    }
  };
}

export const auth = {
  get currentUser() {
    return currentUser;
  }
};