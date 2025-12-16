import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confessionId = searchParams.get('confessionId');
    
    if (!confessionId) {
      return NextResponse.json({ error: 'Confession ID required' }, { status: 400 });
    }
    
    const count = await simpleDb.getCommentCount(confessionId);
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching comment count:', error);
    return NextResponse.json({ error: 'Failed to fetch comment count' }, { status: 500 });
  }
}