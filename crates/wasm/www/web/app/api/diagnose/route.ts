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
    const { platform, purpose, content } = body;

    if (!content || typeof content !== 'string' || content.length < 5) {
      return NextResponse.json(
        { error: 'Content must be at least 5 characters' },
        { status: 400 }
      );
    }

    // 读取评估 Prompt
    const promptPath = findPromptFile('ai_evaluator_prompt.md');
    let promptTemplate = fs.readFileSync(promptPath, 'utf8');

    const fullPrompt = `${promptTemplate}

## INPUT
Content: ${content}

## OUTPUT
Return only valid JSON.`;

    // ── 降级模式 ──
    const LLM_MODE = process.env.LASINFON_LLM_MODE || 'mock';
    const API_KEY = process.env.DEEPSEEK_API_KEY;

    if (LLM_MODE === 'mock' || !API_KEY) {
      const mockPath = path.join(process.cwd(), 'config/mock-data/diagnose.json');
      let mockData;
      try {
        mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));
      } catch (_) {
        // fallback: 硬编码默认值
        mockData = {
          scores: {
            content_emotion_arousal: 4,
            social_currency_attr: 3,
            practical_value: 1,
            uniqueness: 2,
            innovation: 2,
            enhancement: 2,
            strangeness: 2,
            narrative_completeness: 4,
            remix_openness: 1,
            source_credibility: 2,
            personification: 4,
          },
          meme: {
            social_currency: 6.5,
            share_cost: 4.0,
            audience_trust_base: 7.0,
            share_circle_preference: 6.0,
          },
          env: {
            surge_match: 3.5,
            current_direction: 5.5,
            terrain_passability: 7.0,
            population_density: 8.5,
            connectivity: 8.5,
            raw_suppression: 2.0,
            L_cognitive: 2.0,
            L_operational: 1.0,
            L_antipathy: 2.0,
            content_emotion_intensity: 5.5,
            audience_resonance_match: 6.5,
            environment_emotion_fit: 5.5,
          },
          engine: 'mock',
          confidence: { content_access: true, reliability: 'high' },
        };
      }
      return NextResponse.json({ ...mockData, engine: 'mock' });
    }

    // ── LLM 模式 ──
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a precise evaluator. Return only valid JSON.' },
          { role: 'user', content: fullPrompt },
        ],
        temperature: 0.1,
        max_tokens: 500,
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
    const contentText = data.choices?.[0]?.message?.content || '';

    // 解析 JSON（允许 markdown 代码块）
    let jsonStr = contentText;
    const codeBlockMatch = contentText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) jsonStr = codeBlockMatch[1];
    const scores = JSON.parse(jsonStr.trim());

    // 组装 scenario
    const scenario = {
      scores: {
        content_emotion_arousal: scores.content_emotion_arousal ?? 4,
        social_currency_attr: scores.social_currency_attr ?? 3,
        practical_value: scores.practical_value ?? 1,
        uniqueness: scores.uniqueness ?? 3,
        innovation: scores.innovation ?? 2,
        enhancement: scores.enhancement ?? 3,
        strangeness: scores.strangeness ?? 2,
        narrative_completeness: scores.narrative_completeness ?? 5,
        remix_openness: scores.remix_openness ?? 1,
        source_credibility: scores.source_credibility ?? 3,
        personification: scores.personification ?? 5,
      },
      meme: {
        social_currency: 7.0,
        share_cost: 0.3,
        audience_trust_base: 0.6,
        share_circle_preference: 0.7,
      },
      field: {
        t: 0,
        C_t: 0.0,
        R_t: 7.1,
        R_0: 5.0,
        mu_psych_t: 2.08,
        K_pot_t: 1.0,
        K_pot_0: 1.0,
        K_soil: 1.0,
        K_comp: 1.0,
        K_base: 0.8,
        A_algo: 1.0,
        T: 0.5,
        T_effective: 0.5,
        challengability_score: 0.2,
        circle_opposition: 0.1,
        social_currency_t: 7.0,
      },
      env: {
        surge_match: 0.6,
        current_direction: 0.5,
        terrain_passability: 0.7,
        population_density: 0.8,
        connectivity: 0.6,
        raw_suppression: 0.2,
        L_cognitive: 2.0,
        L_operational: 1.5,
        L_antipathy: 1.0,
        content_emotion_intensity: 6.0,
        audience_resonance_match: 0.7,
        environment_emotion_fit: 0.6,
      },
      engine: 'llm',
      confidence: { content_access: true, reliability: 'high' },
    };

    return NextResponse.json(scenario);

  } catch (err: any) {
    console.error('[Diagnose API] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
