import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { requireAdmin } from '@/lib/auth-middleware';

export const GET = requireAdmin(async (request: NextRequest, user: any) => {
  try {
    const confessions = await simpleDb.getAllConfessions();
    return NextResponse.json(confessions);
  } catch (error) {
    console.error('Error fetching confessions:', error);
    return NextResponse.json({ error: 'Failed to fetch confessions' }, { status: 500 });
  }
});