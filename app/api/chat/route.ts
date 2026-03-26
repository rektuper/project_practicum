import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { searchEmployees } from '@/lib/data/employees';
import { getEvents, searchEvents } from '@/lib/data/events';
import { getTasks } from '@/lib/data/tasks';
import path from 'path';

const OPENROUTER_URL   = '#';
const OPENROUTER_MODEL = '#';
const API_KEY          = process.env.OPENROUTER_API_KEY;

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'app', 'api', 'chat', 'system_prompt.txt');
    const systemPrompt = await readFile(filePath, 'utf-8');
    

    const llmMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: message }
    ];

    const llmResp = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: llmMessages,
        stream: false
      })
    });

    if (!llmResp.ok) {
      console.error('LLM API error:', await llmResp.text());
      return NextResponse.json({ error: 'LLM API error' }, { status: 502 });
    }

    const llmData = await llmResp.json();
    const reply   = llmData.choices?.[0]?.message?.content;
    if (typeof reply !== 'string') {
      throw new Error('Unexpected LLM response');
    }

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
