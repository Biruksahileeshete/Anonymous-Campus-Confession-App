'use client';

import { useState, useEffect } from 'react';

interface ReactionButtonsProps {
  confessionId: string;
  reactions: { [key: string]: number };
  onUpdate: () => void;
}

export default function ReactionButtons({
  confessionId,
  reactions,
  onUpdate
}: ReactionButtonsProps) {
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Popular emojis for quick access
  const popularEmojis = ['👍', '❤️', '😂', '😢', '😮', '😡', '🔥', '💯', '👏', '🙌', '😍', '🤔', '😭', '🎉', '💪'];
  


  useEffect(() => {
    fetchUserReactions();
  }, [confessionId]);

  const fetchUserReactions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/reactions?confessionId=${confessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserReactions(data.userReactions || []);
      }
    } catch (error) {
      console.error('Error fetching user reactions:', error);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (isLoading) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to react');
      return;
    }

    setIsLoading(true);
    
    try {
      const isAlreadyReacted = userReactions.includes(emoji);
      
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          confessionId,
          type: emoji,
          action: isAlreadyReacted ? 'remove' : 'add'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update local state immediately for better UX
        if (isAlreadyReacted) {
          setUserReactions(prev => prev.filter(r => r !== emoji));
        } else {
          setUserReactions(prev => [...prev, emoji]);
        }
        
        // Refresh the confession data to get updated counts
        setTimeout(() => {
          onUpdate();
        }, 100);
        
      } else {
          let errorText = 'Failed to update reaction';
          try {
            const errorData = await response.json();
            console.error('Reaction error:', errorData);
            errorText = errorData.error || JSON.stringify(errorData) || errorText;
          } catch (e) {
            // fallback to status text
            console.error('Reaction non-json error, status:', response.status, response.statusText);
            errorText = response.statusText || errorText;
          }
          alert(errorText);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      alert('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonClass = (emoji: string) => {
    const isActive = userReactions.includes(emoji);
    const baseClass = "flex items-center space-x-1 px-3 py-2 rounded-full transition-all duration-200 text-sm font-medium backdrop-blur-sm transform hover:scale-105";
    
    if (isActive) {
      return `${baseClass} bg-blue-500/30 text-blue-200 border border-blue-400/50 shadow-lg`;
    }
    
    return `${baseClass} bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white`;
  };

  return (
    <div className="space-y-3">
      {/* Reaction summary */}
      <div className="flex items-center flex-wrap gap-2">
        {Object.entries(reactions).map(([emoji, count]) => {
          if (count === 0) return null;
          
          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              disabled={isLoading}
              className={getButtonClass(emoji)}
            >
              <span className="text-lg">{emoji}</span>
              <span>{count}</span>
            </button>
          );
        })}
        
        {/* Add reaction button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="flex items-center space-x-1 px-3 py-2 rounded-full bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white transition-all duration-200 text-sm font-medium backdrop-blur-sm"
        >
          <span>➕</span>
          <span>React</span>
        </button>
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
            {popularEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  handleReaction(emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-2xl p-2 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-white/60 text-xs text-center">
              Click any emoji to react! You can use multiple reactions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}