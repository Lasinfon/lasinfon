use lasinfon_core::types::*;
use crate::state_transfer::StateTransferParams;
use crate::solvers::run_active_loop_internal;

/**
 * High-Energy Self-Excitation Emergence Solver (Track 3).
 * Simulates propagation under extreme public opinion polarization and memetic mutation.
 * Bounded by EMERGENCE_SATURATION_CAP = 10.0 to guarantee numerical safety.
 */
pub fn run_emergence_solver(
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
    K_env: f64, // Pre-aggregated static environment
    st_params: &StateTransferParams,
    alpha: f64,
    gamma_sat: f64,
    max_ticks: usize,
    sigma: f64,
    seed: Option<u64>,
) -> Vec<ExposureResult> {
    run_active_loop_internal(
        scores, meme, initial_field, env, seed_weights, s_weights, r_weights,
        mu_weights, trust_weights, omega_cfg, mapping_omega, K_env,
        st_params, alpha, gamma_sat, max_ticks, sigma, seed, true, // enable_emergence = true
    )
}
