import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function findPromptFile(filename: string): string {
  const candidates = [
    path.join(process.cwd(), 'docs', filename),
    path.join(process.cwd(), 'docs/prompts', filename),
    path.join(process.cwd(), '..', '..', 'docs', filename),
    path.join(process.cwd(), '..', '..', '..', '..', 'docs', filename),
    path.join(process.cwd(), 'crates/wasm/www/web/docs', filename),
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch (_) { /* ignore */ }
  }
  throw new Error(`Prompt file not found: ${filename}`);
}

export async function GET() {
  try {
    const promptPath = findPromptFile('ai_result_interpreter_prompt.md');
    const content = fs.readFileSync(promptPath, 'utf8');
    return NextResponse.json({ prompt: content });
  } catch (err: any) {
    console.error('[Prompt API] Error:', err);
    return NextResponse.json(
      { error: 'Failed to load prompt file', details: err.message },
      { status: 500 }
    );
  }
}
