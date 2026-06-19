#![allow(non_snake_case)]
#![allow(dead_code)]

use lasinfon_core::types::*;
use lasinfon_state::state_transfer::{tick, StateTransferParams};
use rand::Rng;
use rand_distr::{Distribution, Normal};
use rayon::prelude::*;
use serde::Serialize;

/// Generate quantum noise ε ~ N(0, σ²)
pub fn generate_quantum_noise(sigma: f64, rng: &mut impl Rng) -> f64 {
    if sigma <= 0.0 {
        0.0
    } else {
        let normal = Normal::new(0.0, sigma).unwrap();
        normal.sample(rng)
    }
}

/// Result of a single forecast path
#[derive(Debug, Clone, Serialize)]
pub struct ForecastResult {
    pub lambda_val: f64,
    pub lambda_eff: f64,
    pub G: f64,
    pub W: f64,
    pub growth_level: String,
    pub exposure_level: String,
    pub quadrant: String,
    pub willingness_level: String,
    pub C_final: f64,
    pub R_final: f64,
}

/// Run an ensemble of N paths, each with random noise ε.
pub fn run_ensemble_forecast(
    scores: &SeedScores,
    meme: &MemeEntity,
    field: &FieldState,
    env: &EnvInputs,
    seed_weights: &SeedWeights,
    k_mappings: &KMappings,
    s_weights: &SWeights,
    r_weights: &RWeights,
    mu_weights: &MuPsychWeights,
    trust_weights: &TrustWeights,
    omega_cfg: &OmegaConfig,
    mapping_omega: &MappingOmega,
    w_weights: &WWeights,
    st_params: &StateTransferParams,
    alpha: f64,
    gamma_sat: f64,
    sigma: f64,
    runs: usize,
) -> Vec<ForecastResult> {
    (0..runs)
        .into_par_iter()
        .map_init(
            || rand::thread_rng(),
            |rng, _| {
                let epsilon = generate_quantum_noise(sigma, rng);

                let E = lasinfon_core::formulas::seed_layer::compute_seed_potential(scores, seed_weights);
                let info_advantage = lasinfon_core::formulas::seed_layer::compute_info_advantage(
                    scores.uniqueness, scores.innovation, scores.enhancement, scores.strangeness,
                );

                let K_pot = lasinfon_core::formulas::base_layer::compute_K_pot(
                    env.surge_match, env.current_direction, env.terrain_passability,
                    k_mappings.k_pot.base, k_mappings.k_pot.slope,
                    k_mappings.k_pot.w_surge, k_mappings.k_pot.w_current, k_mappings.k_pot.w_terrain,
                );
                let K_soil = lasinfon_core::formulas::base_layer::compute_K_soil(
                    env.population_density, env.connectivity,
                    k_mappings.k_soil.base, k_mappings.k_soil.slope,
                    k_mappings.k_soil.w_density, k_mappings.k_soil.w_connect,
                );
                let K_comp = lasinfon_core::formulas::base_layer::compute_K_comp(
                    env.raw_suppression, info_advantage,
                    k_mappings.k_comp.base, k_mappings.k_comp.slope,
                );

                let S = lasinfon_core::formulas::base_layer::compute_structural_conductance(
                    env.L_cognitive, env.L_operational,
                    s_weights.w_cognitive, s_weights.w_operational,
                );

                let R = lasinfon_core::formulas::exponent_layer::compute_resonance_heat(
                    env.content_emotion_intensity,
                    env.audience_resonance_match,
                    env.environment_emotion_fit,
                    r_weights.w_content,
                    r_weights.w_audience,
                    r_weights.w_environment,
                );

                let mu_psych = lasinfon_core::formulas::exponent_layer::compute_psych_friction(
                    env.L_antipathy,
                    scores.source_credibility,
                    meme.audience_trust_base,
                    mu_weights.w_antipathy,
                    mu_weights.w_suspicion,
                    trust_weights.w_source,
                    trust_weights.w_audience,
                );

                let (omega, K_niche_switched, q_triggered) = lasinfon_core::formulas::exponent_layer::detect_q_switch(
                    field.T,
                    R,
                    meme.social_currency,
                    field.challengability_score,
                    field.circle_opposition,
                    mapping_omega.scale,
                    mapping_omega.denom,
                    omega_cfg.trigger_T,
                    omega_cfg.trigger_R,
                    omega_cfg.trigger_social_currency,
                );

                let K_niche = if q_triggered {
                    K_niche_switched
                } else {
                    lasinfon_core::formulas::niche_layer::compute_niche(field.T_effective, false)
                };

                let K_base = K_pot * K_soil * K_comp * K_niche;
                let K = K_base * field.A_algo;

                let (lambda_val, lambda_eff, G) = lasinfon_core::formulas::exponent_layer::compute_lambda_and_exposure(
                    R, omega, mu_psych, epsilon,
                    field.C_t, E, K, S,
                    alpha, gamma_sat,
                );

                let W = lasinfon_core::formulas::willingness::compute_willingness_pay(
                    scores.enhancement,
                    scores.source_credibility,
                    meme.audience_trust_base,
                    scores.uniqueness,
                    R,
                    w_weights.w_enhance,
                    w_weights.w_trust,
                    w_weights.w_unique,
                    w_weights.w_R,
                    trust_weights.w_source,
                    trust_weights.w_audience,
                );

                let exposure = ExposureResult { lambda_val, lambda_effective: lambda_eff, G };
                let next_field = tick(field, &exposure, E, st_params);

                let lambda = (lambda_val).exp();
                let growth = classify_growth(lambda);
                let exposure_level = classify_exposure(G);
                let quadrant = classify_quadrant(lambda, G);
                let willingness = classify_willingness(W);

                ForecastResult {
                    lambda_val,
                    lambda_eff,
                    G,
                    W,
                    growth_level: format!("{:?}", growth),
                    exposure_level: format!("{:?}", exposure_level),
                    quadrant: format!("{:?}", quadrant),
                    willingness_level: format!("{:?}", willingness),
                    C_final: next_field.C_t,
                    R_final: next_field.R_t,
                }
            },
        )
        .collect()
}

