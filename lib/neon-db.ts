import { Pool, Client } from 'pg';

// Simple connection function for Neon
export async function connectToNeon() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  
  await client.connect();
  return client;
}

// Simple query function
export async function queryNeon(text: string, params?: any[]) {
  const client = await connectToNeon();
  
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    await client.end();
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
    const result = await queryNeon(`
      SELECT 
        c.*,
        u.full_name as author_name
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
    const result = await queryNeon(`
      SELECT c.*, u.full_name as author_name
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.confession_id = $1
      ORDER BY c.created_at ASC
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

  async createReaction(reactionData: {
    confession_id: string;
    user_id: string;
    type: string;
  }) {
    const result = await queryNeon(`
      INSERT INTO reactions (confession_id, user_id, type)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [reactionData.confession_id, reactionData.user_id, reactionData.type]);
    
    return result.rows[0];
  }

  async deleteSpecificReaction(confessionId: string, userId: string, type: string) {
    await queryNeon(`
      DELETE FROM reactions 
      WHERE confession_id = $1 AND user_id = $2 AND type = $3
    `, [confessionId, userId, type]);
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
    // Get all reaction counts for this confession
    const result = await queryNeon(`
      SELECT type, COUNT(*) as count
      FROM reactions 
      WHERE confession_id = $1
      GROUP BY type
    `, [confessionId]);
    
    // Build reaction counts object
    const reactionCounts: { [key: string]: number } = {};
    result.rows.forEach(row => {
      reactionCounts[row.type] = parseInt(row.count);
    });
    
    // Update confession with reaction counts
    await queryNeon(`
      UPDATE confessions 
      SET 
        reaction_counts = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [confessionId, JSON.stringify(reactionCounts)]);
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
      SELECT id, email, full_name, student_id, role, created_at, is_banned, ban_reason
      FROM users 
      ORDER BY created_at DESC
    `);
    
    return result.rows;
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
    const result = await queryNeon(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND is_read = false
    `, [userId]);
    
    return parseInt(result.rows[0].count);
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