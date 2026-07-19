// app/api/diagnose/engines/mock.ts
import { ScenarioInput } from '../../../../types/diagnostic';

// TODO: [DEBT] MockEngine 仅用于开发测试，不适用于生产环境。
// 生产环境必须通过 DEEPSEEK_API_KEY 启用 LLM 路径。
// 当前实现返回一组固定的默认值，不依赖输入文本。

export function runMockEngine(_text: string): { scenario: ScenarioInput; logs: string[] } {
  const logs: string[] = [];
  logs.push('[Mock] Using default scenario (text ignored).');

  // 所有分数均为中等偏上默认值，可在此处调整以测试不同输入。
  const scenario: ScenarioInput = {
    scores: {
      content_emotion_arousal: 4,
      social_currency_attr: 3,
      practical_value: 1,
      uniqueness: 3,
      innovation: 2,
      enhancement: 3,
      strangeness: 2,
      narrative_completeness: 5,
      remix_openness: 1,
      source_credibility: 3,
      personification: 5,
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

  logs.push('[Mock] Scenario assembled with static defaults.');
  return { scenario, logs };
}
