/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// checking if the OpenAI API key is set in env file
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key in environment variables');
}

// Constants for validation
const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONVERSATION_HISTORY = 20;
const VALID_ROLES = ['user', 'assistant', 'system'] as const;

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute

// In-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Rate limiting function
function checkRateLimit(identifier: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    // Rate limit exceeded
    return { allowed: false, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  return { allowed: true };
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) return realIP;
  if (cfConnectingIP) return cfConnectingIP;
  
  // Fallback to a default if no IP found (shouldn't happen in production)
  return 'unknown';
}

// Function to search recipes
async function searchRecipes(query: string) {
  try {
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.error('NEXT_PUBLIC_API_BASE_URL is not configured');
      return [];
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/search/semantic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit: 5 }),
    });
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Recipe search error:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimitCheck = checkRateLimit(clientIP);
    
    if (!rateLimitCheck.allowed) {
      const resetTime = rateLimitCheck.resetTime || Date.now();
      const secondsUntilReset = Math.ceil((resetTime - Date.now()) / 1000);
      
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: secondsUntilReset 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': secondsUntilReset.toString(),
            'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          }
        }
      );
    }

    const { message, conversationHistory } = await request.json();

    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed` },
        { status: 400 }
      );
    }

    // Validate conversationHistory
    if (conversationHistory !== undefined) {
      if (!Array.isArray(conversationHistory)) {
        return NextResponse.json(
          { error: 'Conversation history must be an array' },
          { status: 400 }
        );
      }

      if (conversationHistory.length > MAX_CONVERSATION_HISTORY) {
        return NextResponse.json(
          { error: `Conversation history too long. Maximum ${MAX_CONVERSATION_HISTORY} messages allowed` },
          { status: 400 }
        );
      }

      // Validate each message in history
      for (const msg of conversationHistory) {
        if (!msg || typeof msg !== 'object') {
          return NextResponse.json(
            { error: 'Invalid message format in conversation history' },
            { status: 400 }
          );
        }

        if (!msg.role || !VALID_ROLES.includes(msg.role)) {
          return NextResponse.json(
            { error: 'Invalid role in conversation history. Must be user, assistant, or system' },
            { status: 400 }
          );
        }

        if (!msg.content || typeof msg.content !== 'string') {
          return NextResponse.json(
            { error: 'Invalid content in conversation history' },
            { status: 400 }
          );
        }

        if (msg.content.length > MAX_MESSAGE_LENGTH) {
          return NextResponse.json(
            { error: 'Message in conversation history is too long' },
            { status: 400 }
          );
        }
      }
    }

    const messages = [
      {
        role: 'system',
        content: `You are a helpful cooking assistant for LocalBites Kitchen, an African recipe platform. 
        Help users with:
        - Recipe recommendations from our African cuisine collection
        - Ingredient substitutions
        - Cooking instructions and techniques
        - African cuisine knowledge
        
        You have access to a recipe search tool. Use it when users ask for specific recipes or recommendations.
        Be friendly, concise, and focus on African recipes. Use simple language.`
      },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    // Check if user is asking for recipes
    let recipeContext = '';
    if (message.toLowerCase().includes('recipe') || message.toLowerCase().includes('find') || message.toLowerCase().includes('recommend')) {
      const recipes = await searchRecipes(message);
      if (recipes.length > 0) {
        recipeContext = `\n\nBased on our collection, here are some relevant recipes:\n${recipes.map((r: { title: any; description: any; }) => `- ${r.title}: ${r.description || 'A delicious dish'}`).join('\n')}\n\n`;
      }
    }

    // Add recipe context to the last user message if available
    if (recipeContext) {
      messages[messages.length - 1].content += recipeContext;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = response.choices[0]?.message?.content?.trim() || "I'm sorry, I couldn't process that request. Please try again";

    return NextResponse.json({ message: aiResponse });
  } catch (error) {
    console.error('OpenAI API error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}