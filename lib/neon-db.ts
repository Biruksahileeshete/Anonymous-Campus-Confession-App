import { Pool, Client } from 'pg';

// Connection pool for better performance with improved error handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10, // Reduced from 20 to be more conservative
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Increased timeout to 5 seconds
  acquireTimeoutMillis: 10000, // Wait up to 10 seconds for a connection
  statement_timeout: 30000, // 30 second statement timeout
  query_timeout: 30000, // 30 second query timeout
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Simple connection function for Neon (legacy support)
export async function connectToNeon() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 30000,
    query_timeout: 30000,
  });
  
  await client.connect();
  return client;
}

// Optimized query function using connection pool with retry logic
export async function queryNeon(text: string, params?: any[]) {
  let client;
  let retries = 3;
  
  while (retries > 0) {
    try {
      client = await pool.connect();
      const result = await client.query(text, params);
      return result;
    } catch (error: any) {
      console.error(`Query error (${retries} retries left):`, {
        error: error.message,
        code: error.code,
        query: text.substring(0, 100) + '...'
      });
      
      // If it's a connection error, retry
      if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.message.includes('Connection terminated')) {
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        }
      }
      
      throw error;
    } finally {
      if (client) {
        client.release(); // Return connection to pool instead of closing
      }
    }
  }
}

// Fast query function for simple queries with retry logic
export async function fastQuery(text: string, params?: any[]) {
  let retries = 3;
  
  while (retries > 0) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error: any) {
      console.error(`Fast query error (${retries} retries left):`, {
        error: error.message,
        code: error.code,
        query: text.substring(0, 100) + '...'
      });
      
      // If it's a connection error, retry
      if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.message.includes('Connection terminated')) {
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        }
      }
      
      throw error;
    }
  }
}

// Database operations using simple connections
export class SimpleDatabase {
  async createUser(userData: {
    email: string;
    password_hash: string;
    full_name: string;
    student_id: string;
    role: string;
  }) {
    const result = await queryNeon(`
      INSERT INTO users (email, password_hash, full_name, student_id, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userData.email, userData.password_hash, userData.full_name, userData.student_id, userData.role]);
    
    return result.rows[0];
  }

  async getUserByEmail(email: string) {
    const result = await queryNeon('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async getUserById(id: string) {
    const result = await queryNeon('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createConfession(confessionData: {
    content: string;
    author_id: string;
    is_hidden: boolean;
  }) {
    const result = await queryNeon(`
      INSERT INTO confessions (content, author_id, is_hidden)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [confessionData.content, confessionData.author_id, confessionData.is_hidden]);
    
    return result.rows[0];
  }

