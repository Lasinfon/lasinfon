import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, scores } = body;

    if (!text || !scores) {
      return NextResponse.json(
        { error: 'Missing text or scores' },
        { status: 400 }
      );
    }

    const LLM_MODE = process.env.LASINFON_LLM_MODE || 'mock';
    const API_KEY = process.env.DEEPSEEK_API_KEY;

    // ── 降级模式 ──
    if (LLM_MODE === 'mock' || !API_KEY) {
      const mockPath = path.join(process.cwd(), 'config/mock-data/audit.json');
      try {
        const mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));
        return NextResponse.json(mockData);
      } catch (_) {
        // fallback: 返回占位报告
        return NextResponse.json({
          report: `## 1. Score Justification Table\n\n（演示数据）请接入 LLM API 以获取完整审计报告。\n\n## 2. Strengths（亮点）\n\n待生成...\n\n## 3. Weaknesses（坑点）\n\n待生成...\n\n## 4. Contradictions or Tensions\n\n待生成...\n\n## 5. Confidence Assessment\n\n待生成...`
        });
      }
    }

    // ── LLM 模式 ──
    const promptPath = findPromptFile('ai_diagnostic_audit_prompt.md');
    let promptTemplate = fs.readFileSync(promptPath, 'utf8');

    const fullPrompt = `${promptTemplate}

## INPUT

### 1. Original Content
${text}

### 2. 13-Factor Scores
${JSON.stringify(scores, null, 2)}

## OUTPUT
Generate the audit report following the structure above.`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a forensic metrology auditor. Produce structured audit reports only.' },
          { role: 'user', content: fullPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `LLM API error: ${response.status} - ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const report = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ report });

  } catch (err: any) {
    console.error('[Audit API] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
