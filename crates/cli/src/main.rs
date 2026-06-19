#![allow(non_snake_case)]

mod input_types;
mod output_types;
mod builders;

use input_types::load_and_merge_inputs;
use output_types::{RunOutput, SimulateOutput, FieldNext};
use builders::*;
use lasinfon_core::types::*;
use lasinfon_core::formulas::pipeline::{compute_full_pipeline, PipelineOutput};
use lasinfon_state::state_transfer::{self, StateTransferParams};
use lasinfon_state::simulation::{run_simulation, SimulationConfig};
use lasinfon_config::{load_merged_configs, validate_config};
use std::path::PathBuf;

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
    for w in validate_config(&config) {
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

    let (seed_w, k_map, s_w, r_w, mu_w, trust_w, omega_cfg, map_omega, w_w, st_params) =
        build_all_params(&config);

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

    let result = RunOutput {
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
    println!("{}", serde_json::to_string_pretty(&result)?);
    Ok(())
}

fn simulate_command(args: &[String]) -> Result<(), Box<dyn std::error::Error>> {
    let config_paths: Vec<PathBuf> = parse_multiple(args, "--config").into_iter().map(PathBuf::from).collect();
    let input_paths: Vec<PathBuf> = parse_multiple(args, "--input").into_iter().map(PathBuf::from).collect();
    if config_paths.is_empty() || input_paths.is_empty() {
        eprintln!("simulate requires at least one --config and one --input");
        std::process::exit(1);
    }

    let max_ticks: usize = parse_multiple(args, "--max-ticks").first().map(|s| s.parse().unwrap_or(50)).unwrap_or(50);
    let sigma: f64 = parse_multiple(args, "--sigma").first().map(|s| s.parse().unwrap_or(0.0)).unwrap_or(0.0);
    let seed: Option<u64> = parse_multiple(args, "--seed").first().map(|s| s.parse().ok()).flatten();
    let stop_when_saturated: bool = parse_multiple(args, "--stop-saturated").first().map(|s| s == "true" || s == "1").unwrap_or(true);

    let config = load_merged_configs(&config_paths)?;
    for w in validate_config(&config) {
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

    let (seed_w, k_map, s_w, r_w, mu_w, trust_w, omega_cfg, map_omega, w_w, st_params) =
        build_all_params(&config);

    let sim_cfg = SimulationConfig { max_ticks, sigma, stop_when_saturated, seed };

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

/// Bundle builder calls to reduce repetition.
fn build_all_params(config: &lasinfon_config::SystemConfig) -> (
    SeedWeights, KMappings, SWeights, RWeights, MuPsychWeights, TrustWeights,
    OmegaConfig, MappingOmega, WWeights, StateTransferParams,
) {
    (
        build_seed_weights(&config.weights),
        build_k_mappings(&config.mapping),
        build_s_weights(&config.weights.S),
        build_r_weights(&config.weights.R),
        build_mu_weights(&config.weights.mu_psych),
        build_trust_weights(&config.weights.trust),
        build_omega_cfg(&config.omega),
        build_mapping_omega(&config.mapping.omega),
        build_w_weights(&config.weights.W),
        build_state_params(config),
    )
}