  async getConfessions(limit = 50, offset = 0) {
    const result = await fastQuery(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.updated_at,
        c.reaction_counts,
        u.full_name as author_name,
        (SELECT COUNT(*) FROM comments WHERE confession_id = c.id) as comment_count
      FROM confessions c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.is_hidden = false
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    // Parse reaction_counts JSON and ensure proper timestamp format
    return result.rows.map(row => ({
      ...row,
      reaction_counts: typeof row.reaction_counts === 'string' 
        ? JSON.parse(row.reaction_counts) 
        : row.reaction_counts || {},
      comment_count: parseInt(row.comment_count) || 0,
      // Ensure created_at is properly formatted as ISO string
      created_at: row.created_at instanceof Date 
        ? row.created_at.toISOString() 
        : new Date(row.created_at).toISOString()
    }));
  }

  async getConfessionById(id: string) {
    const result = await queryNeon(`
      SELECT c.*, u.full_name as author_name
      FROM confessions c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = $1
    `, [id]);
    
    return result.rows[0];
  }

  async createCommentFast(commentData: {
    confession_id: string;
    content: string;
    author_id: string;
  }) {
    try {
      // Optimized insert with minimal data return
      const result = await fastQuery(`
        INSERT INTO comments (confession_id, content, author_id, created_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING id, content, created_at
      `, [commentData.confession_id, commentData.content, commentData.author_id]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating fast comment:', error);
      throw error;
    }
  }

  async createComment(commentData: {
    confession_id: string;
    content: string;
    author_id: string;
  }) {
    const result = await queryNeon(`
      INSERT INTO comments (confession_id, content, author_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [commentData.confession_id, commentData.content, commentData.author_id]);
    
    return result.rows[0];
  }

  async getCommentsByConfessionId(confessionId: string) {
    const result = await fastQuery(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        'Anonymous' as author_name
      FROM comments c
      WHERE c.confession_id = $1
      ORDER BY c.created_at ASC
      LIMIT 100
    `, [confessionId]);
    
    // Ensure proper timestamp format for comments
    return result.rows.map(row => ({
      ...row,
      created_at: row.created_at instanceof Date 
        ? row.created_at.toISOString() 
        : row.created_at
    }));
  }

  async getCommentCount(confessionId: string) {
    const result = await queryNeon(`
      SELECT COUNT(*) as count
      FROM comments
      WHERE confession_id = $1
    `, [confessionId]);
    
    return parseInt(result.rows[0].count);
  }

  async upsertReaction(reactionData: {
    confession_id: string;
    user_id: string;
    type: string;
  }) {
    try {
      // Use INSERT ... ON CONFLICT for atomic upsert
      const result = await queryNeon(`
        INSERT INTO reactions (confession_id, user_id, type, created_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (confession_id, user_id, type) 
        DO UPDATE SET created_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [reactionData.confession_id, reactionData.user_id, reactionData.type]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error upserting reaction:', error);
      throw error;
    }
  }

  async createReaction(reactionData: {
    confession_id: string;
    user_id: string;
    type: string;
  }) {
    try {
      // Use INSERT ... ON CONFLICT to handle duplicates gracefully
      const result = await queryNeon(`
        INSERT INTO reactions (confession_id, user_id, type)
        VALUES ($1, $2, $3)
        ON CONFLICT (confession_id, user_id, type) DO NOTHING
        RETURNING *
      `, [reactionData.confession_id, reactionData.user_id, reactionData.type]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating reaction:', error);
      throw error;
    }
  }

  async deleteSpecificReaction(confessionId: string, userId: string, type: string) {
    try {
      await queryNeon(`
        DELETE FROM reactions 
        WHERE confession_id = $1 AND user_id = $2 AND type = $3
      `, [confessionId, userId, type]);
    } catch (error) {
      console.error('Error deleting reaction:', error);
      throw error;
    }
  }

  async getUserReactions(confessionId: string, userId: string) {
    const result = await queryNeon(`
      SELECT type FROM reactions 
      WHERE confession_id = $1 AND user_id = $2
    `, [confessionId, userId]);
    
    return result.rows.map(row => row.type);
  }

  async getUserSpecificReaction(confessionId: string, userId: string, type: string) {
    const result = await queryNeon(`
      SELECT * FROM reactions 
      WHERE confession_id = $1 AND user_id = $2 AND type = $3
    `, [confessionId, userId, type]);
    
    return result.rows[0];
  }

  async updateConfessionReactionCounts(confessionId: string) {
    try {
      // Use a more efficient query with aggregation
      const result = await queryNeon(`
        WITH reaction_counts AS (
          SELECT type, COUNT(*) as count
          FROM reactions 
          WHERE confession_id = $1
          GROUP BY type
        )
        UPDATE confessions 
        SET 
          reaction_counts = COALESCE(
            (SELECT json_object_agg(type, count) FROM reaction_counts),
            '{}'::json
          ),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING reaction_counts
      `, [confessionId]);
      
      return result.rows[0]?.reaction_counts || {};
    } catch (error) {
      console.error('Error updating reaction counts:', error);
      // Fallback to original method
      const result = await queryNeon(`
        SELECT type, COUNT(*) as count
        FROM reactions 
        WHERE confession_id = $1
        GROUP BY type
      `, [confessionId]);
      
      const reactionCounts: { [key: string]: number } = {};
      result.rows.forEach(row => {
        reactionCounts[row.type] = parseInt(row.count);
      });
      
      await queryNeon(`
        UPDATE confessions 
        SET 
          reaction_counts = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [confessionId, JSON.stringify(reactionCounts)]);
      
      return reactionCounts;
    }
  }

  async createReport(reportData: {
    confession_id: string;
    reported_by: string;
    reason: string;
    explanation?: string;
  }) {
    const result = await queryNeon(`
      INSERT INTO reports (confession_id, reported_by, reason, explanation)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [reportData.confession_id, reportData.reported_by, reportData.reason, reportData.explanation]);
    
    return result.rows[0];
  }

  async getReports(status?: string) {
    let query = `
      SELECT r.*, 
             c.content as confession_content,
             c.author_id as confession_author_id,
             reporter.full_name as reporter_name,
             reporter.email as reporter_email,
             author.full_name as author_name,
             author.email as author_email
      FROM reports r
      LEFT JOIN confessions c ON r.confession_id = c.id
      LEFT JOIN users reporter ON r.reported_by = reporter.id
      LEFT JOIN users author ON c.author_id = author.id
    `;
    
    const params: any[] = [];
    
    if (status) {
      query += ' WHERE r.status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY r.created_at DESC';
    
    const result = await queryNeon(query, params);
    return result.rows;
  }

  async hideConfession(id: string) {
    const result = await queryNeon(`
      UPDATE confessions 
      SET is_hidden = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    return result.rows[0];
  }

  async getStats() {
    const result = await queryNeon(`
      SELECT 
        (SELECT COUNT(*) FROM confessions WHERE is_hidden = false) as total_confessions,
        (SELECT COUNT(*) FROM confessions WHERE is_hidden = true) as hidden_confessions,
        (SELECT COUNT(*) FROM comments) as total_comments,
        (SELECT COUNT(*) FROM reports WHERE status = 'pending') as pending_reports,
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users
    `);
    
    return result.rows[0];
  }

  async unhideConfession(id: string) {
    const result = await queryNeon(`
      UPDATE confessions 
      SET is_hidden = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    return result.rows[0];
  }

  async deleteConfession(id: string) {
    await queryNeon(`DELETE FROM confessions WHERE id = $1`, [id]);
  }

  async warnUser(userId: string, reason: string, adminId: string) {
    await queryNeon(`
      INSERT INTO user_warnings (user_id, reason, warned_by, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    `, [userId, reason, adminId]);
  }

  async banUser(userId: string, reason: string, adminId: string) {
    await queryNeon(`
      UPDATE users 
      SET is_banned = true, ban_reason = $2, banned_by = $3, banned_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [userId, reason, adminId]);
  }

  async dismissReport(reportId: string, adminId: string) {
    await queryNeon(`
      UPDATE reports 
      SET status = 'dismissed', reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [reportId, adminId]);
  }

  async getAllUsers() {
    const result = await queryNeon(`
      SELECT 
        u.id, 
        u.email, 
        u.full_name, 
        u.student_id, 
        u.role, 
        u.created_at, 
        u.is_banned, 
        u.ban_reason,
        COUNT(c.id) as confession_count
      FROM users u
      LEFT JOIN confessions c ON u.id = c.author_id AND c.is_hidden = false
      GROUP BY u.id, u.email, u.full_name, u.student_id, u.role, u.created_at, u.is_banned, u.ban_reason
      ORDER BY u.created_at DESC
    `);
    
    return result.rows.map(row => ({
      ...row,
      confession_count: parseInt(row.confession_count) || 0
    }));
  }

  async getAllConfessions() {
    const result = await queryNeon(`
      SELECT c.*, u.full_name as author_name, u.email as author_email
      FROM confessions c
      LEFT JOIN users u ON c.author_id = u.id
      ORDER BY c.created_at DESC
    `);
    
    return result.rows;
  }

  async updateUserProfile(userId: string, updates: { full_name?: string; password_hash?: string }) {
    const setParts = [];
    const values = [];
    let paramIndex = 1;

    if (updates.full_name) {
      setParts.push(`full_name = $${paramIndex}`);
      values.push(updates.full_name);
      paramIndex++;
    }

    if (updates.password_hash) {
      setParts.push(`password_hash = $${paramIndex}`);
      values.push(updates.password_hash);
      paramIndex++;
    }

    setParts.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${setParts.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await queryNeon(query, values);
    return result.rows[0];
  }

  async deleteUser(userId: string) {
    await queryNeon(`DELETE FROM users WHERE id = $1`, [userId]);
  }

  async changeUserRole(userId: string, newRole: string) {
    const result = await queryNeon(`
      UPDATE users 
      SET role = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [userId, newRole]);
    
    return result.rows[0];
  }

  async unbanUser(userId: string) {
    await queryNeon(`
      UPDATE users 
      SET is_banned = false, ban_reason = NULL, banned_by = NULL, banned_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [userId]);
  }

  // Notification functions
  async createNotification(notificationData: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    confession_id?: string;
  }) {
    const result = await queryNeon(`
      INSERT INTO notifications (user_id, type, title, message, confession_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      notificationData.user_id,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.confession_id || null
    ]);
    
    return result.rows[0];
  }

  async getUserNotifications(userId: string, limit = 50) {
    const result = await queryNeon(`
      SELECT n.*, c.content as confession_content
      FROM notifications n
      LEFT JOIN confessions c ON n.confession_id = c.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2
    `, [userId, limit]);
    
    return result.rows;
  }

  async markNotificationAsRead(notificationId: string) {
    await queryNeon(`
      UPDATE notifications 
      SET is_read = true
      WHERE id = $1
    `, [notificationId]);
  }

  async getUnreadNotificationCount(userId: string) {
    try {
      const result = await queryNeon(`
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = $1 AND is_read = false
      `, [userId]);
      
      const count = parseInt(result.rows[0]?.count || '0');
      return isNaN(count) ? 0 : count;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  }

  async getReportWithUserInfo(reportId: string) {
    const result = await queryNeon(`
      SELECT r.*, 
             c.content as confession_content,
             c.author_id as confession_author_id,
             reporter.full_name as reporter_name,
             reporter.email as reporter_email,
             author.full_name as author_name,
             author.email as author_email
      FROM reports r
      LEFT JOIN confessions c ON r.confession_id = c.id
      LEFT JOIN users reporter ON r.reported_by = reporter.id
      LEFT JOIN users author ON c.author_id = author.id
      WHERE r.id = $1
    `, [reportId]);
    
    return result.rows[0];
  }
}

export const simpleDb = new SimpleDatabase();