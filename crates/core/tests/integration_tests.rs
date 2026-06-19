use lasinfon_core::types::*;
use lasinfon_core::formulas::*;
use lasinfon_core::formulas::pipeline::compute_full_pipeline;

fn default_scores() -> SeedScores {
    SeedScores {
        content_emotion_arousal: 5.0,
        social_currency_attr: 5.0,
        practical_value: 5.0,
        uniqueness: 5.0,
        innovation: 5.0,
        enhancement: 5.0,
        strangeness: 5.0,
        narrative_completeness: 5.0,
        remix_openness: 5.0,
        source_credibility: 5.0,
        personification: 5.0,
    }
}

fn default_seed_weights() -> SeedWeights {
    SeedWeights {
        w_emotion_arousal: 0.21,
        w_social_currency: 0.18,
        w_practical_value: 0.09,
        w_info_advantage: 0.12,
        w_narrative_completeness: 0.125,
        w_remix_openness: 0.125,
        w_source_credibility: 0.105,
        w_personification: 0.045,
    }
}

fn default_k_mappings() -> KMappings {
    KMappings {
        k_pot: MappingKPot {
            base: 0.8, slope: 0.7,
            w_surge: 0.4, w_current: 0.4, w_terrain: 0.2,
        },
        k_soil: MappingKSoil {
            base: 0.3, slope: 1.2,
            w_density: 0.6, w_connect: 0.4,
        },
        k_comp: MappingKComp {
            base: 1.0, slope: 0.7,
        },
    }
}

fn default_s_weights() -> SWeights {
    SWeights { w_cognitive: 0.6, w_operational: 0.4 }
}

fn default_r_weights() -> RWeights {
    RWeights { w_content: 0.35, w_audience: 0.40, w_environment: 0.25 }
}

fn default_mu_weights() -> MuPsychWeights {
    MuPsychWeights { w_antipathy: 0.6, w_suspicion: 0.4 }
}

fn default_trust_weights() -> TrustWeights {
    TrustWeights { w_source: 0.6, w_audience: 0.4 }
}

fn default_omega_cfg() -> OmegaConfig {
    OmegaConfig {
        trigger_T: 6.0, trigger_R: 7.0, trigger_social_currency: 7.0,
    }
}

fn default_mapping_omega() -> MappingOmega {
    MappingOmega { scale: 2.5, denom: 1000.0 }
}

fn default_w_weights() -> WWeights {
    WWeights { w_enhance: 0.40, w_trust: 0.30, w_unique: 0.20, w_R: 0.10 }
}

fn default_env() -> EnvInputs {
    EnvInputs {
        surge_match: 5.0, current_direction: 5.0, terrain_passability: 5.0,
        population_density: 5.0, connectivity: 5.0, raw_suppression: 5.0,
        L_cognitive: 5.0, L_operational: 5.0, L_antipathy: 5.0,
        content_emotion_intensity: 5.0, audience_resonance_match: 5.0, environment_emotion_fit: 5.0,
    }
}

fn default_meme() -> MemeEntity {
    MemeEntity {
        E: 0.5, S: 0.5,
        social_currency: 5.0, share_cost: 5.0,
        audience_trust_base: 5.0, share_circle_preference: 5.0,
    }
}

fn default_field() -> FieldState {
    FieldState {
        t: 0,
        C_t: 0.0,
        R_t: 5.0, R_0: 5.0,
        mu_psych_t: 3.0,
        K_pot_t: 1.0, K_pot_0: 1.0,
        K_soil: 1.0, K_comp: 1.0, K_base: 1.0,
        A_algo: 1.0,
        T: 3.0, T_effective: 3.0,
        challengability_score: 5.0, circle_opposition: 5.0,
        social_currency_t: 5.0,
    }
}

