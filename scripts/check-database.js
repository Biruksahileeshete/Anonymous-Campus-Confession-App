const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    // Check users
    const users = await client.query('SELECT id, full_name, email, role FROM users');
    console.log(`👥 Users (${users.rows.length}):`);
    users.rows.forEach(user => {
      console.log(`  - ${user.full_name} (${user.email}) - ${user.role}`);
    });

    // Check confessions
    const confessions = await client.query(`
      SELECT c.id, LEFT(c.content, 50) as preview, u.full_name as author, c.created_at
      FROM confessions c 
      JOIN users u ON c.author_id = u.id 
      ORDER BY c.created_at DESC
    `);
    console.log(`\n💭 Confessions (${confessions.rows.length}):`);
    confessions.rows.forEach((confession, index) => {
      console.log(`  ${index + 1}. "${confession.preview}..." - by ${confession.author}`);
    });

    // Check comments
    const comments = await client.query(`
      SELECT COUNT(*) as total_comments,
             COUNT(DISTINCT confession_id) as confessions_with_comments
      FROM comments
    `);
    console.log(`\n💬 Comments: ${comments.rows[0].total_comments} total on ${comments.rows[0].confessions_with_comments} confessions`);

    console.log('\n✅ Database check complete!');

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await client.end();
  }
}

checkDatabase();