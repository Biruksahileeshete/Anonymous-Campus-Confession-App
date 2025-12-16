import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { validateComment, sanitizeInput } from '@/lib/validation';
import { requireAuth } from '@/lib/auth-middleware';

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const confessionId = searchParams.get('confessionId');
    
    if (!confessionId) {
      return NextResponse.json({ error: 'Confession ID required' }, { status: 400 });
    }
    
    const comments = await simpleDb.getCommentsByConfessionId(confessionId);
    return NextResponse.json(comments || []);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
});

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { confessionId, content } = await request.json();
    
    if (!confessionId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate and sanitize content
    const sanitizedContent = sanitizeInput(content);
    const validation = validateComment(sanitizedContent);
    
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const newComment = await simpleDb.createComment({
      confession_id: confessionId,
      content: sanitizedContent,
      author_id: user.id
    });
    
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
});