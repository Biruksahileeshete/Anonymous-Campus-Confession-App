import { NextRequest, NextResponse } from 'next/server';
import { queryNeon } from '@/lib/neon-db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confessionId = searchParams.get('confessionId');
    
    if (!confessionId) {
      return NextResponse.json({ error: 'Confession ID is required' }, { status: 400 });
    }

    // Get total reaction count for this confession
    const reactionCountResult = await queryNeon(`
      SELECT COUNT(*) as count
      FROM reactions 
      WHERE confession_id = $1
    `, [confessionId]);
    
    const count = parseInt(reactionCountResult.rows[0]?.count || '0');
    
    // Check if user has liked this confession (if authenticated)
    let userLiked = false;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        const userReactionResult = await queryNeon(`
          SELECT id FROM reactions 
          WHERE confession_id = $1 AND user_id = $2
          LIMIT 1
        `, [confessionId, decoded.userId]);
        
        userLiked = userReactionResult.rows.length > 0;
      } catch (error) {
        // Invalid token, continue without user status
      }
    }

    return NextResponse.json({ 
      count,
      userLiked 
    });
    
  } catch (error) {
    console.error('Error fetching reaction count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}