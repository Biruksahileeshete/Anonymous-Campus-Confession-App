import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { requireAuth } from '@/lib/auth-middleware';

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const count = await simpleDb.getUnreadNotificationCount(user.id);
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return NextResponse.json({ error: 'Failed to fetch unread count' }, { status: 500 });
  }
});