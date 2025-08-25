import OpenAI from 'openai';
import { AIInput, AIResult } from './provider';

export async function processWithOpenAI(input: AIInput): Promise<AIResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  // Minimaler Prompt – Bild optional, hier nur Text für MVP:
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: `Erstelle Angebotspositionen für: ${input.projectInfo}. Antworte im JSON-Format: { "description": "...", "positions": [ { "title": "...", "qty": 1, "unit": "Psch", "price": 100 } ], "total": 100 }` }],
    temperature: 0.1,
  });
  const text = completion.choices[0]?.message?.content ?? '{}';
  return JSON.parse(text) as AIResult;
}