#[test]
fn test_seed_potential_all_max() {
    let scores = SeedScores {
        content_emotion_arousal: 10.0, social_currency_attr: 10.0, practical_value: 10.0,
        uniqueness: 10.0, innovation: 10.0, enhancement: 10.0, strangeness: 10.0,
        narrative_completeness: 10.0, remix_openness: 10.0,
        source_credibility: 10.0, personification: 10.0,
    };
    let e = compute_seed_potential(&scores, &default_seed_weights());
    assert!((e - 1.0).abs() < 1e-12);
}

#[test]
fn test_seed_potential_all_min() {
    let scores = SeedScores {
        content_emotion_arousal: 0.0, social_currency_attr: 0.0, practical_value: 0.0,
        uniqueness: 0.0, innovation: 0.0, enhancement: 0.0, strangeness: 0.0,
        narrative_completeness: 0.0, remix_openness: 0.0,
        source_credibility: 0.0, personification: 0.0,
    };
    let e = compute_seed_potential(&scores, &default_seed_weights());
    assert!((e - 0.1).abs() < 1e-12);
}

#[test]
fn test_info_advantage() {
    assert_eq!(compute_info_advantage(5.0,5.0,5.0,5.0), 5.0);
    assert_eq!(compute_info_advantage(10.0,0.0,10.0,0.0), 5.0);
}

#[test]
fn test_full_pipeline_deterministic() {
    let output = compute_full_pipeline(
        &default_scores(), &default_meme(), &default_field(), &default_env(),
        &default_seed_weights(), &default_k_mappings(), &default_s_weights(),
        &default_r_weights(), &default_mu_weights(), &default_trust_weights(),
        &default_omega_cfg(), &default_mapping_omega(), &default_w_weights(),
        0.2, 0.5,
    );
    assert!(output.E.is_finite() && output.E >= 0.1 && output.E <= 1.0);
    assert!(output.K.is_finite() && output.K >= 0.0);
    assert!(output.S.is_finite() && output.S >= 0.0 && output.S <= 1.0);
    assert!(output.R.is_finite() && output.R >= 0.0 && output.R <= 10.0);
    assert!(output.mu_psych.is_finite() && output.mu_psych >= 0.0 && output.mu_psych <= 10.0);
    assert!(output.lambda_eff.is_finite());
    assert!(output.G.is_finite() && output.G > 0.0);
}

#[test]
fn test_pipeline_no_panic_on_extremes() {
    let scores = SeedScores {
        content_emotion_arousal: 0.0, social_currency_attr: 0.0, practical_value: 0.0,
        uniqueness: 0.0, innovation: 0.0, enhancement: 0.0, strangeness: 0.0,
        narrative_completeness: 0.0, remix_openness: 0.0,
        source_credibility: 0.0, personification: 0.0,
    };
    let meme = MemeEntity {
        E: 0.0, S: 0.0,
        social_currency: 0.0, share_cost: 0.0,
        audience_trust_base: 0.0, share_circle_preference: 0.0,
    };
    let field = FieldState {
        t: 0, C_t: 0.0, R_t: 0.0, R_0: 0.0, mu_psych_t: 0.0,
        K_pot_t: 0.0, K_pot_0: 0.0, K_soil: 0.0, K_comp: 0.0, K_base: 0.0,
        A_algo: 0.0, T: 0.0, T_effective: 0.0,
        challengability_score: 0.0, circle_opposition: 0.0,
        social_currency_t: 0.0,
    };
    let env = EnvInputs {
        surge_match: 0.0, current_direction: 0.0, terrain_passability: 0.0,
        population_density: 0.0, connectivity: 0.0, raw_suppression: 0.0,
        L_cognitive: 0.0, L_operational: 0.0, L_antipathy: 0.0,
        content_emotion_intensity: 0.0, audience_resonance_match: 0.0, environment_emotion_fit: 0.0,
    };
    let output = compute_full_pipeline(
        &scores, &meme, &field, &env,
        &default_seed_weights(), &default_k_mappings(), &default_s_weights(),
        &default_r_weights(), &default_mu_weights(), &default_trust_weights(),
        &default_omega_cfg(), &default_mapping_omega(), &default_w_weights(),
        0.2, 0.5,
    );
    assert!(output.G.is_finite());
}
