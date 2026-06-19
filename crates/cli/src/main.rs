use lasinfon_core::types::*;
use lasinfon_core::formulas::pipeline::{compute_full_pipeline, PipelineOutput};
use lasinfon_state::state_transfer::{self, StateTransferParams};
use lasinfon_config::load_config;
use serde::Deserialize;
use serde::Serialize;
use std::fs;
use std::path::PathBuf;

// ---- CLI-specific input structures (mirrors core types, but Deserialize) ----

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
struct OutputData {
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

// ---- Conversion helpers ----

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

// ------- Main -------

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() != 5 || args[1] != "--config" || args[3] != "--input" {
        eprintln!("Usage: lasinfon --config <config.json> --input <input.json>");
        std::process::exit(1);
    }
    let config_path = PathBuf::from(&args[2]);
    let input_path = PathBuf::from(&args[4]);

    let config = load_config(&config_path)?;
    let input_json = fs::read_to_string(&input_path)?;
    let input: InputData = serde_json::from_str(&input_json)?;

    // Convert inputs to core types
    let scores: SeedScores = input.scores.into();
    let field: FieldState = input.field.into();
    let env: EnvInputs = input.env.into();

    let meme = MemeEntity {
        E: 0.5,
        S: 0.5,
        social_currency: input.meme.social_currency,
        share_cost: input.meme.share_cost,
        audience_trust_base: input.meme.audience_trust_base,
        share_circle_preference: input.meme.share_circle_preference,
    };

    // Decompose config
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

    let next_field = state_transfer::tick(&field, &exposure, output.E, &st_params);

    let output_data = OutputData {
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

    let json_out = serde_json::to_string_pretty(&output_data)?;
    println!("{}", json_out);

    Ok(())
}
