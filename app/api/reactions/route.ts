import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { requireAuth } from '@/lib/auth-middleware';

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const confessionId = searchParams.get('confessionId');
    
    if (!confessionId) {
      return NextResponse.json({ 
        error: 'Confession ID is required',
        userReactions: []
      }, { status: 400 });
    }
    
    const userReactions = await simpleDb.getUserReactions(confessionId, user.id);
    return NextResponse.json({ 
      userReactions: Array.isArray(userReactions) ? userReactions : [],
      success: true
    });
  } catch (error) {
    console.error('Error fetching reactions:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ 
      error: 'Failed to fetch reactions',
      userReactions: []
    }, { status: 500 });
  }
});

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const body = await request.json();
    const { confessionId, type, action } = body;
    
    if (!confessionId || !type) {
      return NextResponse.json({ 
        error: 'Missing required fields: confessionId and type are required',
        success: false
      }, { status: 400 });
    }
    
    // Validate emoji type
    if (typeof type !== 'string' || type.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Invalid reaction type: must be a non-empty string',
        success: false
      }, { status: 400 });
    }
    
    // Validate action
    if (action && !['add', 'remove'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action: must be "add" or "remove"',
        success: false
      }, { status: 400 });
    }
    
    const cleanType = type.trim();
    
    // Check if user already has this specific reaction
    const existingReaction = await simpleDb.getUserSpecificReaction(confessionId, user.id, cleanType);
    
    if (action === 'remove' || existingReaction) {
      // Remove reaction
      await simpleDb.deleteSpecificReaction(confessionId, user.id, cleanType);
    } else {
      // Add new reaction
      await simpleDb.createReaction({
        confession_id: confessionId,
        user_id: user.id,
        type: cleanType
      });
    }
    
    // Update confession reaction counts
    await simpleDb.updateConfessionReactionCounts(confessionId);
    
    // Get updated confession data
    const confession = await simpleDb.getConfessionById(confessionId);
    
    return NextResponse.json({ 
      success: true,
      reactionCounts: confession?.reaction_counts || {},
      message: action === 'remove' || existingReaction ? 'Reaction removed' : 'Reaction added'
    });
  } catch (error) {
    console.error('Error creating reaction:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ 
      error: 'Failed to update reaction. Please try again.',
      success: false
    }, { status: 500 });
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