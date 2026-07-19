// app/api/diagnose/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runMockEngine } from './engines/mock';
import { runLLMEngine } from './engines/llm';
import { ScenarioInput } from '../../../types/diagnostic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, engine = 'auto' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text field' }, { status: 400 });
    }

    let scenario: ScenarioInput;
    let logs: string[] = [];
    let usedEngine: 'mock' | 'llm' = 'mock';

    // 决定使用哪个引擎
    const useMock = engine === 'mock' || (engine === 'auto' && !process.env.DEEPSEEK_API_KEY);
    if (useMock) {
      const result = runMockEngine(text);
      scenario = result.scenario as ScenarioInput;
      logs = result.logs;
      usedEngine = 'mock';
    } else {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'DEEPSEEK_API_KEY not set' }, { status: 500 });
      }
      try {
        const result = await runLLMEngine(text, apiKey);
        scenario = result.scenario;
        logs = result.logs;
        usedEngine = 'llm';
      } catch (err: any) {
        logs.push('[API] LLM failed, falling back to mock');
        const fallback = runMockEngine(text);
        scenario = fallback.scenario as ScenarioInput;
        logs = logs.concat(fallback.logs);
        usedEngine = 'mock';
      }
    }

    return NextResponse.json({
      scenario,
      logs,
      engine: usedEngine,
    });
  } catch (err: any) {
    console.error('[API] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
