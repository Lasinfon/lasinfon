use lasinfon_core::types::{FieldState, ExposureResult};
use libm::{exp, log};

/// Parameters for state transfer equations.
pub struct StateTransferParams {
    pub eta: f64,
    pub theta: f64,
    pub lambda_C: f64,
    pub gamma_social_proof: f64,
    pub gamma_self_catalysis: f64,
    pub gamma_social_pressure: f64,
    pub gamma_algo_trending: f64,
    pub attention_decay: f64,
    pub lambda_R_relaxation: f64,
    pub lambda_K_relaxation: f64,
}

impl Default for StateTransferParams {
    fn default() -> Self {
        Self {
            eta: 0.3,
            theta: 0.01,
            lambda_C: 0.3,
            gamma_social_proof: 0.5,
            gamma_self_catalysis: 0.1,
            gamma_social_pressure: 0.3,
            gamma_algo_trending: 0.05,
            attention_decay: 0.0,
            lambda_R_relaxation: 0.1,
            lambda_K_relaxation: 0.1,
        }
    }
}

/// Equation 0: Active node ratio update.
pub fn update_active_node_ratio(C_t: f64, Lambda_eff: f64, E: f64, eta: f64, theta: f64, lambda_C: f64) -> f64 {
    let C_relaxed = C_t * exp(-lambda_C);
    let dC_stimulated = eta * (Lambda_eff - 1.0) * C_relaxed * (1.0 - C_relaxed);
    let dC_spontaneous = theta * E * (1.0 - C_relaxed);
    (C_relaxed + dC_stimulated + dC_spontaneous).clamp(0.0, 1.0)
}

/// Equation 1: Psychological friction decay.
pub fn decay_psych_friction(mu_t: f64, C_t: f64, gamma_social_proof: f64) -> f64 {
    let mu_next = mu_t * (1.0 - gamma_social_proof * C_t);
    mu_next.max(0.0)
}

/// Equation 2: Resonance heat self-catalysis.
pub fn self_catalyze_resonance(R_t: f64, Lambda_eff: f64, gamma_self_catalysis: f64) -> f64 {
    if Lambda_eff > 1.0 {
        let R_temp = R_t * (1.0 + gamma_self_catalysis * log(Lambda_eff));
        R_temp.min(10.0)
    } else {
        R_t
    }
}

/// Equation 3: Social currency boost.
pub fn boost_social_currency(sc_t: f64, C_t: f64, gamma_social_pressure: f64) -> f64 {
    let sc_next = sc_t * (1.0 + gamma_social_pressure * C_t);
    sc_next.min(10.0)
}

/// Equation 4: Environmental potential growth.
pub fn grow_potential(K_pot_t: f64, G_t: f64, gamma_algo_trending: f64) -> f64 {
    let K_pot_temp = K_pot_t * (1.0 + gamma_algo_trending * log(G_t + 1.0));
    K_pot_temp.min(1.5)
}

/// Equation 5: Attention decay.
pub fn apply_attention_decay(R_temp: f64, attention_decay: f64) -> f64 {
    if attention_decay <= 0.0 {
        R_temp
    } else {
        R_temp * exp(-attention_decay)
    }
}

/// Equations 6 & 7: Relaxation cooling.
pub fn apply_relaxation_cooling(
    R_temp: f64, R_0: f64,
    K_pot_temp: f64, K_pot_0: f64,
    lambda_R: f64, lambda_K: f64,
) -> (f64, f64) {
    let R_cooled = R_0 + (R_temp - R_0) * exp(-lambda_R);
    let K_pot_cooled = K_pot_0 + (K_pot_temp - K_pot_0) * exp(-lambda_K);
    (R_cooled, K_pot_cooled)
}

/// Execute a full tick (one time step) given current field, exposure result, and seed potential E.
pub fn tick(
    field: &FieldState,
    exposure: &ExposureResult,
    meme_e: f64,
    params: &StateTransferParams,
) -> FieldState {
    // 0. Update active node ratio
    let C_next = update_active_node_ratio(
        field.C_t,
        exposure.lambda_effective,
        meme_e,
        params.eta,
        params.theta,
        params.lambda_C,
    );

    // 1. Decay psychological friction
    let mu_next = decay_psych_friction(
        field.mu_psych_t,
        field.C_t, // using current C_t or next? Typically the equation uses the same time step's C.
        params.gamma_social_proof,
    );

    // 2. Self-catalyze resonance (using Lambda_eff)
    let R_temp = self_catalyze_resonance(
        field.R_t,
        exposure.lambda_effective,
        params.gamma_self_catalysis,
    );

    // 3. Boost social currency
    let sc_next = boost_social_currency(
        field.social_currency_t,
        field.C_t,
        params.gamma_social_pressure,
    );

    // 4. Grow potential
    let K_pot_temp = grow_potential(
        field.K_pot_t,
        exposure.G,
        params.gamma_algo_trending,
    );

    // 5. Apply attention decay
    let R_temp_decayed = apply_attention_decay(R_temp, params.attention_decay);

    // 6. Relaxation cooling
    let (R_cooled, K_pot_cooled) = apply_relaxation_cooling(
        R_temp_decayed,
        field.R_0,
        K_pot_temp,
        field.K_pot_0,
        params.lambda_R_relaxation,
        params.lambda_K_relaxation,
    );

    FieldState {
        t: field.t + 1,
        C_t: C_next,
        R_t: R_cooled,
        R_0: field.R_0,
        mu_psych_t: mu_next,
        K_pot_t: K_pot_cooled,
        K_pot_0: field.K_pot_0,
        K_soil: field.K_soil,
        K_comp: field.K_comp,
        K_base: field.K_base,
        A_algo: field.A_algo,
        T: field.T,
        T_effective: field.T_effective,
        challengability_score: field.challengability_score,
        circle_opposition: field.circle_opposition,
        social_currency_t: sc_next,
    }
}
