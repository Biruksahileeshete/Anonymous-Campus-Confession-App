'use client';

import { useState, useEffect } from 'react';

interface CommentCountProps {
  confessionId: string;
}

export default function CommentCount({ confessionId }: CommentCountProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchCommentCount();
  }, [confessionId]);

  const fetchCommentCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments/count?confessionId=${confessionId}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching comment count:', error);
    }
  };

  return (
    <span className="text-white/60 text-sm">
      {count} {count === 1 ? 'comment' : 'comments'}
    </span>
  );
}