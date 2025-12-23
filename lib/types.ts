export interface Confession {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  is_hidden: boolean;
  comment_count: number;
}

export interface Comment {
  id: string;
  confession_id: string;
  content: string;
  author_id: string;
  created_at: string;
}



export interface Report {
  id: string;
  confession_id: string;
  reported_by: string;
  reason: 'hate_speech' | 'harassment' | 'spam' | 'other';
  explanation?: string;
  created_at: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export interface User {
  uid: string;
  isAnonymous: boolean;
}