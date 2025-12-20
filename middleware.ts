import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static assets and API routes for better performance
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }
  
  // For development, allow admin access without authentication
  if (pathname.startsWith('/admin') && process.env.NODE_ENV === 'production') {
    // Check for admin key in headers or query params
    const adminKey = request.headers.get('x-admin-key') || 
                     request.nextUrl.searchParams.get('adminKey');
    
    // If no admin key is provided, redirect to home
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // Add performance headers
  const response = NextResponse.next();
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

// Optimize matcher to reduce middleware overhead
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any file with extension
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};