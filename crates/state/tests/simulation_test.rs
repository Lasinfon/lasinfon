use lasinfon_core::types::*;
use lasinfon_state::state_transfer::StateTransferParams;
use lasinfon_state::simulation::{run_simulation, SimulationConfig};

fn default_inputs() -> (SeedScores, MemeEntity, FieldState, EnvInputs, SeedWeights, KMappings, SWeights, RWeights, MuPsychWeights, TrustWeights, OmegaConfig, MappingOmega, WWeights, StateTransferParams) {
    let scores = SeedScores {
        content_emotion_arousal: 5.0, social_currency_attr: 5.0, practical_value: 5.0,
        uniqueness: 5.0, innovation: 5.0, enhancement: 5.0, strangeness: 5.0,
        narrative_completeness: 5.0, remix_openness: 5.0,
        source_credibility: 5.0, personification: 5.0,
    };
    let meme = MemeEntity {
        E: 0.5, S: 0.5,
        social_currency: 5.0, share_cost: 5.0,
        audience_trust_base: 5.0, share_circle_preference: 5.0,
    };
    let field = FieldState {
        t: 0, C_t: 0.0, R_t: 5.0, R_0: 5.0, mu_psych_t: 3.0,
        K_pot_t: 1.0, K_pot_0: 1.0, K_soil: 1.0, K_comp: 1.0, K_base: 1.0,
        A_algo: 1.0, T: 0.0, T_effective: 0.0,
        challengability_score: 5.0, circle_opposition: 8.0, social_currency_t: 5.0,
    };
    let env = EnvInputs {
        surge_match: 5.0, current_direction: 5.0, terrain_passability: 5.0,
        population_density: 5.0, connectivity: 5.0, raw_suppression: 5.0,
        L_cognitive: 5.0, L_operational: 5.0, L_antipathy: 5.0,
        content_emotion_intensity: 5.0, audience_resonance_match: 5.0, environment_emotion_fit: 5.0,
    };
    let seed_w = SeedWeights {
        w_emotion_arousal: 0.21, w_social_currency: 0.18, w_practical_value: 0.09,
        w_info_advantage: 0.12, w_narrative_completeness: 0.125, w_remix_openness: 0.125,
        w_source_credibility: 0.105, w_personification: 0.045,
    };
    let k_map = KMappings {
        k_pot: MappingKPot { base: 0.8, slope: 0.7, w_surge: 0.4, w_current: 0.4, w_terrain: 0.2 },
        k_soil: MappingKSoil { base: 0.3, slope: 1.2, w_density: 0.6, w_connect: 0.4 },
        k_comp: MappingKComp { base: 1.0, slope: 0.7 },
    };
    let s_w = SWeights { w_cognitive: 0.6, w_operational: 0.4 };
    let r_w = RWeights { w_content: 0.35, w_audience: 0.40, w_environment: 0.25 };
    let mu_w = MuPsychWeights { w_antipathy: 0.6, w_suspicion: 0.4 };
    let trust_w = TrustWeights { w_source: 0.6, w_audience: 0.4 };
    let omega_cfg = OmegaConfig { trigger_T: 6.0, trigger_R: 7.0, trigger_social_currency: 7.0 };
    let map_omega = MappingOmega { scale: 2.5, denom: 1000.0 };
    let w_w = WWeights { w_enhance: 0.40, w_trust: 0.30, w_unique: 0.20, w_R: 0.10 };
    let st_params = StateTransferParams::default();
    (scores, meme, field, env, seed_w, k_map, s_w, r_w, mu_w, trust_w, omega_cfg, map_omega, w_w, st_params)
}

#[test]
fn test_simulation_deterministic() {
    let (scores, meme, field, env, seed_w, k_map, s_w, r_w, mu_w, trust_w, omega_cfg, map_omega, w_w, st_params) = default_inputs();
    let cfg = SimulationConfig {
        max_ticks: 5,
        sigma: 0.0,
        stop_when_saturated: true,
        seed: Some(42),
    };
    let records = run_simulation(
        &scores, &meme, &field, &env,
        &seed_w, &k_map, &s_w, &r_w, &mu_w, &trust_w,
        &omega_cfg, &map_omega, &w_w,
        &st_params,
        0.2, 0.5,
        &cfg,
    );
    assert!(records.len() <= 5);
    for r in &records {
        assert!(r.G.is_finite());
    }
}

#[test]
fn test_simulation_stochastic() {
    let (scores, meme, field, env, seed_w, k_map, s_w, r_w, mu_w, trust_w, omega_cfg, map_omega, w_w, st_params) = default_inputs();
    let cfg = SimulationConfig {
        max_ticks: 5,
        sigma: 0.1,
        stop_when_saturated: false,
        seed: Some(99),
    };
    let records = run_simulation(
        &scores, &meme, &field, &env,
        &seed_w, &k_map, &s_w, &r_w, &mu_w, &trust_w,
        &omega_cfg, &map_omega, &w_w,
        &st_params,
        0.2, 0.5,
        &cfg,
    );
    assert_eq!(records.len(), 5);
    let first_g = records[0].G;
    let second_g = records[1].G;
    assert!(first_g.is_finite() && second_g.is_finite());
}
