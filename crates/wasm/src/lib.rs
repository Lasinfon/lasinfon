#![allow(non_snake_case)]

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use lasinfon_core::types::*;
use lasinfon_core::formulas::pipeline::{compute_full_pipeline, PipelineOutput};
use lasinfon_core::formulas::exponent_layer::compute_lambda_and_exposure;
use lasinfon_state::state_transfer::{StateTransferParams, tick};
use lasinfon_state::simulation::{run_simulation, SimulationConfig, StepRecord};

// ── Helper for BARS Clamping ──

/// Clamps the input score to the strict physical bounds of [0.0, 10.0]
fn clamp_score(val: f64) -> f64 {
    val.clamp(0.0, 10.0)
}

// ── Input structures ──

#[derive(Deserialize)]
struct ScenarioInput {
    scores: ScoresInput,
    meme: MemeInput,
    field: FieldInput,
    env: EnvInput,
}

#[derive(Deserialize)]
struct ScoresInput {
    content_emotion_arousal: f64,
    social_currency_attr: f64,
    practical_value: f64,
    uniqueness: f64,
    innovation: f64,
    enhancement: f64,
    strangeness: f64,
    narrative_completeness: f64,
    remix_openness: f64,
    source_credibility: f64,
    personification: f64,
}

#[derive(Deserialize)]
struct MemeInput {
    social_currency: f64,
    share_cost: f64,
    audience_trust_base: f64,
    share_circle_preference: f64,
}

#[derive(Deserialize)]
struct FieldInput {
    t: usize,
    C_t: f64,
    R_t: f64,
    R_0: f64,
    mu_psych_t: f64,
    K_pot_t: f64,
    K_pot_0: f64,
    K_soil: f64,
    K_comp: f64,
    K_base: f64,
    A_algo: f64,
    T: f64,
    T_effective: f64,
    challengability_score: f64,
    circle_opposition: f64,
    social_currency_t: f64,
}

#[derive(Deserialize)]
struct EnvInput {
    surge_match: f64,
    current_direction: f64,
    terrain_passability: f64,
    population_density: f64,
    connectivity: f64,
    raw_suppression: f64,
    L_cognitive: f64,
    L_operational: f64,
    L_antipathy: f64,
    content_emotion_intensity: f64,
    audience_resonance_match: f64,
    environment_emotion_fit: f64,
}

// ── Output structures ──

#[derive(Serialize)]
struct ComputeResult {
    E: f64,
    K: f64,
    S: f64,
    R: f64,
    mu_psych: f64,
    omega: f64,
    q_triggered: bool,
    lambda_val: f64,
    lambda_eff: f64,
    G: f64,             // Active exposure output (G_active)
    G_std: f64,         // SRP standard exposure output (G_std)
    K_mult: f64,        // Dynamic environmental multiplier (K_mult)
    W: f64,
    growth_level: String,
    exposure_level: String,
    quadrant: String,
    willingness_level: String,
    field_next: FieldNext,
}

#[derive(Serialize)]
struct FieldNext {
    t: usize,
    C_t: f64,
    R_t: f64,
    mu_psych_t: f64,
    K_pot_t: f64,
    social_currency_t: f64,
}

// ── Conversions ──

impl From<ScoresInput> for SeedScores {
    fn from(inp: ScoresInput) -> Self {
        SeedScores {
            content_emotion_arousal: clamp_score(inp.content_emotion_arousal),
            social_currency_attr: clamp_score(inp.social_currency_attr),
            practical_value: clamp_score(inp.practical_value),
            uniqueness: clamp_score(inp.uniqueness),
            innovation: clamp_score(inp.innovation),
            enhancement: clamp_score(inp.enhancement),
            strangeness: clamp_score(inp.strangeness),
            narrative_completeness: clamp_score(inp.narrative_completeness),
            remix_openness: clamp_score(inp.remix_openness),
            source_credibility: clamp_score(inp.source_credibility),
            personification: clamp_score(inp.personification),
        }
    }
}

impl From<FieldInput> for FieldState {
    fn from(inp: FieldInput) -> Self {
        FieldState {
            t: inp.t,
            C_t: inp.C_t,
            R_t: inp.R_t,
            R_0: inp.R_0,
            mu_psych_t: inp.mu_psych_t,
            K_pot_t: inp.K_pot_t,
            K_pot_0: inp.K_pot_0,
            K_soil: inp.K_soil,
            K_comp: inp.K_comp,
            K_base: inp.K_base,
            A_algo: inp.A_algo,
            T: inp.T,
            T_effective: inp.T_effective,
            challengability_score: inp.challengability_score,
            circle_opposition: inp.circle_opposition,
            social_currency_t: inp.social_currency_t,
        }
    }
}

