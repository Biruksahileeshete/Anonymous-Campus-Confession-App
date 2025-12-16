import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { requireAdmin } from '@/lib/auth-middleware';

export const GET = requireAdmin(async (request: NextRequest, user: any) => {
  try {
    const users = await simpleDb.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
});