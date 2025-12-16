// Input validation utilities

export function validateConfession(content: string): { isValid: boolean; error?: string } {
  // Check content length
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Confession content cannot be empty' };
  }
  
  if (content.length > 1000) {
    return { isValid: false, error: 'Confession is too long (maximum 1000 characters)' };
  }
  
  if (content.length < 10) {
    return { isValid: false, error: 'Confession is too short (minimum 10 characters)' };
  }
  
  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /^[A-Z\s!]{20,}$/, // All caps
    /(https?:\/\/[^\s]+)/gi, // URLs
    /(\b\w+\b)(\s+\1){3,}/gi, // Repeated words
  ];
  
  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      return { isValid: false, error: 'Content appears to be spam or inappropriate' };
    }
  }
  
  return { isValid: true };
}

export function validateComment(content: string): { isValid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Comment cannot be empty' };
  }
  
  if (content.length > 500) {
    return { isValid: false, error: 'Comment is too long (maximum 500 characters)' };
  }
  
  if (content.length < 3) {
    return { isValid: false, error: 'Comment is too short (minimum 3 characters)' };
  }
  
  return { isValid: true };
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' '); // Normalize whitespace
}

// Profanity filter (basic implementation)
const profanityWords = [
  // Add inappropriate words here
  'spam', 'test123', 'dummy'
];

export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityWords.some(word => lowerText.includes(word));
}

export function moderateContent(content: string): { isAppropriate: boolean; reason?: string } {
  if (containsProfanity(content)) {
    return { isAppropriate: false, reason: 'Contains inappropriate language' };
  }
  
  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.7 && content.length > 20) {
    return { isAppropriate: false, reason: 'Excessive use of capital letters' };
  }
  
  return { isAppropriate: true };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
}