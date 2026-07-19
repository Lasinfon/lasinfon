// types/diagnostic.ts
export interface ScoreInput {
  content_emotion_arousal: number;
  social_currency_attr: number;
  practical_value: number;
  uniqueness: number;
  innovation: number;
  enhancement: number;
  strangeness: number;
  narrative_completeness: number;
  remix_openness: number;
  source_credibility: number;
  personification: number;
}

export interface MemeParams {
  social_currency: number;
  share_cost: number;
  audience_trust_base: number;
  share_circle_preference: number;
}

export interface FieldState {
  t: number;
  C_t: number;
  R_t: number;
  R_0: number;
  mu_psych_t: number;
  K_pot_t: number;
  K_pot_0: number;
  K_soil: number;
  K_comp: number;
  K_base: number;
  A_algo: number;
  T: number;
  T_effective: number;
  challengability_score: number;
  circle_opposition: number;
  social_currency_t: number;
}

export interface EnvParams {
  surge_match: number;
  current_direction: number;
  terrain_passability: number;
  population_density: number;
  connectivity: number;
  raw_suppression: number;
  L_cognitive: number;
  L_operational: number;
  L_antipathy: number;
  content_emotion_intensity: number;
  audience_resonance_match: number;
  environment_emotion_fit: number;
}

export interface ScenarioInput {
  scores: ScoreInput;
  meme: MemeParams;
  field: FieldState;
  env: EnvParams;
}

export interface SimulationRecord {
  t: number;
  C_t: number;
  R_t: number;
  mu_psych_t: number;
  K_pot_t: number;
  social_currency_t: number;
  G: number;
  G_std: number;
  K_mult: number;
  lambda_val: number;
  lambda_eff: number;
  W: number;
  growth_level: string;
  exposure_level: string;
  quadrant: string;
  willingness_level: string;
}

export interface SimulationResult {
  records: SimulationRecord[];
}

export interface DiagnosticResult {
  scenario: ScenarioInput;
  simulation: SimulationResult;
  engine: 'mock' | 'llm' | 'unknown';
  logs: string[];
  rawResponse?: string;
}

export interface DiagnosticState {
  isLoading: boolean;
  result: DiagnosticResult | null;
  error: string | null;
  logs: string[];
}

export interface ConfigState {
  maxTicks: number;
  sigma: number;
  seed: number;
  enableEmergence: boolean;
}

export interface UIState {
  step: 1 | 2 | 3 | 4;
  inputText: string;
}
