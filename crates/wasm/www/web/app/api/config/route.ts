import { NextResponse } from 'next/server';

export async function GET() {
  const llmMode = process.env.LASINFON_LLM_MODE || 'mock';
  const apiKey = !!process.env.DEEPSEEK_API_KEY;
  return NextResponse.json({ llmMode, apiKey });
}
