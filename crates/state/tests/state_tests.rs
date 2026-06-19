use lasinfon_core::types::{FieldState, ExposureResult};
use lasinfon_state::state_transfer::*;

fn default_field() -> FieldState {
    FieldState {
        t: 0,
        C_t: 0.1,
        R_t: 5.0,
        R_0: 5.0,
        mu_psych_t: 3.0,
        K_pot_t: 1.0,
        K_pot_0: 1.0,
        K_soil: 1.0,
        K_comp: 1.0,
        K_base: 1.0,
        A_algo: 1.0,
        T: 0.0,
        T_effective: 0.0,
        challengability_score: 5.0,
        circle_opposition: 8.0,
        social_currency_t: 5.0,
    }
}

fn default_params() -> StateTransferParams {
    StateTransferParams::default()
}

#[test]
fn test_update_active_node_ratio_cold_start() {
    let params = default_params();
    // C_t = 0, Lambda_eff = 2.0, E = 0.8 => spontaneous activation
    let C_new = update_active_node_ratio(0.0, 2.0, 0.8, params.eta, params.theta, params.lambda_C);
    assert!(C_new > 0.0);
    assert!(C_new <= 1.0);
}

#[test]
fn test_decay_psych_friction() {
    let mu = decay_psych_friction(4.0, 0.5, 0.5);
    assert!(mu < 4.0);
    assert!(mu >= 0.0);
}

#[test]
fn test_self_catalyze_resonance() {
    let R = self_catalyze_resonance(5.0, 2.0, 0.1);
    assert!(R > 5.0);
    let R_no = self_catalyze_resonance(5.0, 0.5, 0.1);
    assert_eq!(R_no, 5.0);
}

#[test]
fn test_full_tick() {
    let field = default_field();
    let exposure = ExposureResult {
        lambda_val: 0.5,
        lambda_effective: 1.5,
        G: 10.0,
    };
    let params = default_params();
    let next = tick(&field, &exposure, 0.6, &params);
    assert_eq!(next.t, 1);
    assert!(next.C_t >= 0.0 && next.C_t <= 1.0);
    assert!(next.R_t >= 0.0 && next.R_t <= 10.0);
    assert!(next.mu_psych_t >= 0.0);
    assert!(next.K_pot_t >= 0.8 && next.K_pot_t <= 1.5);
    assert!(next.social_currency_t >= 0.0);
}
