import { NextRequest, NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';
import { validateConfession, sanitizeInput, moderateContent } from '@/lib/validation';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/auth-middleware';

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const confessions = await simpleDb.getConfessions();
    return NextResponse.json(confessions);
  } catch (error) {
    console.error('Error fetching confessions:', error);
    return NextResponse.json({ error: 'Failed to fetch confessions' }, { status: 500 });
  }
});

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { content } = await request.json();
    
    // Basic validation
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    
    // Rate limiting
    const rateLimitResult = checkRateLimit(
      `confession_${user.id}`, 
      RATE_LIMITS.CONFESSION_POST.maxRequests,
      RATE_LIMITS.CONFESSION_POST.windowMs
    );
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many confessions. Please wait before posting again.' }, 
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }
    
    // Validate and sanitize content
    const sanitizedContent = sanitizeInput(content);
    const validation = validateConfession(sanitizedContent);
    
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    // Content moderation
    const moderation = moderateContent(sanitizedContent);
    if (!moderation.isAppropriate) {
      return NextResponse.json({ 
        error: `Content rejected: ${moderation.reason}` 
      }, { status: 400 });
    }
    
    // Create confession
    const newConfession = await simpleDb.createConfession({
      content: sanitizedContent,
      author_id: user.id,
      is_hidden: false
    });
    
    return NextResponse.json(newConfession, { 
      status: 201,
      headers: getRateLimitHeaders(rateLimitResult)
    });
  } catch (error) {
    console.error('Error creating confession:', error);
    return NextResponse.json({ error: 'Failed to create confession' }, { status: 500 });
  }
});