const { simpleDb } = require('./lib/neon-db.ts');
require('dotenv').config({ path: '.env.local' });

async function testCompleteSystem() {
  try {
    console.log('🔍 Testing Complete System...\n');
    
    // 1. Test Database Connection
    console.log('1. Testing Database Connection...');
    const users = await simpleDb.getAllUsers();
    console.log(`✅ Database connected. Found ${users.length} users\n`);
    
    // 2. Test Admin User
    console.log('2. Testing Admin User...');
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser) {
      console.log(`✅ Admin user found: ${adminUser.email}`);
    } else {
      console.log('❌ No admin user found');
    }
    console.log();
    
    // 3. Test Confessions
    console.log('3. Testing Confessions...');
    const confessions = await simpleDb.getConfessions(10);
    console.log(`✅ Found ${confessions.length} confessions`);
    if (confessions.length > 0) {
      console.log(`   Sample confession: "${confessions[0].content.substring(0, 50)}..."`);
      console.log(`   Reaction counts: ${JSON.stringify(confessions[0].reaction_counts)}`);
    }
    console.log();
    
    // 4. Test Reports
    console.log('4. Testing Reports...');
    const reports = await simpleDb.getReports();
    console.log(`✅ Found ${reports.length} reports`);
    if (reports.length > 0) {
      const report = reports[0];
      console.log(`   Sample report: ${report.reason}`);
      console.log(`   Reporter: ${report.reporter_name} (${report.reporter_email})`);
      console.log(`   Author: ${report.author_name} (${report.author_email})`);
    }
    console.log();
    
    // 5. Test Notifications
    console.log('5. Testing Notifications...');
    if (users.length > 0) {
      const testUser = users[0];
      const notifications = await simpleDb.getUserNotifications(testUser.id);
      console.log(`✅ Found ${notifications.length} notifications for ${testUser.full_name}`);
    }
    console.log();
    
    // 6. Test Comments
    console.log('6. Testing Comments...');
    if (confessions.length > 0) {
      const comments = await simpleDb.getCommentsByConfessionId(confessions[0].id);
      console.log(`✅ Found ${comments.length} comments for first confession`);
    }
    console.log();
    
    console.log('🎉 System test completed successfully!');
    
  } catch (error) {
    console.error('❌ System test failed:', error);
  }
}

testCompleteSystem();