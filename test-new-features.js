const { simpleDb } = require('./lib/neon-db.ts');
require('dotenv').config({ path: '.env.local' });

async function testNewFeatures() {
  try {
    console.log('🧪 Testing New Features...\n');
    
    // 1. Test Admin Stats
    console.log('1. Testing Admin Stats...');
    const stats = await simpleDb.getStats();
    console.log('✅ Admin Stats:', {
      totalConfessions: stats.total_confessions,
      hiddenConfessions: stats.hidden_confessions,
      totalComments: stats.total_comments,
      pendingReports: stats.pending_reports,
      totalUsers: stats.total_users
    });
    console.log();
    
    // 2. Test Notifications
    console.log('2. Testing Notifications...');
    const users = await simpleDb.getAllUsers();
    if (users.length > 0) {
      const testUser = users.find(u => u.role === 'user') || users[0];
      
      // Create a test notification
      const notification = await simpleDb.createNotification({
        user_id: testUser.id,
        type: 'warning',
        title: '⚠️ Test Warning',
        message: 'This is a test notification to verify the system is working.'
      });
      
      console.log('✅ Created test notification:', notification.id);
      
      // Get unread count
      const unreadCount = await simpleDb.getUnreadNotificationCount(testUser.id);
      console.log('✅ Unread notifications count:', unreadCount);
      
      // Get user notifications
      const userNotifications = await simpleDb.getUserNotifications(testUser.id, 5);
      console.log('✅ User notifications:', userNotifications.length);
    }
    console.log();
    
    // 3. Test Reaction System
    console.log('3. Testing Reaction System...');
    const confessions = await simpleDb.getConfessions(1);
    if (confessions.length > 0 && users.length > 0) {
      const confession = confessions[0];
      const testUser = users[0];
      
      // Try to add a reaction (might already exist)
      try {
        await simpleDb.createReaction({
          confession_id: confession.id,
          user_id: testUser.id,
          type: '👍'
        });
      } catch (error) {
        if (error.code !== '23505') { // Ignore duplicate key error
          throw error;
        }
        console.log('   Reaction already exists, continuing...');
      }
      
      // Update reaction counts
      await simpleDb.updateConfessionReactionCounts(confession.id);
      
      // Get updated confession
      const updatedConfession = await simpleDb.getConfessionById(confession.id);
      console.log('✅ Updated reaction counts:', updatedConfession.reaction_counts);
      
      // Get user reactions
      const userReactions = await simpleDb.getUserReactions(confession.id, testUser.id);
      console.log('✅ User reactions:', userReactions);
    }
    console.log();
    
    // 4. Test Reports with User Info
    console.log('4. Testing Reports with User Info...');
    const reports = await simpleDb.getReports();
    if (reports.length > 0) {
      const report = reports[0];
      console.log('✅ Report with user info:', {
        id: report.id,
        reason: report.reason,
        reporter: report.reporter_name,
        author: report.author_name
      });
    }
    console.log();
    
    console.log('🎉 All new features tested successfully!');
    
  } catch (error) {
    console.error('❌ Feature test failed:', error);
  }
}

testNewFeatures();