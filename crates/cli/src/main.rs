#![allow(non_snake_case)]

use lasinfon_core::types::*;
use lasinfon_core::formulas::pipeline::{compute_full_pipeline, PipelineOutput};
use lasinfon_state::state_transfer::{self, StateTransferParams};
use lasinfon_state::simulation::{run_simulation, SimulationConfig, StepRecord};
use lasinfon_config::{load_merged_configs, validate_config};
use serde::Deserialize;
use serde::Serialize;
use serde_json::Value;
use std::fs;
use std::path::PathBuf;

// ---- CLI-specific input structures ----

#[derive(Debug, Deserialize)]
struct InputData {
    scores: ScoresInput,
    meme: MemeInput,
    field: FieldInput,
    env: EnvInput,
}

#[derive(Debug, Deserialize)]
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

#[derive(Debug, Deserialize)]
struct MemeInput {
    social_currency: f64,
    share_cost: f64,
    audience_trust_base: f64,
    share_circle_preference: f64,
}

#[derive(Debug, Deserialize)]
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

#[derive(Debug, Deserialize)]
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

// ---- Output structures ----

#[derive(Debug, Serialize)]
struct RunOutput {
    E: f64,
    K: f64,
    S: f64,
    R: f64,
    mu_psych: f64,
    omega: f64,
    q_triggered: bool,
    lambda_val: f64,
    lambda_eff: f64,
    G: f64,
    W: f64,
    growth_level: String,
    exposure_level: String,
    quadrant: String,
    willingness_level: String,
    field_next: FieldNext,
}

#[derive(Debug, Serialize)]
struct FieldNext {
    t: usize,
    C_t: f64,
    R_t: f64,
    mu_psych_t: f64,
    K_pot_t: f64,
    social_currency_t: f64,
}

#[derive(Debug, Serialize)]
struct SimulateOutput {
    records: Vec<StepRecord>,
}

// ---- Conversions ----

