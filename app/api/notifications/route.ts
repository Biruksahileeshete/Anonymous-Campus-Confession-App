import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { requireAuth } from '@/lib/auth-middleware';

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const notifications = await simpleDb.getUserNotifications(user.id);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to fetch notifications' }, { status: 500 });
  }
});

export const PUT = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { notificationId } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }
    
    await simpleDb.markNotificationAsRead(notificationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to mark notification as read' }, { status: 500 });
  }
});