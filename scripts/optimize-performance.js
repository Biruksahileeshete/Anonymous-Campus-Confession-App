#!/usr/bin/env node

/**
 * Performance Optimization Script
 * Run this to apply database optimizations and create indexes
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createIndexes() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Creating database indexes for better performance...');
    
    // Index for confessions queries
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_confessions_created_at_hidden 
      ON confessions(created_at DESC, is_hidden) 
      WHERE is_hidden = false
    `);
    console.log('✅ Created index on confessions(created_at, is_hidden)');
    
    // Index for comments by confession
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_confession_created 
      ON comments(confession_id, created_at ASC)
    `);
    console.log('✅ Created index on comments(confession_id, created_at)');
    
    // Index for reactions
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reactions_confession_user 
      ON reactions(confession_id, user_id)
    `);
    console.log('✅ Created index on reactions(confession_id, user_id)');
    
    // Index for notifications
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read_created 
      ON notifications(user_id, is_read, created_at DESC)
    `);
    console.log('✅ Created index on notifications(user_id, is_read, created_at)');
    
    // Index for reports
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_status_created 
      ON reports(status, created_at DESC)
    `);
    console.log('✅ Created index on reports(status, created_at)');
    
    console.log('🎉 All performance indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  } finally {
    client.release();
  }
}

async function analyzePerformance() {
  const client = await pool.connect();
  
  try {
    console.log('\n📊 Analyzing database performance...');
    
    // Check table sizes
    const tableSizes = await client.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);
    
    console.log('\n📋 Table Sizes:');
    tableSizes.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.size}`);
    });
    
    // Check index usage
    const indexUsage = await client.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public'
      ORDER BY idx_tup_read DESC
      LIMIT 10
    `);
    
    console.log('\n📈 Most Used Indexes:');
    indexUsage.rows.forEach(row => {
      console.log(`  ${row.indexname} (${row.tablename}): ${row.idx_tup_read} reads`);
    });
    
  } catch (error) {
    console.error('❌ Error analyzing performance:', error.message);
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await createIndexes();
    await analyzePerformance();
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { createIndexes, analyzePerformance };