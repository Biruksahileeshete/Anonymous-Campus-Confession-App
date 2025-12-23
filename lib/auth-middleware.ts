import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { simpleDb } from './neon-db';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

export async function authenticateToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return { error: 'Access token required', status: 401 };
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set in production');
      return { error: 'Server configuration error - JWT_SECRET missing', status: 500 };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret) as any;
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      if (jwtError instanceof jwt.JsonWebTokenError) {
        return { error: 'Invalid token format', status: 401 };
      }
      if (jwtError instanceof jwt.TokenExpiredError) {
        return { error: 'Token expired', status: 401 };
      }
      return { error: 'Token verification failed', status: 401 };
    }

    if (!decoded.userId) {
      return { error: 'Invalid token payload', status: 401 };
    }

    // Get fresh user data
    let user;
    try {
      user = await simpleDb.getUserById(decoded.userId);
    } catch (dbError) {
      console.error('Database error when fetching user:', dbError);
      return { error: 'Database connection error', status: 500 };
    }

    if (!user) {
      return { error: 'User not found', status: 401 };
    }

    // Check if user is banned
    if (user.is_banned) {
      return { error: 'Account is banned', status: 403 };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        student_id: user.student_id
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Authentication failed', status: 500 };
  }
}

export function requireAuth(handler: (request: NextRequest, user: any) => Promise<Response>) {
  return async (request: NextRequest) => {
    const authResult = await authenticateToken(request);
    
    if (authResult.error) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { 
          status: authResult.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request, authResult.user);
  };
}

export function requireAdmin(handler: (request: NextRequest, user: any) => Promise<Response>) {
  return async (request: NextRequest) => {
    const authResult = await authenticateToken(request);
    
    if (authResult.error) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { 
          status: authResult.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (authResult.user?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request, authResult.user);
  };
}