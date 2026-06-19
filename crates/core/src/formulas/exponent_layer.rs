use libm::{exp, pow};

/// Compute resonance heat R (Section 4.1).
pub fn compute_resonance_heat(
    content_emotion: f64,
    audience_match: f64,
    env_fit: f64,
    w_content: f64,
    w_audience: f64,
    w_env: f64,
) -> f64 {
    w_content * content_emotion + w_audience * audience_match + w_env * env_fit
}

/// Compute psychological friction μ_psych (Section 4.2).
pub fn compute_psych_friction(
    L_antipathy: f64,
    source_credibility: f64,
    audience_trust_base: f64,
    w_anti: f64,
    w_susp: f64,
    w_source: f64,
    w_audience: f64,
) -> f64 {
    let seed_trust = source_credibility * w_source + audience_trust_base * w_audience;
    let L_suspicion = 10.0 - seed_trust;
    w_anti * L_antipathy + w_susp * L_suspicion
}

/// Q-switch detection (Section 4.3).
/// Returns (omega, K_niche, triggered).
pub fn detect_q_switch(
    T_raw: f64,
    R_t: f64,
    social_currency: f64,
    challengability_score: f64,
    circle_opposition: f64,
    config_scale: f64,
    config_denom: f64,
    trigger_T: f64,
    trigger_R: f64,
    trigger_sc: f64,
) -> (f64, f64, bool) {
    if T_raw >= trigger_T && R_t >= trigger_R && social_currency >= trigger_sc {
        let challengability_factor = (10.0 - challengability_score) / 10.0;
        let omega = config_scale * (T_raw * R_t * circle_opposition * challengability_factor) / config_denom;
        (omega, 1.0, true)
    } else {
        (0.0, 1.0, false)
    }
}

/// Compute lambda and exposure (Lambda_effective and G).
pub fn compute_lambda_and_exposure(
    R_t: f64,
    Omega: f64,
    mu_t: f64,
    epsilon: f64,
    C_t: f64,
    E: f64,
    K: f64,
    S: f64,
    alpha: f64,
    gamma_sat: f64,
) -> (f64, f64, f64) {
    let lambda_val = alpha * (R_t * (1.0 + Omega) - mu_t) + epsilon;
    let lambda = exp(lambda_val);
    let lambda_eff = lambda * pow(1.0 - C_t, gamma_sat);
    let G = E * K * S * lambda_eff;
    (lambda_val, lambda_eff, G)
}
