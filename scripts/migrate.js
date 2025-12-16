const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  console.log('Connecting to database...');
  console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Running database migrations...');

    // Create tables
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        student_id VARCHAR(50) NOT NULL,
        role VARCHAR(20) CHECK(role IN ('user', 'admin')) DEFAULT 'user',
        google_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add missing columns if they don't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS ban_reason TEXT,
      ADD COLUMN IF NOT EXISTS banned_by UUID,
      ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP;
    `);

    // Add foreign key constraint if it doesn't exist
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'users_banned_by_fkey'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT users_banned_by_fkey 
          FOREIGN KEY (banned_by) REFERENCES users(id);
        END IF;
      END $$;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_warnings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        warned_by UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS confessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        content TEXT NOT NULL,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_hidden BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Add reaction_counts column if it doesn't exist
    await pool.query(`
      ALTER TABLE confessions 
      ADD COLUMN IF NOT EXISTS reaction_counts JSONB DEFAULT '{}';
    `);

    // Update existing timestamp columns to use timezone-aware timestamps
    await pool.query(`
      DO $$ 
      BEGIN
        -- Update confessions table timestamps
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'confessions' 
          AND column_name = 'created_at' 
          AND data_type = 'timestamp without time zone'
        ) THEN
          ALTER TABLE confessions 
          ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE 
          USING created_at AT TIME ZONE 'UTC';
          
          ALTER TABLE confessions 
          ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE 
          USING updated_at AT TIME ZONE 'UTC';
        END IF;

        -- Update comments table timestamps
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'comments' 
          AND column_name = 'created_at' 
          AND data_type = 'timestamp without time zone'
        ) THEN
          ALTER TABLE comments 
          ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE 
          USING created_at AT TIME ZONE 'UTC';
        END IF;
      END $$;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        confession_id UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        confession_id UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(confession_id, user_id, type)
      );
    `);

    // Remove any existing constraints on reaction type to allow emojis
    await pool.query(`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'reactions_type_check'
        ) THEN
          ALTER TABLE reactions DROP CONSTRAINT reactions_type_check;
        END IF;
      END $$;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        confession_id UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
        reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason VARCHAR(20) CHECK(reason IN ('hate_speech', 'harassment', 'spam', 'other')),
        explanation TEXT,
        status VARCHAR(20) CHECK(status IN ('pending', 'reviewed', 'dismissed')) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        reviewed_by UUID REFERENCES users(id)
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_confessions_created_at ON confessions(created_at DESC);
    `);



    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_confession_id ON comments(confession_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reactions_confession_id ON reactions(confession_id);
    `);

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK(type IN ('warning', 'like', 'comment', 'report_resolved')),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        confession_id UUID REFERENCES confessions(id) ON DELETE CASCADE,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    `);

    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;