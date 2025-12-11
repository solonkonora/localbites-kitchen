import { NextRequest, NextResponse } from 'next/server';
// integration with OpenAI
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// checking if the OpenAI API key is set in env file
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key in environment variables');
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

    const messages = [
      {
        role: 'system',
        content: `You are a helpful cooking assistant for LocalBites Kitchen, an African recipe platform. 
        Help users with:
        - Recipe recommendations from our African cuisine collection
        - Ingredient substitutions
        - Cooking instructions and techniques
        - African cuisine knowledge
        
        Be friendly, concise, and focus on African recipes. Use simple language.`
      },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request. Please try again";

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}