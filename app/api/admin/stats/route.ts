import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { requireAdmin } from '@/lib/auth-middleware';

export const GET = requireAdmin(async (request: NextRequest, user: any) => {
  try {
    const stats = await simpleDb.getStats();
    
    // Convert string numbers to integers
    const formattedStats = {
      totalConfessions: parseInt(stats.total_confessions) || 0,
      hiddenConfessions: parseInt(stats.hidden_confessions) || 0,
      totalComments: parseInt(stats.total_comments) || 0,
      totalReports: parseInt(stats.pending_reports) || 0,
      totalUsers: parseInt(stats.total_users) || 0
    };
    
    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
});