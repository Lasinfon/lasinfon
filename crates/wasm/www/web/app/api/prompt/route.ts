import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 尝试从项目根目录读取 docs/ai_result_interpreter_prompt.md
    const promptPath = path.join(process.cwd(), '..', '..', '..', '..', 'docs', 'ai_result_interpreter_prompt.md');
    // 如果上述路径不存在，尝试相对路径（兼容不同目录结构）
    let content;
    try {
      content = fs.readFileSync(promptPath, 'utf8');
    } catch (_) {
      // fallback: 尝试从当前目录的 public/docs 读取
      const fallbackPath = path.join(process.cwd(), 'public', 'docs', 'ai_result_interpreter_prompt.md');
      content = fs.readFileSync(fallbackPath, 'utf8');
    }
    return NextResponse.json({ prompt: content });
  } catch (err: any) {
    console.error('Failed to load prompt:', err);
    return NextResponse.json(
      { error: 'Failed to load prompt file', details: err.message },
      { status: 500 }
    );
  }
}
