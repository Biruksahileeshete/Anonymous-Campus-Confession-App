import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { requireAuth } from '@/lib/auth-middleware';

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const body = await request.json();
    const { confessionId, content } = body;
    
    if (!confessionId || !content?.trim()) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        success: false
      }, { status: 400 });
    }

    const cleanContent = content.trim();
    
    // Create comment with minimal data for speed
    const comment = await simpleDb.createCommentFast({
      confession_id: confessionId,
      content: cleanContent,
      author_id: user.id
    });
    
    // Return immediately with minimal data
    return NextResponse.json({ 
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        author_name: 'Anonymous',
        created_at: comment.created_at || new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Fast comment error:', {
      error: error instanceof Error ? error.message : 'Unknown',
      userId: user?.id,
      timestamp: Date.now()
    });
    
    return NextResponse.json({ 
      error: 'Failed to add comment',
      success: false
    }, { status: 500 });
  }
});