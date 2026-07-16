use lasinfon_core::types::*;
use crate::state_transfer::{tick, StateTransferParams};

/**
 * Standard Metrology Reference Solver (Track 1).
 * Simulates content propagation under standard reference conditions (K_env = 1.0, A_algo = 1.0).
 * Serves as the absolute, non-decaying "vacuum ruler" to measure core content potential (G_std).
 */
pub fn run_standard_solver(
    scores: &SeedScores,
    meme: &MemeEntity,
    initial_field: &FieldState,
    env: &EnvInputs,
    seed_weights: &SeedWeights,
    s_weights: &SWeights,
    r_weights: &RWeights,
    mu_weights: &MuPsychWeights,
    trust_weights: &TrustWeights,
    alpha: f64,
    gamma_sat: f64,
    max_ticks: usize,
) -> Vec<ExposureResult> {
    let mut field = initial_field.clone();
    let mut results = Vec::with_capacity(max_ticks);

    let E = lasinfon_core::formulas::seed_layer::compute_seed_potential(scores, seed_weights);
    let S = lasinfon_core::formulas::base_layer::compute_structural_conductance(
        env.L_cognitive, env.L_operational,
        s_weights.w_cognitive, s_weights.w_operational,
    );
    
    // Hard lock standard baseline environment vector (Vacuum Reference)
    let std_k = 1.0;
    let std_omega = 0.0;
    let std_epsilon = 0.0;

    // Standard transfer parameters (no attention decay to keep the ruler stable)
    let std_params = StateTransferParams {
        eta: 0.3,
        theta: 0.01,
        lambda_C: 0.3,
        gamma_social_proof: 0.5,
        gamma_self_catalysis: 0.1,
        gamma_social_pressure: 0.3,
        gamma_algo_trending: 0.05,
        attention_decay: 0.0, // Forced 0.0 decay for standard baseline
        lambda_R_relaxation: 0.1,
        lambda_K_relaxation: 0.1,
    };

    for _ in 0..max_ticks {
        // Evaluate initial R and mu_psych dynamically from the start, then evolve
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

        let (lambda_val, lambda_eff, G) = lasinfon_core::formulas::exponent_layer::compute_lambda_and_exposure(
            R, std_omega, mu_psych, std_epsilon,
            field.C_t, E, std_k, S,
            alpha, gamma_sat,
        );

        results.push(ExposureResult { lambda_val, lambda_effective: lambda_eff, G });

        let exposure = ExposureResult { lambda_val, lambda_effective: lambda_eff, G };
        field = tick(&field, &exposure, E, &std_params);
    }

    results
}
