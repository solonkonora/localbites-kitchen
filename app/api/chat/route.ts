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