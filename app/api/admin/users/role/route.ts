import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { requireAuth } from '@/lib/auth-middleware';

export const PUT = requireAuth(async (request: NextRequest, user: any) => {
  try {
    // Only admins can change roles
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, role } = await request.json();

    if (!userId || !role || !['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Update user role
    await simpleDb.changeUserRole(userId, role);

    return NextResponse.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});