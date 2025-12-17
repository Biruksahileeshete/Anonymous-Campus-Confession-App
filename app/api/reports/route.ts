import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { requireAuth } from '@/lib/auth-middleware';

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    // Only admins can view reports
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reports = await simpleDb.getReports();
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { confession_id, reason, explanation, reported_by } = await request.json();

    if (!confession_id || !reason || !reported_by) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the user is reporting as themselves
    if (reported_by !== user.id) {
      return NextResponse.json({ error: 'Invalid reporter' }, { status: 400 });
    }

    // Create the report
    const report = await simpleDb.createReport({
      confession_id,
      reported_by,
      reason,
      explanation: explanation || undefined
    });

    return NextResponse.json({ 
      message: 'Report submitted successfully',
      report 
    });
  } catch (error) {
    console.error('Error creating report:', error);
    
    // Check if it's a duplicate report error
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json({ error: 'You have already reported this confession' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});