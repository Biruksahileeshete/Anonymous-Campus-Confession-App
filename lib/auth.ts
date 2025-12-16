import { getCurrentUser as getSimpleUser } from './simple-auth';

export function getCurrentUser() {
  return getSimpleUser();
}

export function isAuthenticated() {
  return !!getSimpleUser();
}

export function getUserId() {
  return getSimpleUser()?.uid || null;
}

// Simple admin check - in a real app, this would check against a database
export function isAdmin(userId?: string) {
  // For demo purposes, you can add specific UIDs here
  const adminUIDs = [
    // Add admin user IDs here
  ];
  
  return userId ? adminUIDs.includes(userId) : false;
}

export async function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}