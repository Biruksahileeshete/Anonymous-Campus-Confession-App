const { simpleDb } = require('./lib/neon-db.ts');
require('dotenv').config({ path: '.env.local' });

async function testAdminUsers() {
  try {
    console.log('Testing database connection...');
    
    // Test getting all users
    const users = await simpleDb.getAllUsers();
    console.log('Users in database:', users.length);
    
    if (users.length > 0) {
      console.log('Sample user:', {
        email: users[0].email,
        role: users[0].role,
        full_name: users[0].full_name
      });
    }
    
    // Check if admin user exists
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser) {
      console.log('Admin user found:', adminUser.email);
    } else {
      console.log('No admin user found. Creating one...');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newAdmin = await simpleDb.createUser({
        email: 'admin@campus.edu',
        password_hash: hashedPassword,
        full_name: 'Admin User',
        student_id: 'ADMIN001',
        role: 'admin'
      });
      
      console.log('Admin user created:', newAdmin.email);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAdminUsers();