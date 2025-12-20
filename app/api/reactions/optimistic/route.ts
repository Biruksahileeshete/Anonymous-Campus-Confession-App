import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { requireAuth } from '@/lib/auth-middleware';

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const body = await request.json();
    const { confessionId, emoji, action } = body;
    
    if (!confessionId || !emoji) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        success: false
      }, { status: 400 });
    }

    const cleanEmoji = emoji.trim();
    
    // Use upsert pattern for better performance
    if (action === 'remove') {
      await simpleDb.deleteSpecificReaction(confessionId, user.id, cleanEmoji);
    } else {
      // Use ON CONFLICT to handle race conditions
      await simpleDb.upsertReaction({
        confession_id: confessionId,
        user_id: user.id,
        type: cleanEmoji
      });
    }
    
    // Update counts in background (non-blocking)
    setImmediate(async () => {
      try {
        await simpleDb.updateConfessionReactionCounts(confessionId);
      } catch (error) {
        console.error('Background count update failed:', error);
      }
    });
    
    // Get current counts (may be slightly stale, but fast)
    const confession = await simpleDb.getConfessionById(confessionId);
    
    return NextResponse.json({ 
      success: true,
      reactionCounts: confession?.reaction_counts || {},
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Optimistic reaction error:', {
      error: error instanceof Error ? error.message : 'Unknown',
      userId: user?.id,
      timestamp: Date.now()
    });
    
    return NextResponse.json({ 
      error: 'Failed to process reaction',
      success: false
    }, { status: 500 });
  }
});