// Classification helpers (copy from pipeline.rs)
fn classify_growth(lambda: f64) -> GrowthLevel {
    let e = core::f64::consts::E;
    if lambda < 1.0 {
        GrowthLevel::Decay
    } else if (lambda - 1.0).abs() < 1e-12 {
        GrowthLevel::Steady
    } else if lambda <= e {
        GrowthLevel::Weak
    } else if lambda <= e * e {
        GrowthLevel::Strong
    } else {
        GrowthLevel::Explosive
    }
}

fn classify_exposure(g: f64) -> ExposureLevel {
    if g < 1.0 {
        ExposureLevel::Trace
    } else if g < 10.0 {
        ExposureLevel::Circle
    } else if g < 100.0 {
        ExposureLevel::CrossCircle
    } else if g < 1000.0 {
        ExposureLevel::Phenomenal
    } else {
        ExposureLevel::Global
    }
}

fn classify_quadrant(lambda: f64, g: f64) -> Quadrant {
    if lambda > 1.0 && g >= 1.0 {
        Quadrant::TrueSelfGrowth
    } else if lambda <= 1.0 && g >= 1.0 {
        Quadrant::PseudoSelfGrowth
    } else if lambda > 1.0 && g < 1.0 {
        Quadrant::Choked
    } else {
        Quadrant::Decay
    }
}

fn classify_willingness(w: f64) -> WillingnessLevel {
    if w < 3.0 {
        WillingnessLevel::Low
    } else if w < 6.0 {
        WillingnessLevel::Medium
    } else if w < 9.0 {
        WillingnessLevel::High
    } else {
        WillingnessLevel::VeryHigh
    }
}

/// Statistical summary of a set of forecast results.
pub struct DistributionStats {
    pub mean_G: f64,
    pub std_G: f64,
    pub mean_lambda_eff: f64,
    pub percentiles_G: Percentiles,
    pub percentiles_lambda_eff: Percentiles,
    pub quadrant_counts: std::collections::HashMap<String, usize>,
}

#[derive(Debug, Clone)]
pub struct Percentiles {
    pub p5: f64,
    pub p25: f64,
    pub median: f64,
    pub p75: f64,
    pub p95: f64,
}

pub fn compute_distribution(results: &[ForecastResult]) -> DistributionStats {
    let n = results.len() as f64;
    if n == 0.0 {
        return DistributionStats {
            mean_G: 0.0, std_G: 0.0, mean_lambda_eff: 0.0,
            percentiles_G: Percentiles { p5: 0.0, p25: 0.0, median: 0.0, p75: 0.0, p95: 0.0 },
            percentiles_lambda_eff: Percentiles { p5: 0.0, p25: 0.0, median: 0.0, p75: 0.0, p95: 0.0 },
            quadrant_counts: std::collections::HashMap::new(),
        };
    }
    let mean_G = results.iter().map(|r| r.G).sum::<f64>() / n;
    let variance_G = results.iter().map(|r| (r.G - mean_G).powi(2)).sum::<f64>() / n;
    let std_G = variance_G.sqrt();
    let mean_lambda_eff = results.iter().map(|r| r.lambda_eff).sum::<f64>() / n;

    let mut g_vals: Vec<f64> = results.iter().map(|r| r.G).collect();
    g_vals.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let perc_G = compute_percentiles(&g_vals);

    let mut lam_vals: Vec<f64> = results.iter().map(|r| r.lambda_eff).collect();
    lam_vals.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let perc_lam = compute_percentiles(&lam_vals);

    let mut quadrant_counts = std::collections::HashMap::new();
    for res in results {
        *quadrant_counts.entry(res.quadrant.clone()).or_insert(0) += 1;
    }

    DistributionStats {
        mean_G,
        std_G,
        mean_lambda_eff,
        percentiles_G: perc_G,
        percentiles_lambda_eff: perc_lam,
        quadrant_counts,
    }
}

fn compute_percentiles(sorted: &[f64]) -> Percentiles {
    let n = sorted.len();
    if n == 0 {
        return Percentiles { p5: 0.0, p25: 0.0, median: 0.0, p75: 0.0, p95: 0.0 };
    }
    let idx = |p: f64| ((p / 100.0) * (n - 1) as f64).round() as usize;
    Percentiles {
        p5: sorted[idx(5.0)],
        p25: sorted[idx(25.0)],
        median: sorted[idx(50.0)],
        p75: sorted[idx(75.0)],
        p95: sorted[idx(95.0)],
    }
}
