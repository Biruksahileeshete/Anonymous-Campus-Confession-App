import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
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
  
  return NextResponse.next();
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};