import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { requireAdmin } from '@/lib/auth-middleware';

export const POST = requireAdmin(async (request: NextRequest, user: any) => {
  try {
    const { action, targetId, reason, newRole } = await request.json();
    
    switch (action) {
      case 'hide_confession':
        await simpleDb.hideConfession(targetId);
        return NextResponse.json({ success: true, message: 'Confession hidden successfully' });
        
      case 'unhide_confession':
        await simpleDb.unhideConfession(targetId);
        return NextResponse.json({ success: true, message: 'Confession restored successfully' });
        
      case 'delete_confession':
        await simpleDb.deleteConfession(targetId);
        return NextResponse.json({ success: true, message: 'Confession deleted successfully' });
        
      case 'warn_user':
        await simpleDb.warnUser(targetId, reason, user.id);
        
        // Send notification to user
        await simpleDb.createNotification({
          user_id: targetId,
          type: 'warning',
          title: '⚠️ Warning Received',
          message: `You have received a warning from administrators. Reason: ${reason}`
        });
        
        return NextResponse.json({ success: true, message: 'Warning sent to user' });
        
      case 'ban_user':
        await simpleDb.banUser(targetId, reason, user.id);
        return NextResponse.json({ success: true, message: 'User banned successfully' });
        
      case 'unban_user':
        await simpleDb.unbanUser(targetId);
        return NextResponse.json({ success: true, message: 'User unbanned successfully' });
        
      case 'delete_user':
        await simpleDb.deleteUser(targetId);
        return NextResponse.json({ success: true, message: 'User deleted successfully' });
        
      case 'change_role':
        if (!newRole || !['user', 'admin'].includes(newRole)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }
        await simpleDb.changeUserRole(targetId, newRole);
        return NextResponse.json({ success: true, message: `User role changed to ${newRole}` });
        
      case 'dismiss_report':
        await simpleDb.dismissReport(targetId, user.id);
        return NextResponse.json({ success: true, message: 'Report dismissed' });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error performing admin action:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
});