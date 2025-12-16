import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

export const GET = requireAuth(async (request, user) => {
  return NextResponse.json({
    success: true,
    user: user,
    message: 'User data retrieved successfully'
  });
});