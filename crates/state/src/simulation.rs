use lasinfon_core::types::*;
use lasinfon_core::formulas::exponent_layer::compute_lambda_and_exposure;
use crate::state_transfer::{tick, StateTransferParams};
use rand::SeedableRng;
use rand_distr::{Distribution, Normal};
use libm::exp;
use serde::Serialize;

/// Record of a single time step in a simulation.
#[derive(Debug, Clone, Serialize)]
pub struct StepRecord {
    pub t: usize,
    pub C_t: f64,
    pub R_t: f64,
    pub mu_psych_t: f64,
    pub K_pot_t: f64,
    pub social_currency_t: f64,
    pub G: f64,                  // Active exposure output (G_active)
    pub G_std: f64,              // SRP standard exposure output (G_std)
    pub K_mult: f64,             // Dynamic environmental multiplier (K_mult)
    pub lambda_val: f64,
    pub lambda_eff: f64,
    pub W: f64,
    pub growth_level: String,
    pub exposure_level: String,
    pub quadrant: String,
    pub willingness_level: String,
}

/// Simulation configuration.
pub struct SimulationConfig {
    pub max_ticks: usize,
    pub sigma: f64,
    pub stop_when_saturated: bool,
    pub seed: Option<u64>,
}

impl Default for SimulationConfig {
    fn default() -> Self {
        Self {
            max_ticks: 50,
            sigma: 0.0,
            stop_when_saturated: true,
            seed: None,
        }
    }
}

/// Run a multi‑tick simulation from initial field state.
pub fn run_simulation(
    scores: &SeedScores,
    meme: &MemeEntity,
    initial_field: &FieldState,
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
    sim_cfg: &SimulationConfig,
) -> Vec<StepRecord> {
    let mut field: FieldState = initial_field.clone();
    let mut records = Vec::with_capacity(sim_cfg.max_ticks);
    let normal = Normal::new(0.0, sim_cfg.sigma).unwrap();
    let mut rng = if let Some(seed) = sim_cfg.seed {
        rand::rngs::StdRng::seed_from_u64(seed)
    } else {
        rand::rngs::StdRng::from_entropy()
    };

    for _ in 0..sim_cfg.max_ticks {
        let epsilon = if sim_cfg.sigma > 0.0 {
            normal.sample(&mut rng)
        } else {
            0.0
        };

        // Inline pipeline computation
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

        // ── Dynamic Parameter Sourcing for High-Fidelity Time Decay ──
        // On tick 0, calculate R and mu_psych from initial environments.
        // On subsequent ticks (t > 0), use the dynamically evolved, decayed/catalyzed R_t and mu_psych_t!
        let R = if field.t == initial_field.t {
            lasinfon_core::formulas::exponent_layer::compute_resonance_heat(
                env.content_emotion_intensity,
                env.audience_resonance_match,
                env.environment_emotion_fit,
                r_weights.w_content, r_weights.w_audience, r_weights.w_environment,
            )
        } else {
            field.R_t
        };

        let mu_psych = if field.t == initial_field.t {
            lasinfon_core::formulas::exponent_layer::compute_psych_friction(
                env.L_antipathy,
                scores.source_credibility,
                meme.audience_trust_base,
                mu_weights.w_antipathy, mu_weights.w_suspicion,
                trust_weights.w_source, trust_weights.w_audience,
            )
        } else {
            field.mu_psych_t
        };

        let (omega, K_niche_switched, q_triggered) = lasinfon_core::formulas::exponent_layer::detect_q_switch(
            field.T, R, meme.social_currency,
            field.challengability_score, field.circle_opposition,
            mapping_omega.scale, mapping_omega.denom,
            omega_cfg.trigger_T, omega_cfg.trigger_R, omega_cfg.trigger_social_currency,
        );
        let K_niche = if q_triggered { K_niche_switched } else {
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
            scores.enhancement, scores.source_credibility, meme.audience_trust_base,
            scores.uniqueness, R,
            w_weights.w_enhance, w_weights.w_trust, w_weights.w_unique, w_weights.w_R,
            trust_weights.w_source, trust_weights.w_audience,
        );

        // ── Calculate Standard Reference Projection (SRP) ──
        let std_k = 1.0;
        let std_omega = 0.0;
        let std_epsilon = 0.0;
        let (_std_lambda_val, _std_lambda_eff, G_std) = compute_lambda_and_exposure(
            R, std_omega, mu_psych, std_epsilon,
            field.C_t, E, std_k, S,
            alpha, gamma_sat,
        );

        // ── Division-by-Zero Defense Guardrail (EPSILON protection) ──
        const EPSILON: f64 = 1e-5;
        let K_mult = if G_std < EPSILON {
            1.0
        } else {
            G / G_std
        };

        let lambda = exp(lambda_val);
        records.push(StepRecord {
            t: field.t,
            C_t: field.C_t,
            R_t: R,
            mu_psych_t: mu_psych,
            K_pot_t: field.K_pot_t,
            social_currency_t: field.social_currency_t,
            G,
            G_std,
            K_mult,
            lambda_val,
            lambda_eff,
            W,
            growth_level: format!("{:?}", classify_growth(lambda)),
            exposure_level: format!("{:?}", classify_exposure(G)),
            quadrant: format!("{:?}", classify_quadrant(lambda, G)),
            willingness_level: format!("{:?}", classify_willingness(W)),
        });

        let exposure = ExposureResult { lambda_val, lambda_effective: lambda_eff, G };
        field = tick(&field, &exposure, E, st_params);

        if sim_cfg.stop_when_saturated && lambda_eff < 1.0 {
            break;
        }
    }
    records
}

fn classify_growth(lambda: f64) -> GrowthLevel {
    let e = core::f64::consts::E;
    if lambda < 1.0 { GrowthLevel::Decay }
    else if (lambda - 1.0).abs() < 1e-12 { GrowthLevel::Steady }
    else if lambda <= e { GrowthLevel::Weak }
    else if lambda <= e * e { GrowthLevel::Strong }
    else { GrowthLevel::Explosive }
}

fn classify_exposure(g: f64) -> ExposureLevel {
    if g < 1.0 { ExposureLevel::Trace }
    else if g < 10.0 { ExposureLevel::Circle }
    else if g < 100.0 { ExposureLevel::CrossCircle }
    else if g < 1000.0 { ExposureLevel::Phenomenal }
    else { ExposureLevel::Global }
}

fn classify_quadrant(lambda: f64, g: f64) -> Quadrant {
    if lambda > 1.0 && g >= 1.0 { Quadrant::TrueSelfGrowth }
    else if lambda <= 1.0 && g >= 1.0 { Quadrant::PseudoSelfGrowth }
    else if lambda > 1.0 && g < 1.0 { Quadrant::Choked }
    else { Quadrant::Decay }
}

fn classify_willingness(w: f64) -> WillingnessLevel {
    if w < 3.0 { WillingnessLevel::Low }
    else if w < 6.0 { WillingnessLevel::Medium }
    else if w < 9.0 { WillingnessLevel::High }
    else { WillingnessLevel::VeryHigh }
}
