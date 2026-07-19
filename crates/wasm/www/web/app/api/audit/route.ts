import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

    // 读取审计 Prompt
    const promptPath = path.join(process.cwd(), '..', '..', '..', '..', 'docs', 'ai_diagnostic_audit_prompt.md');
    let promptTemplate = '';
    try {
      promptTemplate = fs.readFileSync(promptPath, 'utf8');
    } catch (_) {
      // fallback: 尝试从 public/docs 读取
      const fallbackPath = path.join(process.cwd(), 'public', 'docs', 'ai_diagnostic_audit_prompt.md');
      promptTemplate = fs.readFileSync(fallbackPath, 'utf8');
    }

    // 构建完整的 Prompt
    const fullPrompt = `${promptTemplate}

## INPUT

### 1. Original Content
${text}

### 2. 13-Factor Scores
${JSON.stringify(scores, null, 2)}

## OUTPUT
Generate the audit report following the structure above.`;

    // 调用 LLM API（DeepSeek）
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DEEPSEEK_API_KEY not set' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
    const auditReport = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ report: auditReport });

  } catch (err: any) {
    console.error('[Audit API] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