impl From<EnvInput> for EnvInputs {
    fn from(inp: EnvInput) -> Self {
        EnvInputs {
            surge_match: inp.surge_match,
            current_direction: inp.current_direction,
            terrain_passability: inp.terrain_passability,
            population_density: inp.population_density,
            connectivity: inp.connectivity,
            raw_suppression: inp.raw_suppression,
            L_cognitive: inp.L_cognitive,
            L_operational: inp.L_operational,
            L_antipathy: inp.L_antipathy,
            content_emotion_intensity: inp.content_emotion_intensity,
            audience_resonance_match: inp.audience_resonance_match,
            environment_emotion_fit: inp.environment_emotion_fit,
        }
    }
}

// ── Helper to build all parameters from config ──

fn build_from_config(config: &lasinfon_config::SystemConfig) -> (
    SeedWeights, KMappings, SWeights, RWeights, MuPsychWeights, TrustWeights,
    OmegaConfig, MappingOmega, WWeights, StateTransferParams,
) {
    let seed_w = SeedWeights {
        w_emotion_arousal: config.weights.seed.w_emotion_arousal,
        w_social_currency: config.weights.seed.w_social_currency,
        w_practical_value: config.weights.seed.w_practical_value,
        w_info_advantage: config.weights.seed.w_info_advantage,
        w_narrative_completeness: config.weights.seed.w_narrative_completeness,
        w_remix_openness: config.weights.seed.w_remix_openness,
        w_source_credibility: config.weights.seed.w_source_credibility,
        w_personification: config.weights.seed.w_personification,
    };
    let k_map = KMappings {
        k_pot: MappingKPot {
            base: config.mapping.K_pot.base,
            slope: config.mapping.K_pot.slope,
            w_surge: config.mapping.K_pot.w_surge,
            w_current: config.mapping.K_pot.w_current,
            w_terrain: config.mapping.K_pot.w_terrain,
        },
        k_soil: MappingKSoil {
            base: config.mapping.K_soil.base,
            slope: config.mapping.K_soil.slope,
            w_density: config.mapping.K_soil.w_density,
            w_connect: config.mapping.K_soil.w_connect,
        },
        k_comp: MappingKComp {
            base: config.mapping.K_comp.base,
            slope: config.mapping.K_comp.slope,
        },
    };
    let s_w = SWeights { w_cognitive: config.weights.S.w_cognitive, w_operational: config.weights.S.w_operational };
    let r_w = RWeights { w_content: config.weights.R.w_content, w_audience: config.weights.R.w_audience, w_environment: config.weights.R.w_environment };
    let mu_w = MuPsychWeights { w_antipathy: config.weights.mu_psych.w_antipathy, w_suspicion: config.weights.mu_psych.w_suspicion };
    let trust_w = TrustWeights { w_source: config.weights.trust.w_source, w_audience: config.weights.trust.w_audience };
    let omega_cfg = OmegaConfig { trigger_T: config.omega.trigger_T, trigger_R: config.omega.trigger_R, trigger_social_currency: config.omega.trigger_social_currency };
    let map_omega = MappingOmega { scale: config.mapping.omega.scale, denom: config.mapping.omega.denom };
    let w_w = WWeights { w_enhance: config.weights.W.w_enhance, w_trust: config.weights.W.w_trust, w_unique: config.weights.W.w_unique, w_R: config.weights.W.w_R };
    let st_params = StateTransferParams {
        eta: config.stochastic.eta,
        theta: config.stochastic.theta,
        lambda_C: config.state_transfer.lambda_C_relaxation,
        gamma_social_proof: config.state_transfer.gamma_social_proof,
        gamma_self_catalysis: config.state_transfer.gamma_self_catalysis,
        gamma_social_pressure: config.state_transfer.gamma_social_pressure,
        gamma_algo_trending: config.state_transfer.gamma_algo_trending,
        attention_decay: config.state_transfer.attention_decay,
        lambda_R_relaxation: config.state_transfer.lambda_R_relaxation,
        lambda_K_relaxation: config.state_transfer.lambda_K_relaxation,
    };
    (seed_w, k_map, s_w, r_w, mu_w, trust_w, omega_cfg, map_omega, w_w, st_params)
}

// ── Exported WASM functions ──

#[wasm_bindgen]
pub fn compute(config_json: &str, scenario_json: &str) -> Result<String, JsValue> {
    let config: lasinfon_config::SystemConfig = serde_json::from_str(config_json)
        .map_err(|e| JsValue::from_str(&format!("Invalid config JSON: {}", e)))?;
    let scenario: ScenarioInput = serde_json::from_str(scenario_json)
        .map_err(|e| JsValue::from_str(&format!("Invalid scenario JSON: {}", e)))?;

    let scores: SeedScores = scenario.scores.into();
    let field: FieldState = scenario.field.into();
    let env: EnvInputs = scenario.env.into();
    let meme = MemeEntity {
        E: 0.0, S: 0.0, // placeholder values, recomputed by pipeline
        social_currency: scenario.meme.social_currency,
        share_cost: scenario.meme.share_cost,
        audience_trust_base: scenario.meme.audience_trust_base,
        share_circle_preference: scenario.meme.share_circle_preference,
    };

    let (seed_w, k_map, s_w, r_w, mu_w, trust_w, omega_cfg, map_omega, w_w, st_params) =
        build_from_config(&config);

    let output: PipelineOutput = compute_full_pipeline(
        &scores, &meme, &field, &env,
        &seed_w, &k_map, &s_w, &r_w, &mu_w, &trust_w,
        &omega_cfg, &map_omega, &w_w,
        config.system.alpha, config.stochastic.gamma_saturation,
    );

    // ── Standard Reference Projection (SRP) Calculation ──
    // SRP represents a standard vacuum cavity where:
    // - Environmental gain K_std is forced to 1.0 (neutral conditions)
    // - Threat is zero, meaning standard Q-switch omega_std is 0.0
    // - Quantum fluctuation epsilon is 0.0 (baseline projection)
    let std_k = 1.0;
    let std_omega = 0.0;
    let std_epsilon = 0.0;

    let (_std_lambda_val, _std_lambda_eff, G_std) = compute_lambda_and_exposure(
        output.R,          // Keep resonance heat (intrinsic content-audience property)
        std_omega,         // Standard omega = 0.0
        output.mu_psych,   // Keep psychological friction (intrinsic content-audience property)
        std_epsilon,       // Standard epsilon = 0.0
        field.C_t,         // Keep active node ratio
        output.E,          // Keep computed seed potential
        std_k,             // Standard environment K = 1.0
        output.S,          // Keep physical conductance
        config.system.alpha,
        config.stochastic.gamma_saturation,
    );

    // ── Division-by-Zero Defense Guardrail (EPSILON protection) ──
    const EPSILON: f64 = 1e-5;
    let K_mult = if G_std < EPSILON {
        1.0
    } else {
        output.G / G_std
    };

    let exposure = ExposureResult {
        lambda_val: output.lambda_val,
        lambda_effective: output.lambda_eff,
        G: output.G,
    };
    let next_field = tick(&field, &exposure, output.E, &st_params);

    let result = ComputeResult {
        E: output.E,
        K: output.K,
        S: output.S,
        R: output.R,
        mu_psych: output.mu_psych,
        omega: output.omega,
        q_triggered: output.q_triggered,
        lambda_val: output.lambda_val,
        lambda_eff: output.lambda_eff,
        G: output.G,
        G_std,
        K_mult,
        W: output.W,
        growth_level: format!("{:?}", output.growth_level),
        exposure_level: format!("{:?}", output.exposure_level),
        quadrant: format!("{:?}", output.quadrant),
        willingness_level: format!("{:?}", output.willingness_level),
        field_next: FieldNext {
            t: next_field.t,
            C_t: next_field.C_t,
            R_t: next_field.R_t,
            mu_psych_t: next_field.mu_psych_t,
            K_pot_t: next_field.K_pot_t,
            social_currency_t: next_field.social_currency_t,
        },
    };

    serde_json::to_string_pretty(&result)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

#[wasm_bindgen]
pub fn simulate(
    config_json: &str,
    scenario_json: &str,
    max_ticks: usize,
    sigma: f64,
    seed: u64,
    stop_when_saturated: bool,
) -> Result<String, JsValue> {
    let config: lasinfon_config::SystemConfig = serde_json::from_str(config_json)
        .map_err(|e| JsValue::from_str(&format!("Invalid config JSON: {}", e)))?;
    let scenario: ScenarioInput = serde_json::from_str(scenario_json)
        .map_err(|e| JsValue::from_str(&format!("Invalid scenario JSON: {}", e)))?;

    let scores: SeedScores = scenario.scores.into();
    let field: FieldState = scenario.field.into();
    let env: EnvInputs = scenario.env.into();
    let meme = MemeEntity {
        E: 0.0, S: 0.0, // placeholder values
        social_currency: scenario.meme.social_currency,
        share_cost: scenario.meme.share_cost,
        audience_trust_base: scenario.meme.audience_trust_base,
        share_circle_preference: scenario.meme.share_circle_preference,
    };

    let (seed_w, k_map, s_w, r_w, mu_w, trust_w, omega_cfg, map_omega, w_w, st_params) =
        build_from_config(&config);

    let sim_cfg = SimulationConfig {
        max_ticks,
        sigma,
        stop_when_saturated,
        seed: Some(seed),
    };

    let records: Vec<StepRecord> = run_simulation(
        &scores, &meme, &field, &env,
        &seed_w, &k_map, &s_w, &r_w, &mu_w, &trust_w,
        &omega_cfg, &map_omega, &w_w,
        &st_params,
        config.system.alpha, config.stochastic.gamma_saturation,
        &sim_cfg,
    );

    serde_json::to_string_pretty(&records)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}
