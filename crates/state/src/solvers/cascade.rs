use lasinfon_core::types::*;
use crate::state_transfer::{tick, StateTransferParams};
use libm::exp;

/**
 * Sequential/Cascaded campaign solver (Track 4).
 * Runs continuous-wave state transfer where subsequent episodes inherit decayed states from prior runs.
 * Incorporates Hook Potential threshold barriers and recursive innovation baseline fatigue.
 */
pub fn run_cascade_solver(
    episodes: &[(&SeedScores, f64)], // Slice of tuples: (&SeedScores, coherence_score kappa)
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
    K_env_static: f64,
    st_params: &StateTransferParams,
    alpha: f64,
    gamma_sat: f64,
    max_ticks_per_episode: usize,
    eta_retention: f64,      // Fan retention multiplier (e.g., 0.85)
    delta_T: f64,            // Release interval (e.g. 7.0 days)
    k_fatigue: f64,          // Fatigue coefficient (e.g. 0.3)
) -> Vec<Vec<ExposureResult>> {
    let mut current_field = initial_field.clone();
    let mut all_results = Vec::with_capacity(episodes.len());
    let mut last_innovation_baseline = 0.0;

    for (n, (scores, kappa_coherence)) in episodes.iter().enumerate() {
        // ── 1. Create independent step transfer parameters ──
        let mut active_st_params = StateTransferParams {
            eta: st_params.eta,
            theta: st_params.theta, // Spontaneous initial luring / theta_spontaneous [5]
            lambda_C: st_params.lambda_C,
            gamma_social_proof: st_params.gamma_social_proof,
            gamma_self_catalysis: st_params.gamma_self_catalysis,
            gamma_social_pressure: st_params.gamma_social_pressure,
            gamma_algo_trending: st_params.gamma_algo_trending,
            attention_decay: st_params.attention_decay,
            lambda_R_relaxation: st_params.lambda_R_relaxation,
            lambda_K_relaxation: st_params.lambda_K_relaxation,
        };

        // ── 2. Mandatory Hook Check (Applies to ALL episodes independently) ──
        let hook_potential = scores.uniqueness + scores.strangeness;
        const HOOK_THRESHOLD: f64 = 6.0;
        if hook_potential < HOOK_THRESHOLD {
            // Shut off organic initial user acquisition completely (theta = 0)
            active_st_params.theta = 0.0; 
        }

        // ── 3. Cascading State Inheritance (for n > 0) ──
        if n == 0 {
            // First episode baseline initialization
            last_innovation_baseline = scores.innovation;
        } else {
            // Subsequent cascading transitions ( 有记忆时序状态承袭 )
            // Nodes decay over release interval ΔT, scaled by fan retention
            let C_inherited = current_field.C_t * exp(-st_params.lambda_C * delta_T) * eta_retention;
            
            // Resonance heat R_t decays over release interval and is scaled by story coherence kappa
            let mut R_inherited = current_field.R_t * exp(-st_params.lambda_R_relaxation * delta_T) * kappa_coherence;

            // Apply "Avatar Effect" (Aesthetic fatigue penalty on scores.innovation)
            if scores.innovation < last_innovation_baseline {
                let delta_fatigue = (last_innovation_baseline - scores.innovation).max(0.0);
                let penalty = exp(-k_fatigue * delta_fatigue);
                R_inherited *= penalty;
            }

            // Update baseline recursively with 0.95 baseline dissipation
            const BASELINE_DISSIPATION: f64 = 0.95;
            last_innovation_baseline = scores.innovation.max(last_innovation_baseline * BASELINE_DISSIPATION);

            current_field.C_t = C_inherited.clamp(0.0, 1.0);
            current_field.R_t = R_inherited.clamp(0.0, 10.0);
        }

        // Run simulation for current episode
        let mut episode_field = current_field.clone();
        let mut episode_results = Vec::with_capacity(max_ticks_per_episode);

        let E = lasinfon_core::formulas::seed_layer::compute_seed_potential(scores, seed_weights);
        let S = lasinfon_core::formulas::base_layer::compute_structural_conductance(
            env.L_cognitive, env.L_operational,
            s_weights.w_cognitive, s_weights.w_operational,
        );

        for _ in 0..max_ticks_per_episode {
            // On step 0 of first episode, calculate R statically to initiate baseline.
            // On all other steps, utilize the dynamically evolved and decayed R_t.
            let R = if episode_field.t == current_field.t && n == 0 {
                lasinfon_core::formulas::exponent_layer::compute_resonance_heat(
                    env.content_emotion_intensity,
                    env.audience_resonance_match,
                    env.environment_emotion_fit,
                    r_weights.w_content, r_weights.w_audience, r_weights.w_environment,
                )
            } else {
                episode_field.R_t
            };

            let mu_psych = if episode_field.t == current_field.t {
                lasinfon_core::formulas::exponent_layer::compute_psych_friction(
                    env.L_antipathy,
                    scores.source_credibility,
                    meme.audience_trust_base,
                    mu_weights.w_antipathy, mu_weights.w_suspicion,
                    trust_weights.w_source, trust_weights.w_audience,
                )
            } else {
                episode_field.mu_psych_t
            };

            let (omega, K_niche_switched, q_triggered) = lasinfon_core::formulas::exponent_layer::detect_q_switch(
                episode_field.T, R, meme.social_currency,
                episode_field.challengability_score, episode_field.circle_opposition,
                mapping_omega.scale, mapping_omega.denom,
                omega_cfg.trigger_T, omega_cfg.trigger_R, omega_cfg.trigger_social_currency,
            );

            let K_niche = if q_triggered { K_niche_switched } else {
                lasinfon_core::formulas::niche_layer::compute_niche(episode_field.T_effective, false)
            };

            let K = K_env_static * K_niche * episode_field.A_algo;

            let (lambda_val, lambda_eff, G) = lasinfon_core::formulas::exponent_layer::compute_lambda_and_exposure(
                R, omega, mu_psych, 0.0, // deterministic inside cascade run
                episode_field.C_t, E, K, S,
                alpha, gamma_sat,
            );

            episode_results.push(ExposureResult { lambda_val, lambda_effective: lambda_eff, G });

            let exposure = ExposureResult { lambda_val, lambda_effective: lambda_eff, G };
            episode_field = tick(&episode_field, &exposure, E, &active_st_params);
        }

        all_results.push(episode_results);
        current_field = episode_field; // Cascade final state to the next episode
    }

    all_results
}
