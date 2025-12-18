import { NextRequest, NextResponse } from 'next/server';
import { fastQuery } from '@/lib/neon-db';
import { cache, cacheKeys } from '@/lib/cache';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confessionId = searchParams.get('confessionId');
    
    if (!confessionId) {
      return NextResponse.json({ error: 'Confession ID is required' }, { status: 400 });
    }

    // Check cache for reaction count
    const cacheKey = cacheKeys.reactions(confessionId);
    let cachedCount = cache.get(cacheKey);
    
    let count = 0;
    if (cachedCount !== null) {
      count = cachedCount;
    } else {
      // Get total reaction count for this confession
      const reactionCountResult = await fastQuery(`
        SELECT COUNT(*) as count
        FROM reactions 
        WHERE confession_id = $1
      `, [confessionId]);
      
      count = parseInt(reactionCountResult.rows[0]?.count || '0');
      
      // Cache for 5 minutes
      cache.set(cacheKey, count, 300);
    }
    
    // Check if user has liked this confession (if authenticated)
    let userLiked = false;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // Check cache for user reaction
        const userCacheKey = cacheKeys.userReactions(confessionId, decoded.userId);
        const cachedUserReaction = cache.get(userCacheKey);
        
        if (cachedUserReaction !== null) {
          userLiked = cachedUserReaction;
        } else {
          const userReactionResult = await fastQuery(`
            SELECT 1 FROM reactions 
            WHERE confession_id = $1 AND user_id = $2
            LIMIT 1
          `, [confessionId, decoded.userId]);
          
          userLiked = userReactionResult.rows.length > 0;
          
          // Cache user reaction for 10 minutes
          cache.set(userCacheKey, userLiked, 600);
        }
      } catch (error) {
        // Invalid token, continue without user status
      }
    }

    return NextResponse.json({ 
      count,
      userLiked 
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30' // Browser cache for 30 seconds
      }
    });
    
  } catch (error) {
    console.error('Error fetching reaction count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}