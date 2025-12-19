import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { requireAuth } from '@/lib/auth-middleware';

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const confessionId = searchParams.get('confessionId');
    
    if (!confessionId) {
      return NextResponse.json({ error: 'Confession ID required' }, { status: 400 });
    }
    
    const userReactions = await simpleDb.getUserReactions(confessionId, user.id);
    return NextResponse.json({ userReactions });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to fetch reactions' }, { status: 500 });
  }
});

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { confessionId, type, action } = await request.json();
    
    if (!confessionId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Allow any emoji as reaction type
    if (typeof type !== 'string' || type.length === 0) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }
    
    // Check if user already has this specific reaction
    const existingReaction = await simpleDb.getUserSpecificReaction(confessionId, user.id, type);
    
    if (action === 'remove' || existingReaction) {
      // Remove reaction
      await simpleDb.deleteSpecificReaction(confessionId, user.id, type);
    } else {
      // Add new reaction
      await simpleDb.createReaction({
        confession_id: confessionId,
        user_id: user.id,
        type
      });
    }
    
    // Update confession reaction counts
    await simpleDb.updateConfessionReactionCounts(confessionId);
    
    // Get updated confession data
    const confession = await simpleDb.getConfessionById(confessionId);
    
    return NextResponse.json({ 
      success: true, 
      reactionCounts: confession?.reaction_counts || {}
    });
  } catch (error) {
    console.error('Error creating reaction:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to create reaction' }, { status: 500 });
  }
});

export const DELETE = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { confessionId, type } = await request.json();
    
    if (!confessionId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await simpleDb.deleteSpecificReaction(confessionId, user.id, type);
    await simpleDb.updateConfessionReactionCounts(confessionId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reaction:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to delete reaction' }, { status: 500 });
  }
});