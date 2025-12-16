import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { requireAuth } from '@/lib/auth-middleware';

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const reports = await simpleDb.getReports();
    return NextResponse.json(reports || []);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
});

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { confessionId, reason, explanation } = await request.json();
    
    if (!confessionId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const validReasons = ['hate_speech', 'harassment', 'spam', 'other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
    }
    
    const newReport = await simpleDb.createReport({
      confession_id: confessionId,
      reported_by: user.id,
      reason,
      explanation: explanation || null
    });
    
    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
});