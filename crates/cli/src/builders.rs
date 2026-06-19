#![allow(non_snake_case)]

use lasinfon_core::types::*;
use lasinfon_state::state_transfer::StateTransferParams;
use lasinfon_config::SystemConfig;

/// Build core SeedWeights from config's seed weights.
pub fn build_seed_weights(config: &lasinfon_config::WeightsConfig) -> SeedWeights {
    SeedWeights {
        w_emotion_arousal: config.seed.w_emotion_arousal,
        w_social_currency: config.seed.w_social_currency,
        w_practical_value: config.seed.w_practical_value,
        w_info_advantage: config.seed.w_info_advantage,
        w_narrative_completeness: config.seed.w_narrative_completeness,
        w_remix_openness: config.seed.w_remix_openness,
        w_source_credibility: config.seed.w_source_credibility,
        w_personification: config.seed.w_personification,
    }
}

/// Build core KMappings from config's mapping.
pub fn build_k_mappings(config: &lasinfon_config::MappingConfig) -> KMappings {
    KMappings {
        k_pot: MappingKPot {
            base: config.K_pot.base,
            slope: config.K_pot.slope,
            w_surge: config.K_pot.w_surge,
            w_current: config.K_pot.w_current,
            w_terrain: config.K_pot.w_terrain,
        },
        k_soil: MappingKSoil {
            base: config.K_soil.base,
            slope: config.K_soil.slope,
            w_density: config.K_soil.w_density,
            w_connect: config.K_soil.w_connect,
        },
        k_comp: MappingKComp {
            base: config.K_comp.base,
            slope: config.K_comp.slope,
        },
    }
}

/// Build core SWeights from config's S weights.
pub fn build_s_weights(config: &lasinfon_config::SWeights) -> SWeights {
    SWeights {
        w_cognitive: config.w_cognitive,
        w_operational: config.w_operational,
    }
}

/// Build core RWeights from config's R weights.
pub fn build_r_weights(config: &lasinfon_config::RWeights) -> RWeights {
    RWeights {
        w_content: config.w_content,
        w_audience: config.w_audience,
        w_environment: config.w_environment,
    }
}

/// Build core MuPsychWeights from config's mu_psych weights.
pub fn build_mu_weights(config: &lasinfon_config::MuPsychWeights) -> MuPsychWeights {
    MuPsychWeights {
        w_antipathy: config.w_antipathy,
        w_suspicion: config.w_suspicion,
    }
}

/// Build core TrustWeights from config's trust weights.
pub fn build_trust_weights(config: &lasinfon_config::TrustWeights) -> TrustWeights {
    TrustWeights {
        w_source: config.w_source,
        w_audience: config.w_audience,
    }
}

/// Build core OmegaConfig from config's omega (only the trigger fields are needed).
pub fn build_omega_cfg(config: &lasinfon_config::OmegaConfig) -> OmegaConfig {
    OmegaConfig {
        trigger_T: config.trigger_T,
        trigger_R: config.trigger_R,
        trigger_social_currency: config.trigger_social_currency,
    }
}

/// Build core MappingOmega from config's mapping omega.
pub fn build_mapping_omega(config: &lasinfon_config::MappingOmega) -> MappingOmega {
    MappingOmega {
        scale: config.scale,
        denom: config.denom,
    }
}

/// Build core WWeights from config's W weights.
pub fn build_w_weights(config: &lasinfon_config::WWeights) -> WWeights {
    WWeights {
        w_enhance: config.w_enhance,
        w_trust: config.w_trust,
        w_unique: config.w_unique,
        w_R: config.w_R,
    }
}

/// Build state transfer parameters from full config.
pub fn build_state_params(config: &SystemConfig) -> StateTransferParams {
    StateTransferParams {
        eta: config.stochastic.eta,
        theta: config.stochastic.theta,
        lambda_C: config.state_transfer.lambda_C_relaxation,
        gamma_social_proof: config.state_transfer.gamma_social_proof,
        gamma_self_catalysis: config.state_transfer.gamma_self_catalysis,
        gamma_social_pressure: config.state_transfer.gamma_social_pressure,
        gamma_algo_trending: config.state_transfer.gamma_algo_trending,
        attention_decay: config.state_transfer.attention_decay,
        lambda_R_relaxation: config.state_transfer.lambda_R_relaxation,
        lambda_K_relaxation: config.state_transfer.lambda_K_relaxation,
    }
}