impl From<ScoresInput> for SeedScores {
    fn from(inp: ScoresInput) -> Self {
        SeedScores {
            content_emotion_arousal: inp.content_emotion_arousal,
            social_currency_attr: inp.social_currency_attr,
            practical_value: inp.practical_value,
            uniqueness: inp.uniqueness,
            innovation: inp.innovation,
            enhancement: inp.enhancement,
            strangeness: inp.strangeness,
            narrative_completeness: inp.narrative_completeness,
            remix_openness: inp.remix_openness,
            source_credibility: inp.source_credibility,
            personification: inp.personification,
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

// ---- Configuration helpers ----

fn build_seed_weights(config: &lasinfon_config::WeightsConfig) -> SeedWeights {
    SeedWeights {
        w_emotion_arousal: config.seed.w_emotion_arousal,
        w_social_currency: config.seed.w_social_currency,
        w_practical_value: config.seed.w_practical_value,
        w_info_advantage: config.seed.w_info_advantage,
        w_narrative_completeness: config.seed.w_narrative_completeness,
        w_remix_openness: config.seed.w_remix_openness,
        w_source_credibility: config.seed.w_source_credibility,
        w_personification: config.seed.w_personification,
    }
}

fn build_k_mappings(config: &lasinfon_config::MappingConfig) -> KMappings {
    KMappings {
        k_pot: MappingKPot {
            base: config.K_pot.base,
            slope: config.K_pot.slope,
            w_surge: config.K_pot.w_surge,
            w_current: config.K_pot.w_current,
            w_terrain: config.K_pot.w_terrain,
        },
        k_soil: MappingKSoil {
            base: config.K_soil.base,
            slope: config.K_soil.slope,
            w_density: config.K_soil.w_density,
            w_connect: config.K_soil.w_connect,
        },
        k_comp: MappingKComp {
            base: config.K_comp.base,
            slope: config.K_comp.slope,
        },
    }
}

fn build_s_weights(config: &lasinfon_config::SWeights) -> SWeights {
    SWeights { w_cognitive: config.w_cognitive, w_operational: config.w_operational }
}

fn build_r_weights(config: &lasinfon_config::RWeights) -> RWeights {
    RWeights { w_content: config.w_content, w_audience: config.w_audience, w_environment: config.w_environment }
}

fn build_mu_weights(config: &lasinfon_config::MuPsychWeights) -> MuPsychWeights {
    MuPsychWeights { w_antipathy: config.w_antipathy, w_suspicion: config.w_suspicion }
}

fn build_trust_weights(config: &lasinfon_config::TrustWeights) -> TrustWeights {
    TrustWeights { w_source: config.w_source, w_audience: config.w_audience }
}

fn build_omega_cfg(config: &lasinfon_config::OmegaConfig) -> OmegaConfig {
    OmegaConfig { trigger_T: config.trigger_T, trigger_R: config.trigger_R, trigger_social_currency: config.trigger_social_currency }
}

fn build_mapping_omega(config: &lasinfon_config::MappingOmega) -> MappingOmega {
    MappingOmega { scale: config.scale, denom: config.denom }
}

fn build_w_weights(config: &lasinfon_config::WWeights) -> WWeights {
    WWeights { w_enhance: config.w_enhance, w_trust: config.w_trust, w_unique: config.w_unique, w_R: config.w_R }
}

fn build_state_params(config: &lasinfon_config::SystemConfig) -> StateTransferParams {
    StateTransferParams {
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
    }
}

// ---- Input merging ----

/// Load and merge multiple input JSON files into a single InputData.
fn load_and_merge_inputs(paths: &[PathBuf]) -> Result<InputData, Box<dyn std::error::Error>> {
    use lasinfon_config::merge::merge_json_values;
    let mut merged: Option<Value> = None;
    for path in paths {
        let content = fs::read_to_string(path)?;
        let val: Value = serde_json::from_str(&content)?;
        match merged.as_mut() {
            Some(base) => merge_json_values(base, &val),
            None => merged = Some(val),
        }
    }
    let final_val = merged.ok_or("At least one input file is required")?;
    let input: InputData = serde_json::from_value(final_val)?;
    Ok(input)
}

// ---- Main ----

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: lasinfon <run|simulate> [--config <file>...] [--input <file>...] [options]");
        std::process::exit(1);
    }
    let command = &args[1];
    let remaining = &args[2..];

    match command.as_str() {
        "run" => run_command(remaining),
        "simulate" => simulate_command(remaining),
        _ => {
            eprintln!("Unknown command: {command}. Use 'run' or 'simulate'.");
            std::process::exit(1);
        }
    }
}

fn parse_multiple(args: &[String], key: &str) -> Vec<String> {
    let mut values = Vec::new();
    let mut i = 0;
    while i < args.len() {
        if args[i] == key && i + 1 < args.len() {
            values.push(args[i + 1].clone());
            i += 1;
        }
        i += 1;
    }
    values
}

fn run_command(args: &[String]) -> Result<(), Box<dyn std::error::Error>> {
    let config_paths: Vec<PathBuf> = parse_multiple(args, "--config").into_iter().map(PathBuf::from).collect();
    let input_paths: Vec<PathBuf> = parse_multiple(args, "--input").into_iter().map(PathBuf::from).collect();

    if config_paths.is_empty() || input_paths.is_empty() {
        eprintln!("run requires at least one --config and one --input");
        std::process::exit(1);
    }

    let config = load_merged_configs(&config_paths)?;
    let warnings = validate_config(&config);
    for w in warnings {
        eprintln!("[WARN] {}", w);
    }

    let input = load_and_merge_inputs(&input_paths)?;

    let scores: SeedScores = input.scores.into();
    let field: FieldState = input.field.into();
    let env: EnvInputs = input.env.into();
    let meme = MemeEntity {
        E: 0.5, S: 0.5,
        social_currency: input.meme.social_currency,
        share_cost: input.meme.share_cost,
        audience_trust_base: input.meme.audience_trust_base,
        share_circle_preference: input.meme.share_circle_preference,
    };

    let seed_w = build_seed_weights(&config.weights);
    let k_map = build_k_mappings(&config.mapping);
    let s_w = build_s_weights(&config.weights.S);
    let r_w = build_r_weights(&config.weights.R);
    let mu_w = build_mu_weights(&config.weights.mu_psych);
    let trust_w = build_trust_weights(&config.weights.trust);
    let omega_cfg = build_omega_cfg(&config.omega);
    let map_omega = build_mapping_omega(&config.mapping.omega);
    let w_w = build_w_weights(&config.weights.W);
    let st_params = build_state_params(&config);

    let output: PipelineOutput = compute_full_pipeline(
        &scores, &meme, &field, &env,
        &seed_w, &k_map, &s_w, &r_w, &mu_w, &trust_w,
        &omega_cfg, &map_omega, &w_w,
        config.system.alpha, config.stochastic.gamma_saturation,
    );

    let exposure = ExposureResult {
        lambda_val: output.lambda_val,
        lambda_effective: output.lambda_eff,
        G: output.G,
    };

    let next_field = state_transfer::tick(&field, &exposure, output.E, &st_params);

    let output_data = RunOutput {
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

    println!("{}", serde_json::to_string_pretty(&output_data)?);
    Ok(())
}

fn simulate_command(args: &[String]) -> Result<(), Box<dyn std::error::Error>> {
    let config_paths: Vec<PathBuf> = parse_multiple(args, "--config").into_iter().map(PathBuf::from).collect();
    let input_paths: Vec<PathBuf> = parse_multiple(args, "--input").into_iter().map(PathBuf::from).collect();

    if config_paths.is_empty() || input_paths.is_empty() {
        eprintln!("simulate requires at least one --config and one --input");
        std::process::exit(1);
    }

    let max_ticks: usize = parse_multiple(args, "--max-ticks")
        .first()
        .map(|s| s.parse().unwrap_or(50))
        .unwrap_or(50);
    let sigma: f64 = parse_multiple(args, "--sigma")
        .first()
        .map(|s| s.parse().unwrap_or(0.0))
        .unwrap_or(0.0);
    let seed: Option<u64> = parse_multiple(args, "--seed")
        .first()
        .map(|s| s.parse().ok())
        .flatten();
    let stop_when_saturated: bool = parse_multiple(args, "--stop-saturated")
        .first()
        .map(|s| s == "true" || s == "1")
        .unwrap_or(true);

    let config = load_merged_configs(&config_paths)?;
    let warnings = validate_config(&config);
    for w in warnings {
        eprintln!("[WARN] {}", w);
    }

    let input = load_and_merge_inputs(&input_paths)?;

    let scores: SeedScores = input.scores.into();
    let field: FieldState = input.field.into();
    let env: EnvInputs = input.env.into();
    let meme = MemeEntity {
        E: 0.5, S: 0.5,
        social_currency: input.meme.social_currency,
        share_cost: input.meme.share_cost,
        audience_trust_base: input.meme.audience_trust_base,
        share_circle_preference: input.meme.share_circle_preference,
    };

    let seed_w = build_seed_weights(&config.weights);
    let k_map = build_k_mappings(&config.mapping);
    let s_w = build_s_weights(&config.weights.S);
    let r_w = build_r_weights(&config.weights.R);
    let mu_w = build_mu_weights(&config.weights.mu_psych);
    let trust_w = build_trust_weights(&config.weights.trust);
    let omega_cfg = build_omega_cfg(&config.omega);
    let map_omega = build_mapping_omega(&config.mapping.omega);
    let w_w = build_w_weights(&config.weights.W);
    let st_params = build_state_params(&config);

    let sim_cfg = SimulationConfig {
        max_ticks,
        sigma,
        stop_when_saturated,
        seed,
    };

    let records = run_simulation(
        &scores, &meme, &field, &env,
        &seed_w, &k_map, &s_w, &r_w, &mu_w, &trust_w,
        &omega_cfg, &map_omega, &w_w,
        &st_params,
        config.system.alpha, config.stochastic.gamma_saturation,
        &sim_cfg,
    );

    let output = SimulateOutput { records };
    println!("{}", serde_json::to_string_pretty(&output)?);
    Ok(())
}
