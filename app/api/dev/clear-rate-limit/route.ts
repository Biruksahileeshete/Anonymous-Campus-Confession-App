import { NextRequest, NextResponse } from 'next/server';
import { clearRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { identifier } = await request.json();
    clearRateLimit(identifier);
    
    return NextResponse.json({ 
      success: true, 
      message: identifier ? `Rate limit cleared for ${identifier}` : 'All rate limits cleared' 
    });
  } catch (error) {
    console.error('Error clearing rate limit:', error);
    return NextResponse.json({ error: 'Failed to clear rate limit' }, { status: 500 });
  }
}