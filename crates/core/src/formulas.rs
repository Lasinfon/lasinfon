use crate::types::SeedScores;
use libm::{exp, pow};

/// Compute seed potential E according to Section 3.1.
pub fn compute_seed_potential(scores: &SeedScores) -> f64 {
    let info_advantage = (scores.uniqueness + scores.innovation + scores.enhancement + scores.strangeness) / 4.0;
    let e_raw = scores.content_emotion_arousal * 0.21
        + scores.social_currency_attr * 0.18
        + scores.practical_value * 0.09
        + info_advantage * 0.12
        + scores.narrative_completeness * 0.125
        + scores.remix_openness * 0.125
        + scores.source_credibility * 0.105
        + scores.personification * 0.045;
    let e = 0.1 + 0.9 * (e_raw / 100.0);
    e.clamp(0.1, 1.0)
}

pub fn compute_info_advantage(uniqueness: f64, innovation: f64, enhancement: f64, strangeness: f64) -> f64 {
    (uniqueness + innovation + enhancement + strangeness) / 4.0
}

pub fn compute_K_pot(surge_match: f64, current_direction: f64, terrain_passability: f64, base: f64, slope: f64, w_surge: f64, w_current: f64, w_terrain: f64) -> f64 {
    base + slope * (surge_match * w_surge + current_direction * w_current + terrain_passability * w_terrain) / 10.0
}

pub fn compute_K_soil(population_density: f64, connectivity: f64, base: f64, slope: f64, w_density: f64, w_connect: f64) -> f64 {
    base + slope * (population_density * w_density + connectivity * w_connect) / 10.0
}

pub fn compute_K_comp(raw_suppression: f64, info_advantage: f64, base: f64, slope: f64) -> f64 {
    let effective_suppression = raw_suppression * (1.0 - info_advantage / 10.0);
    base - slope * (effective_suppression / 10.0)
}

pub fn compute_structural_conductance(L_cognitive: f64, L_operational: f64, w_cog: f64, w_op: f64) -> f64 {
    1.0 - (w_cog * L_cognitive + w_op * L_operational) / 10.0
}

pub fn compute_resonance_heat(content_emotion: f64, audience_match: f64, env_fit: f64, w_content: f64, w_audience: f64, w_env: f64) -> f64 {
    w_content * content_emotion + w_audience * audience_match + w_env * env_fit
}

pub fn compute_psych_friction(L_antipathy: f64, source_credibility: f64, audience_trust_base: f64, w_anti: f64, w_susp: f64, w_source: f64, w_audience: f64) -> f64 {
    let seed_trust = source_credibility * w_source + audience_trust_base * w_audience;
    let L_suspicion = 10.0 - seed_trust;
    w_anti * L_antipathy + w_susp * L_suspicion
}

pub fn detect_q_switch(T_raw: f64, R_t: f64, social_currency: f64, challengability_score: f64, circle_opposition: f64, config_scale: f64, config_denom: f64, trigger_T: f64, trigger_R: f64, trigger_sc: f64) -> (f64, f64, bool) {
    if T_raw >= trigger_T && R_t >= trigger_R && social_currency >= trigger_sc {
        let challengability_factor = (10.0 - challengability_score) / 10.0;
        let omega = config_scale * (T_raw * R_t * circle_opposition * challengability_factor) / config_denom;
        (omega, 1.0, true)
    } else {
        (0.0, 1.0, false)
    }
}

pub fn compute_niche(T_effective: f64, omega_triggered: bool) -> f64 {
    if omega_triggered {
        1.0
    } else {
        1.0 - T_effective / 10.0
    }
}

pub fn compute_lambda_and_exposure(
    R_t: f64, Omega: f64, mu_t: f64, epsilon: f64,
    C_t: f64, E: f64, K: f64, S: f64,
    alpha: f64, gamma_sat: f64,
) -> (f64, f64, f64) {
    let lambda_val = alpha * (R_t * (1.0 + Omega) - mu_t) + epsilon;
    let lambda = exp(lambda_val);
    let lambda_eff = lambda * pow(1.0 - C_t, gamma_sat);
    let G = E * K * S * lambda_eff;
    (lambda_val, lambda_eff, G)
}

pub fn compute_willingness_pay(enhancement: f64, source_credibility: f64, audience_trust_base: f64, uniqueness: f64, R: f64, w_enhance: f64, w_trust: f64, w_unique: f64, w_R: f64, w_source: f64, w_audience: f64) -> f64 {
    let trust = source_credibility * w_source + audience_trust_base * w_audience;
    w_enhance * enhancement + w_trust * trust + w_unique * uniqueness + w_R * R
}
