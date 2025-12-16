const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testSimpleConnection() {
  console.log('Testing simple database connection...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Simple database connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('📅 Current time from database:', result.rows[0].current_time);
    
    // Test user table
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    console.log('👥 Users in database:', userCount.rows[0].count);
    
    await client.end();
    console.log('🎉 Simple database test completed successfully!');
  } catch (error) {
    console.error('❌ Simple database connection failed:', error.message);
    process.exit(1);
  }
}

testSimpleConnection();