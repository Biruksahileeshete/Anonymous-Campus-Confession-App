'use client';

import { useState, useEffect, useCallback } from 'react';
import { reactionManager } from '@/lib/reaction-manager';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [customEmoji, setCustomEmoji] = useState('');
  const [reactionState, setReactionState] = useState<{
    userReactions: string[];
    counts: { [key: string]: number };
    isPending: (emoji: string) => boolean;
  } | null>(null);

  // Popular emojis for quick access
  const popularEmojis = ['👍', '❤️', '😂', '😢', '😮', '😡', '🔥', '💯', '👏', '🙌', '😍', '🤔', '😭', '🎉', '💪'];
  
  // Extended emoji categories
  const emojiCategories = {
    faces: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    hands: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
    objects: ['🔥', '💯', '💥', '💫', '⭐', '🌟', '✨', '⚡', '💎', '🏆', '🥇', '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰'],
    nature: ['🌈', '☀️', '🌙', '⭐', '🌟', '💫', '✨', '☁️', '⛅', '🌤️', '🌦️', '🌧️', '⛈️', '🌩️', '❄️', '☃️', '⛄', '🌊', '💧', '💦'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔']
  };

  // Initialize reaction manager and subscribe to changes
  useEffect(() => {
    // Initialize with current data first
    reactionManager.initializeConfession(confessionId, [], reactions);
    
    // Subscribe to changes
    const unsubscribe = reactionManager.subscribe(confessionId, () => {
      const state = reactionManager.getState(confessionId);
      if (state) {
        setReactionState(state);
      }
    });

    // Fetch user reactions and update state
    const fetchAndUpdate = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || token === 'null') {
          // Set initial state even without token
          const initialState = reactionManager.getState(confessionId);
          if (initialState) {
            setReactionState(initialState);
          }
          return;
        }

        const response = await fetch(`/api/reactions?confessionId=${confessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const userReactions = data.userReactions || [];
          
          // Re-initialize with fetched user reactions
          reactionManager.initializeConfession(confessionId, userReactions, reactions);
          
          // Update local state immediately
          const state = reactionManager.getState(confessionId);
          if (state) {
            setReactionState(state);
          }
        } else {
          // Even if fetch fails, show the initial state
          const initialState = reactionManager.getState(confessionId);
          if (initialState) {
            setReactionState(initialState);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch user reactions:', error);
        // Show initial state even on error
        const initialState = reactionManager.getState(confessionId);
        if (initialState) {
          setReactionState(initialState);
        }
      }
    };

    fetchAndUpdate();

    return () => {
      unsubscribe();
    };
  }, [confessionId, reactions]);

  const handleReaction = useCallback(async (emoji: string) => {
    if (!emoji?.trim()) return;
    
    try {
      const wasToggled = await reactionManager.toggleReaction(confessionId, emoji.trim());
      
      // Haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      // Optional: notify parent component
      setTimeout(() => onUpdate(), 100);
      
    } catch (error) {
      console.warn('Reaction failed:', error);
      // Show user-friendly message
      const message = error instanceof Error ? error.message : 'Failed to react';
      // You could show a toast notification here instead of alert
      console.error('Reaction error:', message);
    }
  }, [confessionId, onUpdate]);

  const handleCustomEmojiSubmit = useCallback(() => {
    if (customEmoji.trim()) {
      handleReaction(customEmoji.trim());
      setCustomEmoji('');
      setShowEmojiPicker(false);
    }
  }, [customEmoji, handleReaction]);

  const getCurrentEmojis = () => {
    if (selectedCategory === 'popular') return popularEmojis;
    return emojiCategories[selectedCategory as keyof typeof emojiCategories] || popularEmojis;
  };

  const getButtonClass = (emoji: string) => {
    const isActive = reactionState?.userReactions.includes(emoji) || false;
    const isPending = reactionState?.isPending(emoji) || false;
    
    let baseClass = "flex items-center space-x-1 px-3 py-2 rounded-full transition-all duration-150 text-sm font-medium backdrop-blur-sm transform hover:scale-105 active:scale-95";
    
    if (isPending) {
      baseClass += " opacity-70 animate-pulse";
    }
    
    if (isActive) {
      return `${baseClass} bg-gradient-to-r from-blue-500/40 to-purple-500/40 text-white border-2 border-blue-400/70 shadow-lg`;
    }
    
    return `${baseClass} bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white/90 hover:text-white`;
  };

  // Use optimized counts from reaction manager or fallback to props
  const displayCounts = reactionState?.counts || reactions;
  const userReactions = reactionState?.userReactions || [];

  return (
    <div className="space-y-3">
      {/* Reaction summary */}
      <div className="flex items-center flex-wrap gap-2">
        {Object.entries(displayCounts).map(([emoji, count]) => {
          if (count === 0) return null;
          
          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className={getButtonClass(emoji)}
              style={{ willChange: 'transform' }}
            >
              <span className="text-lg">{emoji}</span>
              <span className="font-semibold">{count}</span>
            </button>
          );
        })}
        
        {/* Add reaction button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="flex items-center space-x-1 px-3 py-2 rounded-full border transition-all duration-150 text-sm font-medium backdrop-blur-sm hover:scale-105 active:scale-95 bg-gradient-to-r from-coral-500/20 to-teal-500/20 hover:from-coral-500/30 hover:to-teal-500/30 border-coral-400/30 hover:border-coral-400/50 text-white"
          style={{ willChange: 'transform' }}
        >
          <span className="text-lg">➕</span>
          <span>React</span>
        </button>
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 animate-fade-scale">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-4 border-b border-white/20 pb-3">
            <button
              onClick={() => setSelectedCategory('popular')}
              className={`px-3 py-1 rounded-lg text-sm transition-all duration-150 ${
                selectedCategory === 'popular' 
                  ? 'bg-coral-500/20 border border-coral-400/50' 
                  : 'border hover:bg-coral-500/10'
              }`}
              style={{
                backgroundColor: selectedCategory === 'popular' ? 'var(--coral-50)' : 'transparent',
                borderColor: selectedCategory === 'popular' ? 'var(--coral-500)' : 'var(--border-primary)',
                color: selectedCategory === 'popular' ? 'var(--coral-500)' : 'var(--text-secondary)'
              }}
            >
              Popular
            </button>
            {Object.keys(emojiCategories).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-150 capitalize border ${
                  selectedCategory === category 
                    ? 'bg-coral-500/20 border-coral-400/50' 
                    : 'border hover:bg-coral-500/10'
                }`}
                style={{
                  backgroundColor: selectedCategory === category ? 'var(--coral-50)' : 'transparent',
                  borderColor: selectedCategory === category ? 'var(--coral-500)' : 'var(--border-primary)',
                  color: selectedCategory === category ? 'var(--coral-500)' : 'var(--text-secondary)'
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto mb-4">
            {getCurrentEmojis().map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  handleReaction(emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-2xl p-2 rounded-lg hover:bg-white/20 transition-all duration-150 transform hover:scale-110 active:scale-95"
                style={{ willChange: 'transform' }}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Custom emoji input */}
          <div className="border-t border-white/20 pt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={customEmoji}
                onChange={(e) => setCustomEmoji(e.target.value)}
                placeholder="Type any emoji..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-400/50 transition-all duration-150"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomEmojiSubmit()}
              />
              <button
                onClick={handleCustomEmojiSubmit}
                className="px-4 py-2 bg-blue-500/30 text-blue-200 border border-blue-400/50 rounded-lg hover:bg-blue-500/40 transition-all duration-150 hover:scale-105 active:scale-95"
                style={{ willChange: 'transform' }}
              >
                Add
              </button>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-tertiary)' }}>
              You can use any emoji! Just type or paste it above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}