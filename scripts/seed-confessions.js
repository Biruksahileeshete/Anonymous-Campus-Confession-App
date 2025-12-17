const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const sampleConfessions = [
  {
    content: "I've been struggling with imposter syndrome since starting college. Sometimes I feel like I don't belong here, even though my grades are good. It's exhausting pretending to be confident all the time.",
    author_id: "1"
  },
  {
    content: "I have a huge crush on someone in my study group, but I'm too shy to say anything. We work so well together on projects, and I wonder if they feel the same way. Maybe someday I'll find the courage to tell them.",
    author_id: "2"
  },
  {
    content: "I changed my major three times and I'm still not sure if I'm on the right path. My parents think I'm wasting time and money, but I just want to find something I'm passionate about. Is it normal to feel this lost?",
    author_id: "1"
  },
  {
    content: "The dining hall pizza is actually really good, but I pretend to complain about it because everyone else does. Sometimes I go there just for the pizza and I'm not ashamed to admit it here!",
    author_id: "3"
  },
  {
    content: "I've been dealing with anxiety and finally started going to the campus counseling center. It's been incredibly helpful, and I wish I had started sooner. Mental health support is so important.",
    author_id: "2"
  },
  {
    content: "I'm a senior and I still don't know what I want to do after graduation. Everyone seems to have their life figured out, but I'm just taking it one day at a time. The uncertainty is both scary and exciting.",
    author_id: "1"
  },
  {
    content: "I love studying in the library at 2 AM. It's so peaceful and quiet, and I feel like I can really focus. There's something magical about the campus when everyone else is asleep.",
    author_id: "3"
  },
  {
    content: "I'm the first person in my family to go to college, and sometimes the pressure feels overwhelming. I want to make them proud, but I also want to make sure I'm doing this for myself.",
    author_id: "2"
  },
  {
    content: "I accidentally walked into the wrong lecture hall and sat through an entire philosophy class before realizing my mistake. It was actually more interesting than my actual class, so I might audit it next semester!",
    author_id: "1"
  },
  {
    content: "I've been volunteering at the local animal shelter and it's become the highlight of my week. The dogs there have taught me more about unconditional love than any textbook ever could.",
    author_id: "3"
  },
  {
    content: "I'm struggling to balance work and studies. I have to work part-time to pay for school, but it's affecting my grades. I wish there was more financial support available for students like me.",
    author_id: "2"
  },
  {
    content: "I discovered a hidden garden behind the old science building. It's become my secret study spot, and I've never seen anyone else there. It feels like my own little piece of paradise on campus.",
    author_id: "1"
  },
  {
    content: "I'm an introvert in a very social dorm, and sometimes I feel left out. But I've learned that it's okay to need alone time, and real friends will understand and respect that about you.",
    author_id: "3"
  },
  {
    content: "I failed my first exam ever last week, and it was devastating. But my professor was so understanding and helped me create a study plan. Sometimes failure teaches us more than success ever could.",
    author_id: "2"
  },
  {
    content: "I've been learning to cook in my dorm room with just a hot plate and mini fridge. It's challenging but fun, and my roommates have become my taste testers. We've had some interesting culinary adventures!",
    author_id: "1"
  }
];

async function seedConfessions() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // First, let's check if we have users in the database
    const usersResult = await client.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(usersResult.rows[0].count);
    
    if (userCount === 0) {
      console.log('No users found. Creating sample users first...');
      
      // Create sample users
      const sampleUsers = [
        {
          email: 'student1@university.edu',
          password_hash: '$2b$10$example1hash',
          full_name: 'Alex Johnson',
          student_id: 'STU001',
          role: 'user'
        },
        {
          email: 'student2@university.edu', 
          password_hash: '$2b$10$example2hash',
          full_name: 'Sam Wilson',
          student_id: 'STU002',
          role: 'user'
        },
        {
          email: 'student3@university.edu',
          password_hash: '$2b$10$example3hash', 
          full_name: 'Jordan Lee',
          student_id: 'STU003',
          role: 'user'
        }
      ];

      for (const user of sampleUsers) {
        await client.query(`
          INSERT INTO users (email, password_hash, full_name, student_id, role)
          VALUES ($1, $2, $3, $4, $5)
        `, [user.email, user.password_hash, user.full_name, user.student_id, user.role]);
      }
      
      console.log('Sample users created');
    }

    // Get actual user IDs from the database
    const actualUsers = await client.query('SELECT id FROM users LIMIT 3');
    const userIds = actualUsers.rows.map(row => row.id);

    // Clear existing confessions (optional)
    console.log('Clearing existing confessions...');
    await client.query('DELETE FROM confessions');

    // Insert sample confessions with real user IDs
    console.log('Inserting sample confessions...');
    
    for (let i = 0; i < sampleConfessions.length; i++) {
      const confession = sampleConfessions[i];
      // Cycle through available user IDs
      const authorId = userIds[i % userIds.length];
      
      await client.query(`
        INSERT INTO confessions (content, author_id, is_hidden, created_at)
        VALUES ($1, $2, $3, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days' - INTERVAL '${Math.floor(Math.random() * 24)} hours')
      `, [confession.content, authorId, false]);
    }

    console.log(`Successfully inserted ${sampleConfessions.length} sample confessions!`);
    
    // Show summary
    const confessionCount = await client.query('SELECT COUNT(*) FROM confessions');
    console.log(`Total confessions in database: ${confessionCount.rows[0].count}`);

  } catch (error) {
    console.error('Error seeding confessions:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedConfessions();