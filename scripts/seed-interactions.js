const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const sampleComments = [
  "I totally understand how you feel. You're not alone in this!",
  "Thank you for sharing this. It really resonates with me.",
  "Have you tried talking to someone about this? It might help.",
  "This is so relatable! I've been through something similar.",
  "You're braver than you think for sharing this.",
  "I hope things get better for you. Sending positive vibes!",
  "This made me smile. Thanks for the positivity!",
  "I needed to hear this today. Thank you.",
  "You should be proud of yourself for taking that step.",
  "This is such good advice. I'm going to try this too!",
  "I love your perspective on this. Very inspiring!",
  "You're not alone in feeling this way. We're all figuring it out.",
  "This sounds like an amazing experience!",
  "I wish I had your courage. Maybe someday I will.",
  "This is exactly what I needed to read today."
];

async function seedInteractions() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Get all confessions and users
    const confessions = await client.query('SELECT id FROM confessions');
    const users = await client.query('SELECT id FROM users');
    
    const confessionIds = confessions.rows.map(row => row.id);
    const userIds = users.rows.map(row => row.id);

    console.log(`Found ${confessionIds.length} confessions and ${userIds.length} users`);

    // Clear existing interactions
    await client.query('DELETE FROM comments');

    let commentsAdded = 0;

    // Add comments to some confessions
    for (const confessionId of confessionIds) {
      // 60% chance each confession gets comments
      if (Math.random() < 0.6) {
        // Each confession with comments gets 1-3 comments
        const numComments = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numComments; i++) {
          const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
          const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
          
          await client.query(`
            INSERT INTO comments (confession_id, author_id, content, created_at)
            VALUES ($1, $2, $3, NOW() - INTERVAL '${Math.floor(Math.random() * 15)} days' - INTERVAL '${Math.floor(Math.random() * 24)} hours')
          `, [confessionId, randomUser, randomComment]);
          commentsAdded++;
        }
      }
    }

    console.log(`Successfully added ${commentsAdded} comments!`);
    
    // Show summary
    const commentCount = await client.query('SELECT COUNT(*) FROM comments');
    
    console.log(`Total comments in database: ${commentCount.rows[0].count}`);

  } catch (error) {
    console.error('Error seeding interactions:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedInteractions();