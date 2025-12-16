import { NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';

export async function GET() {
  try {
    // Test database connection
    const stats = await simpleDb.getStats();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      stats
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database connection failed'
    }, { status: 500 });
  }
}