import { NextRequest, NextResponse } from 'next/server';
import { query, initDB } from '@/lib/db';

// Initialize database on first request
let dbInitialized = false;

async function ensureDB() {
  if (!dbInitialized) {
    await initDB();
    dbInitialized = true;
  }
}

export async function GET() {
  try {
    await ensureDB();
    
    // Get basic stats for admin dashboard
    const stats = {
      totalConfessions: 0,
      totalReports: 0,
      totalComments: 0,
      hiddenConfessions: 0
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDB();
    
    const { action, confessionId } = await request.json();
    
    if (!action || !confessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    switch (action) {
      case 'hide':
        await query(`
          UPDATE confessions 
          SET isHidden = TRUE 
          WHERE id = ?
        `, [confessionId]);
        break;
        
      case 'unhide':
        await query(`
          UPDATE confessions 
          SET isHidden = FALSE 
          WHERE id = ?
        `, [confessionId]);
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error performing admin action:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}