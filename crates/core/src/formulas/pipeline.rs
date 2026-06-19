use crate::types::{
    SeedScores, SeedWeights, MemeEntity, FieldState, EnvInputs,
    SWeights, RWeights, MuPsychWeights, TrustWeights, WWeights,
    KMappings, MappingOmega, OmegaConfig,
    GrowthLevel, ExposureLevel, Quadrant, WillingnessLevel,
};
use crate::formulas::seed_layer::{compute_seed_potential, compute_info_advantage};
use crate::formulas::base_layer::{compute_K_pot, compute_K_soil, compute_K_comp, compute_structural_conductance};
use crate::formulas::exponent_layer::{compute_resonance_heat, compute_psych_friction, detect_q_switch, compute_lambda_and_exposure};
use crate::formulas::niche_layer::compute_niche;
use crate::formulas::willingness::compute_willingness_pay;
use libm::exp;
use core::f64::consts::E;

pub fn compute_full_pipeline(
    scores: &SeedScores,
    meme: &MemeEntity,
    field: &FieldState,
    env: &EnvInputs,
    seed_weights: &SeedWeights,
    k_mapping: &KMappings,
    s_weights: &SWeights,
    r_weights: &RWeights,
    mu_weights: &MuPsychWeights,
    trust_weights: &TrustWeights,
    omega_cfg: &OmegaConfig,
    mapping_omega: &MappingOmega,
    w_weights: &WWeights,
    alpha: f64,
    gamma_sat: f64,
) -> PipelineOutput {
    let E_seed = compute_seed_potential(scores, seed_weights);
    let info_advantage = compute_info_advantage(
        scores.uniqueness, scores.innovation, scores.enhancement, scores.strangeness,
    );

    let K_pot = compute_K_pot(
        env.surge_match,
        env.current_direction,
        env.terrain_passability,
        k_mapping.k_pot.base,
        k_mapping.k_pot.slope,
        k_mapping.k_pot.w_surge,
        k_mapping.k_pot.w_current,
        k_mapping.k_pot.w_terrain,
    );

    let K_soil = compute_K_soil(
        env.population_density,
        env.connectivity,
        k_mapping.k_soil.base,
        k_mapping.k_soil.slope,
        k_mapping.k_soil.w_density,
        k_mapping.k_soil.w_connect,
    );

    let K_comp = compute_K_comp(
        env.raw_suppression,
        info_advantage,
        k_mapping.k_comp.base,
        k_mapping.k_comp.slope,
    );

    let S = compute_structural_conductance(
        env.L_cognitive, env.L_operational,
        s_weights.w_cognitive, s_weights.w_operational,
    );

    let R = compute_resonance_heat(
        env.content_emotion_intensity,
        env.audience_resonance_match,
        env.environment_emotion_fit,
        r_weights.w_content,
        r_weights.w_audience,
        r_weights.w_environment,
    );

    let mu_psych = compute_psych_friction(
        env.L_antipathy,
        scores.source_credibility,
        meme.audience_trust_base,
        mu_weights.w_antipathy,
        mu_weights.w_suspicion,
        trust_weights.w_source,
        trust_weights.w_audience,
    );

    let (omega, K_niche_switched, q_triggered) = detect_q_switch(
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
        compute_niche(field.T_effective, false)
    };

    let K_base = K_pot * K_soil * K_comp * K_niche;
    let K = K_base * field.A_algo;

    let epsilon = 0.0;
    let (lambda_val, lambda_eff, G) = compute_lambda_and_exposure(
        R, omega, mu_psych, epsilon,
        field.C_t, E_seed, K, S,
        alpha, gamma_sat,
    );

    let W = compute_willingness_pay(
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

    let lambda = exp(lambda_val);
    let growth_level = classify_growth(lambda);
    let exposure_level = classify_exposure(G);
    let quadrant = classify_quadrant(lambda, G);
    let willingness_level = classify_willingness(W);

    PipelineOutput {
        E: E_seed,
        K,
        S,
        R,
        mu_psych,
        omega,
        q_triggered,
        lambda_val,
        lambda_eff,
        G,
        W,
        growth_level,
        exposure_level,
        quadrant,
        willingness_level,
    }
}

pub struct PipelineOutput {
    pub E: f64,
    pub K: f64,
    pub S: f64,
    pub R: f64,
    pub mu_psych: f64,
    pub omega: f64,
    pub q_triggered: bool,
    pub lambda_val: f64,
    pub lambda_eff: f64,
    pub G: f64,
    pub W: f64,
    pub growth_level: GrowthLevel,
    pub exposure_level: ExposureLevel,
    pub quadrant: Quadrant,
    pub willingness_level: WillingnessLevel,
}

fn classify_growth(lambda: f64) -> GrowthLevel {
    if lambda < 1.0 {
        GrowthLevel::Decay
    } else if (lambda - 1.0).abs() < 1e-12 {
        GrowthLevel::Steady
    } else if lambda <= E {
        GrowthLevel::Weak
    } else if lambda <= E * E {
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
