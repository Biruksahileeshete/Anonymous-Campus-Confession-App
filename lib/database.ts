import { Pool } from 'pg';

// Database connection
let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5, // Reduced pool size for Neon
      idleTimeoutMillis: 60000, // Increased timeout
      connectionTimeoutMillis: 10000, // Increased timeout
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pool;
}

// Database interfaces
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  student_id: string;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface Confession {
  id: string;
  content: string;
  category: 'Love' | 'Stress' | 'Funny' | 'Serious';
  author_id: string;
  is_hidden: boolean;
  like_count: number;
  laugh_count: number;
  sad_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Comment {
  id: string;
  confession_id: string;
  content: string;
  author_id: string;
  created_at: Date;
}

export interface Reaction {
  id: string;
  confession_id: string;
  user_id: string;
  type: 'like' | 'laugh' | 'sad';
  created_at: Date;
}

export interface Report {
  id: string;
  confession_id: string;
  reported_by: string;
  reason: 'hate_speech' | 'harassment' | 'spam' | 'other';
  explanation?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
}

// Database operations
export class Database {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async query(text: string, params?: any[]) {
    let client;
    let retries = 3;
    
    while (retries > 0) {
      try {
        client = await this.pool.connect();
        const result = await client.query(text, params);
        return result;
      } catch (error) {
        console.error(`Database query error (${retries} retries left):`, error);
        
        if (client) {
          client.release(true); // Release with error flag
        }
        
        retries--;
        
        if (retries === 0) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      } finally {
        if (client && retries > 0) {
          client.release();
        }
      }
    }
  }

  // User operations
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const result = await this.query(`
      INSERT INTO users (email, password_hash, full_name, student_id, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userData.email, userData.password_hash, userData.full_name, userData.student_id, userData.role]);
    
    return result.rows[0];
  }

  async getUserByEmail(email: string) {
    const result = await this.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async getUserById(id: string) {
    const result = await this.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Confession operations
  async createConfession(confessionData: Omit<Confession, 'id' | 'like_count' | 'laugh_count' | 'sad_count' | 'created_at' | 'updated_at'>) {
    const result = await this.query(`
      INSERT INTO confessions (content, category, author_id, is_hidden)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [confessionData.content, confessionData.category, confessionData.author_id, confessionData.is_hidden]);
    
    return result.rows[0];
  }

  async getConfessions(limit = 50, offset = 0) {
    const result = await this.query(`
      SELECT c.*, u.full_name as author_name
      FROM confessions c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.is_hidden = false
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    return result.rows;
  }

  async getConfessionById(id: string) {
    const result = await this.query(`
      SELECT c.*, u.full_name as author_name
      FROM confessions c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = $1
    `, [id]);
    
    return result.rows[0];
  }

  async updateConfessionCounts(confessionId: string) {
    await this.query(`
      UPDATE confessions 
      SET 
        like_count = (SELECT COUNT(*) FROM reactions WHERE confession_id = $1 AND type = 'like'),
        laugh_count = (SELECT COUNT(*) FROM reactions WHERE confession_id = $1 AND type = 'laugh'),
        sad_count = (SELECT COUNT(*) FROM reactions WHERE confession_id = $1 AND type = 'sad'),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [confessionId]);
  }

  async hideConfession(id: string) {
    const result = await this.query(`
      UPDATE confessions 
      SET is_hidden = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    return result.rows[0];
  }

  // Comment operations
  async createComment(commentData: Omit<Comment, 'id' | 'created_at'>) {
    const result = await this.query(`
      INSERT INTO comments (confession_id, content, author_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [commentData.confession_id, commentData.content, commentData.author_id]);
    
    return result.rows[0];
  }

  async getCommentsByConfessionId(confessionId: string) {
    const result = await this.query(`
      SELECT c.*, u.full_name as author_name
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.confession_id = $1
      ORDER BY c.created_at ASC
    `, [confessionId]);
    
    return result.rows;
  }

  // Reaction operations
  async createOrUpdateReaction(reactionData: Omit<Reaction, 'id' | 'created_at'>) {
    const result = await this.query(`
      INSERT INTO reactions (confession_id, user_id, type)
      VALUES ($1, $2, $3)
      ON CONFLICT (confession_id, user_id)
      DO UPDATE SET type = $3, created_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [reactionData.confession_id, reactionData.user_id, reactionData.type]);
    
    return result.rows[0];
  }

  async deleteReaction(confessionId: string, userId: string) {
    await this.query(`
      DELETE FROM reactions 
      WHERE confession_id = $1 AND user_id = $2
    `, [confessionId, userId]);
  }

  async getUserReaction(confessionId: string, userId: string) {
    const result = await this.query(`
      SELECT * FROM reactions 
      WHERE confession_id = $1 AND user_id = $2
    `, [confessionId, userId]);
    
    return result.rows[0];
  }

  // Report operations
  async createReport(reportData: Omit<Report, 'id' | 'status' | 'created_at' | 'reviewed_at' | 'reviewed_by'>) {
    const result = await this.query(`
      INSERT INTO reports (confession_id, reported_by, reason, explanation)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [reportData.confession_id, reportData.reported_by, reportData.reason, reportData.explanation]);
    
    return result.rows[0];
  }

  async getReports(status?: string) {
    let query = `
      SELECT r.*, c.content as confession_content, c.category, u.full_name as reporter_name
      FROM reports r
      LEFT JOIN confessions c ON r.confession_id = c.id
      LEFT JOIN users u ON r.reported_by = u.id
    `;
    
    const params: any[] = [];
    
    if (status) {
      query += ' WHERE r.status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY r.created_at DESC';
    
    const result = await this.query(query, params);
    return result.rows;
  }

  async updateReportStatus(reportId: string, status: string, reviewedBy: string) {
    const result = await this.query(`
      UPDATE reports 
      SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [status, reviewedBy, reportId]);
    
    return result.rows[0];
  }

  // Admin operations
  async getStats() {
    const result = await this.query(`
      SELECT 
        (SELECT COUNT(*) FROM confessions WHERE is_hidden = false) as total_confessions,
        (SELECT COUNT(*) FROM confessions WHERE is_hidden = true) as hidden_confessions,
        (SELECT COUNT(*) FROM comments) as total_comments,
        (SELECT COUNT(*) FROM reports WHERE status = 'pending') as pending_reports,
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users
    `);
    
    return result.rows[0];
  }
}

export const db = new Database();