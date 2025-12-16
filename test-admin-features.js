// Test script to verify admin features are working
const { simpleDb } = require('./lib/neon-db.ts');

async function testAdminFeatures() {
  try {
    console.log('Testing admin features...');
    
    // Test getting stats
    console.log('\n1. Testing admin stats...');
    const stats = await simpleDb.getStats();
    console.log('Stats:', stats);
    
    // Test getting reports
    console.log('\n2. Testing reports...');
    const reports = await simpleDb.getReports();
    console.log('Reports count:', reports.length);
    
    // Test getting all users
    console.log('\n3. Testing user management...');
    const users = await simpleDb.getAllUsers();
    console.log('Users count:', users.length);
    
    // Test getting all confessions
    console.log('\n4. Testing confession management...');
    const confessions = await simpleDb.getAllConfessions();
    console.log('Confessions count:', confessions.length);
    
    console.log('\n✅ All admin features are working!');
    
  } catch (error) {
    console.error('❌ Error testing admin features:', error);
  }
}

testAdminFeatures();