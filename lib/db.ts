import { Pool } from 'pg';
import { Database } from 'sqlite3';

export interface Confession {
  id: string;
  content: string;
  category: 'Love' | 'Stress' | 'Funny' | 'Serious';
  createdAt: string;
  authorId: string;
  isHidden: boolean;
  likeCount: number;
  laughCount: number;
  sadCount: number;
}

export interface Comment {
  id: string;
  confessionId: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  confessionId: string;
  reportedBy: string;
  reason: 'hate_speech' | 'harassment' | 'spam' | 'other';
  explanation?: string;
  createdAt: string;
}

// SQLite for development, PostgreSQL for production
const isProduction = process.env.NODE_ENV === 'production';

let pool: Pool | null = null;

// In-memory storage for demo purposes
let memoryDB: {
  confessions: Confession[];
  comments: Comment[];
  reports: Report[];
} = {
  confessions: [],
  comments: [],
  reports: []
};

if (isProduction) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

export async function query(text: string, params?: any[]) {
  if (isProduction && pool) {
    return pool.query(text, params);
  } else {
    // Use in-memory storage for development/demo
    return handleInMemoryQuery(text, params || []);
  }
}

function handleInMemoryQuery(sql: string, params: any[]) {
  const sqlLower = sql.toLowerCase().trim();
  
  if (sqlLower.includes('create table')) {
    // Table creation - just return success
    return [];
  }
  
  if (sqlLower.startsWith('select')) {
    if (sqlLower.includes('from confessions')) {
      return memoryDB.confessions.filter(c => !c.isHidden).slice(0, 50);
    }
    if (sqlLower.includes('from comments')) {
      const confessionId = params[0];
      return memoryDB.comments.filter(c => c.confessionId === confessionId);
    }
    return [];
  }
  
  if (sqlLower.startsWith('insert')) {
    if (sqlLower.includes('into confessions')) {
      const [id, content, category, authorId, createdAt] = params;
      const confession: Confession = {
        id, content, category, createdAt, authorId,
        isHidden: false, likeCount: 0, laughCount: 0, sadCount: 0
      };
      memoryDB.confessions.unshift(confession);
    } else if (sqlLower.includes('into comments')) {
      const [id, confessionId, content, authorId, createdAt] = params;
      const comment: Comment = { id, confessionId, content, authorId, createdAt };
      memoryDB.comments.push(comment);
    } else if (sqlLower.includes('into reports')) {
      const [id, confessionId, reportedBy, reason, explanation, createdAt] = params;
      const report: Report = { id, confessionId, reportedBy, reason, explanation, createdAt };
      memoryDB.reports.push(report);
    }
    return [];
  }
  
  if (sqlLower.startsWith('update')) {
    if (sqlLower.includes('confessions')) {
      const [likeCount, laughCount, sadCount, id] = params;
      const confession = memoryDB.confessions.find(c => c.id === id);
      if (confession) {
        confession.likeCount = likeCount;
        confession.laughCount = laughCount;
        confession.sadCount = sadCount;
      }
    }
    return [];
  }
  
  return [];
}

export async function initDB() {
  // For in-memory storage, just ensure the structure exists
  if (!memoryDB.confessions) memoryDB.confessions = [];
  if (!memoryDB.comments) memoryDB.comments = [];
  if (!memoryDB.reports) memoryDB.reports = [];
  
  // Add some sample data for demo
  if (memoryDB.confessions.length === 0) {
    const sampleConfessions: Confession[] = [
      {
        id: 'sample-1',
        content: 'I have a huge crush on someone in my chemistry class but I\'m too shy to talk to them. Every time they smile at me, my heart skips a beat! 💕',
        category: 'Love',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        authorId: 'sample-user-1',
        isHidden: false,
        likeCount: 12,
        laughCount: 3,
        sadCount: 1
      },
      {
        id: 'sample-2',
        content: 'Finals week is killing me! I\'ve been surviving on coffee and 3 hours of sleep. Why did I think taking 6 classes was a good idea? 😭',
        category: 'Stress',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        authorId: 'sample-user-2',
        isHidden: false,
        likeCount: 8,
        laughCount: 2,
        sadCount: 15
      },
      {
        id: 'sample-3',
        content: 'Today I accidentally walked into the wrong classroom and sat through 20 minutes of advanced calculus before realizing I was supposed to be in art history. The professor just kept going and I was too embarrassed to leave! 😂',
        category: 'Funny',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        authorId: 'sample-user-3',
        isHidden: false,
        likeCount: 25,
        laughCount: 18,
        sadCount: 0
      }
    ];
    
    memoryDB.confessions = sampleConfessions;
  }
}