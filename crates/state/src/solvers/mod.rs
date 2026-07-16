pub mod standard;
pub mod active;
pub mod cascade;
pub mod emergence;

use lasinfon_core::types::*;
use crate::state_transfer::{tick, StateTransferParams};
use crate::metrics::derived::{calculate_confrontation_gain, calculate_remix_amplification};
use rand::SeedableRng;
use rand_distr::{Distribution, Normal};

/// Maximum saturation cap for emergent public opinion phase transitions.
/// Bounded at 10.0 to prevent non-linear exponential explosion of G in high-tension channels.
pub const EMERGENCE_SATURATION_CAP: f64 = 10.0;

/// Shared internal simulation loop to prevent code duplication across Active and Emergence solvers.
/// Conforms strictly to DRY (Don't Repeat Yourself) engineering standards.
pub(crate) fn run_active_loop_internal(
    scores: &SeedScores,
    meme: &MemeEntity,
    initial_field: &FieldState,
    env: &EnvInputs,
    seed_weights: &SeedWeights,
    s_weights: &SWeights,
    r_weights: &RWeights,
    mu_weights: &MuPsychWeights,
    trust_weights: &TrustWeights,
    omega_cfg: &OmegaConfig,
    mapping_omega: &MappingOmega,
    K_env: f64, // Pre-aggregated static environment: K_pot * K_soil * K_comp [5]
    st_params: &StateTransferParams,
    alpha: f64,
    gamma_sat: f64,
    max_ticks: usize,
    sigma: f64,
    seed: Option<u64>,
    enable_emergence: bool, // Toggle flag for applying dynamic confrontation & remix emergence
) -> Vec<ExposureResult> {
    let mut field = initial_field.clone();
    let mut results = Vec::with_capacity(max_ticks);
    let normal = Normal::new(0.0, sigma).unwrap();
    let mut rng = if let Some(s) = seed {
        rand::rngs::StdRng::seed_from_u64(s)
    } else {
        rand::rngs::StdRng::from_entropy()
    };

    let E = lasinfon_core::formulas::seed_layer::compute_seed_potential(scores, seed_weights);
    let S = lasinfon_core::formulas::base_layer::compute_structural_conductance(
        env.L_cognitive, env.L_operational,
        s_weights.w_cognitive, s_weights.w_operational,
    );

    // Pre-calculate static E_remix outside the loop (optimized performance) [5]
    let e_remix = if enable_emergence {
        calculate_remix_amplification(scores.remix_openness)
    } else {
        1.0
    };

    for _ in 0..max_ticks {
        let epsilon = if sigma > 0.0 {
            normal.sample(&mut rng)
        } else {
            0.0
        };

        // Evolve resonance and friction dynamically over time steps
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

        // Dynamic environment gain multiplication (K = K_env * K_niche * A_algo)
        let K = K_env * K_niche * field.A_algo;

        let (lambda_val, lambda_eff, mut G) = lasinfon_core::formulas::exponent_layer::compute_lambda_and_exposure(
            R, omega, mu_psych, epsilon,
            field.C_t, E, K, S,
            alpha, gamma_sat,
        );

        // Apply emergent phase-transition modifiers if enabled [5]
        if enable_emergence {
            // Inputs are safely clamped within calculate_confrontation_gain to prevent overflow
            let g_conf = calculate_confrontation_gain(field.circle_opposition, env.L_antipathy, R);
            let multiplier = (g_conf * e_remix).min(EMERGENCE_SATURATION_CAP);
            G *= multiplier;
        }

        results.push(ExposureResult { lambda_val, lambda_effective: lambda_eff, G });

        let exposure = ExposureResult { lambda_val, lambda_effective: lambda_eff, G };
        field = tick(&field, &exposure, E, st_params);
    }

    results
}
