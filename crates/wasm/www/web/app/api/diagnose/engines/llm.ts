// app/api/diagnose/engines/llm.ts
import { ScenarioInput } from '../../../../types/diagnostic';
import fs from 'fs';
import path from 'path';

export async function runLLMEngine(text: string, apiKey: string): Promise<{ scenario: ScenarioInput; logs: string[] }> {
  const logs: string[] = [];
  logs.push('[LLM] Preparing prompt...');

  // 读取 prompt 模板（支持环境变量覆盖）
  const promptPath = process.env.PROMPT_PATH || path.join(process.cwd(), 'docs/ai_evaluator_prompt.md');
  let promptTemplate = '';
  try {
    promptTemplate = fs.readFileSync(promptPath, 'utf8');
  } catch (e) {
    logs.push('[LLM] Warning: Prompt file not found, using built-in fallback.');
    promptTemplate = `You are an expert evaluator. Given the following text, extract 11 scores (1-10) for: content_emotion_arousal, social_currency_attr, practical_value, uniqueness, innovation, enhancement, strangeness, narrative_completeness, remix_openness, source_credibility, personification. Return JSON only. Text: {text}`;
  }

  const prompt = promptTemplate.replace(/\{text\}/g, text);
  logs.push('[LLM] Prompt prepared (length: ' + prompt.length + ')');

  // 调用 DeepSeek API（兼容 OpenAI 格式）
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a precise evaluator. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    logs.push('[LLM] API error: ' + errText);
    throw new Error(`LLM API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  logs.push('[LLM] Raw response: ' + content.slice(0, 200) + (content.length > 200 ? '...' : ''));

  // 解析 JSON（允许 markdown 代码块）
  let jsonStr = content;
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) jsonStr = codeBlockMatch[1];
  const scores = JSON.parse(jsonStr.trim());

  // 组装 scenario（使用默认值填充未提供的字段）
  const scenario: ScenarioInput = {
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
  };

  logs.push('[LLM] Scenario assembled');
  return { scenario, logs };
}
