#![allow(non_snake_case)]

pub mod merge;

use serde::Deserialize;
use std::fs;
use std::path::Path;

#[derive(Debug, Deserialize, Clone)]
pub struct SystemConfig {
    #[serde(default)]
    pub system: SystemParams,
    #[serde(default)]
    pub precision: PrecisionConfig,
    #[serde(default)]
    pub stochastic: StochasticConfig,
    #[serde(default)]
    pub state_transfer: StateTransferConfig,
    #[serde(default)]
    pub omega: OmegaConfig,
    #[serde(default)]
    pub niche: NicheConfig,
    #[serde(default)]
    pub weights: WeightsConfig,
    #[serde(default)]
    pub mapping: MappingConfig,
}

#[derive(Debug, Deserialize, Clone, Default)]
pub struct SystemParams {
    #[serde(default = "default_alpha")]
    pub alpha: f64,
}

fn default_alpha() -> f64 { 0.2 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct PrecisionConfig {
    #[serde(default)]
    pub input: InputPrecision,
    #[serde(default)]
    pub display: DisplayPrecision,
}

#[derive(Debug, Deserialize, Clone, Default)]
pub struct InputPrecision {
    #[serde(default = "default_factor_score")]
    pub factor_score: u8,
    #[serde(default = "default_pct_score")]
    pub pct_score: u8,
}

fn default_factor_score() -> u8 { 1 }
fn default_pct_score() -> u8 { 2 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct DisplayPrecision {
    #[serde(default = "default_display_g")]
    pub G: u8,
    #[serde(default = "default_display_lambda")]
    pub Lambda: u8,
    #[serde(default = "default_display_e")]
    pub E: u8,
    #[serde(default = "default_display_r")]
    pub R: u8,
    #[serde(default = "default_display_s")]
    pub S: u8,
    #[serde(default = "default_display_k")]
    pub K: u8,
    #[serde(default = "default_display_sigma")]
    pub sigma: u8,
    #[serde(default = "default_display_ci")]
    pub confidence_interval: u8,
    #[serde(default = "default_display_pct")]
    pub percentage: u8,
}

fn default_display_g() -> u8 { 2 }
fn default_display_lambda() -> u8 { 4 }
fn default_display_e() -> u8 { 3 }
fn default_display_r() -> u8 { 2 }
fn default_display_s() -> u8 { 2 }
fn default_display_k() -> u8 { 2 }
fn default_display_sigma() -> u8 { 3 }
fn default_display_ci() -> u8 { 1 }
fn default_display_pct() -> u8 { 1 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct StochasticConfig {
    #[serde(default = "default_sigma")]
    pub sigma: f64,
    #[serde(default = "default_eta")]
    pub eta: f64,
    #[serde(default = "default_theta")]
    pub theta: f64,
    #[serde(default = "default_gamma_saturation")]
    pub gamma_saturation: f64,
    #[serde(default = "default_monte_carlo_runs")]
    pub monte_carlo_runs: usize,
    #[serde(default = "default_confidence_interval")]
    pub confidence_interval: f64,
}

fn default_sigma() -> f64 { 0.15 }
fn default_eta() -> f64 { 0.3 }
fn default_theta() -> f64 { 0.01 }
fn default_gamma_saturation() -> f64 { 0.5 }
fn default_monte_carlo_runs() -> usize { 1000 }
fn default_confidence_interval() -> f64 { 0.90 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct StateTransferConfig {
    #[serde(default = "default_gamma_social_proof")]
    pub gamma_social_proof: f64,
    #[serde(default = "default_gamma_self_catalysis")]
    pub gamma_self_catalysis: f64,
    #[serde(default = "default_gamma_social_pressure")]
    pub gamma_social_pressure: f64,
    #[serde(default = "default_gamma_algo_trending")]
    pub gamma_algo_trending: f64,
    #[serde(default = "default_attention_decay")]
    pub attention_decay: f64,
    #[serde(default = "default_lambda_R_relaxation")]
    pub lambda_R_relaxation: f64,
    #[serde(default = "default_lambda_K_relaxation")]
    pub lambda_K_relaxation: f64,
    #[serde(default = "default_lambda_C_relaxation")]
    pub lambda_C_relaxation: f64,
}

fn default_gamma_social_proof() -> f64 { 0.5 }
fn default_gamma_self_catalysis() -> f64 { 0.1 }
fn default_gamma_social_pressure() -> f64 { 0.3 }
fn default_gamma_algo_trending() -> f64 { 0.05 }
fn default_attention_decay() -> f64 { 0.0 }
fn default_lambda_R_relaxation() -> f64 { 0.1 }
fn default_lambda_K_relaxation() -> f64 { 0.1 }
fn default_lambda_C_relaxation() -> f64 { 0.3 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct OmegaConfig {
    #[serde(default = "default_trigger_T")]
    pub trigger_T: f64,
    #[serde(default = "default_trigger_R")]
    pub trigger_R: f64,
    #[serde(default = "default_trigger_social_currency")]
    pub trigger_social_currency: f64,
    #[serde(default = "default_circle_opposition")]
    pub circle_opposition_default: f64,
    #[serde(default = "default_challengability")]
    pub challengability_default: f64,
    #[serde(default = "default_omega_scale")]
    pub scale: f64,
    #[serde(default = "default_omega_denom")]
    pub denom: f64,
}

fn default_trigger_T() -> f64 { 6.0 }
fn default_trigger_R() -> f64 { 7.0 }
fn default_trigger_social_currency() -> f64 { 7.0 }
fn default_circle_opposition() -> f64 { 8.0 }
fn default_challengability() -> f64 { 5.0 }
fn default_omega_scale() -> f64 { 2.5 }
fn default_omega_denom() -> f64 { 1000.0 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct NicheConfig {
    #[serde(default = "default_beta_min")]
    pub beta_min: f64,
    #[serde(default = "default_beta_range")]
    pub beta_range: f64,
}

fn default_beta_min() -> f64 { 0.3 }
fn default_beta_range() -> f64 { 0.5 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct WeightsConfig {
    #[serde(default)]
    pub seed: SeedWeights,
    #[serde(default)]
    pub S: SWeights,
    #[serde(default)]
    pub R: RWeights,
    #[serde(default)]
    pub mu_psych: MuPsychWeights,
    #[serde(default)]
    pub trust: TrustWeights,
    #[serde(default)]
    pub P: PWeights,
    #[serde(default)]
    pub T: TWeights,
    #[serde(default)]
    pub W: WWeights,
}

#[derive(Debug, Deserialize, Clone, Default)]
pub struct SeedWeights {
    #[serde(default = "default_w_emotion_arousal")]
    pub w_emotion_arousal: f64,
    #[serde(default = "default_w_social_currency")]
    pub w_social_currency: f64,
    #[serde(default = "default_w_practical_value")]
    pub w_practical_value: f64,
    #[serde(default = "default_w_info_advantage")]
    pub w_info_advantage: f64,
    #[serde(default = "default_w_narrative_completeness")]
    pub w_narrative_completeness: f64,
    #[serde(default = "default_w_remix_openness")]
    pub w_remix_openness: f64,
    #[serde(default = "default_w_source_credibility")]
    pub w_source_credibility: f64,
    #[serde(default = "default_w_personification")]
    pub w_personification: f64,
}

fn default_w_emotion_arousal() -> f64 { 0.21 }
fn default_w_social_currency() -> f64 { 0.18 }
fn default_w_practical_value() -> f64 { 0.09 }
fn default_w_info_advantage() -> f64 { 0.12 }
fn default_w_narrative_completeness() -> f64 { 0.125 }
fn default_w_remix_openness() -> f64 { 0.125 }
fn default_w_source_credibility() -> f64 { 0.105 }
fn default_w_personification() -> f64 { 0.045 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct SWeights {
    #[serde(default = "default_w_cognitive")]
    pub w_cognitive: f64,
    #[serde(default = "default_w_operational")]
    pub w_operational: f64,
}

fn default_w_cognitive() -> f64 { 0.6 }
fn default_w_operational() -> f64 { 0.4 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct RWeights {
    #[serde(default = "default_w_content")]
    pub w_content: f64,
    #[serde(default = "default_w_audience")]
    pub w_audience: f64,
    #[serde(default = "default_w_environment")]
    pub w_environment: f64,
}

fn default_w_content() -> f64 { 0.35 }
fn default_w_audience() -> f64 { 0.40 }
fn default_w_environment() -> f64 { 0.25 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct MuPsychWeights {
    #[serde(default = "default_w_antipathy")]
    pub w_antipathy: f64,
    #[serde(default = "default_w_suspicion")]
    pub w_suspicion: f64,
}

fn default_w_antipathy() -> f64 { 0.6 }
fn default_w_suspicion() -> f64 { 0.4 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct TrustWeights {
    #[serde(default = "default_w_source")]
    pub w_source: f64,
    #[serde(default = "default_w_audience_trust")]
    pub w_audience: f64,
}

fn default_w_source() -> f64 { 0.6 }
fn default_w_audience_trust() -> f64 { 0.4 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct PWeights {
    #[serde(default = "default_w_complement")]
    pub w_complement: f64,
    #[serde(default = "default_w_traffic")]
    pub w_traffic: f64,
    #[serde(default = "default_w_binding")]
    pub w_binding: f64,
}

fn default_w_complement() -> f64 { 0.40 }
fn default_w_traffic() -> f64 { 0.35 }
fn default_w_binding() -> f64 { 0.25 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct TWeights {
    #[serde(default = "default_w_market")]
    pub w_market: f64,
    #[serde(default = "default_w_narrative")]
    pub w_narrative: f64,
    #[serde(default = "default_w_rule")]
    pub w_rule: f64,
}

fn default_w_market() -> f64 { 0.50 }
fn default_w_narrative() -> f64 { 0.30 }
fn default_w_rule() -> f64 { 0.20 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct WWeights {
    #[serde(default = "default_w_enhance")]
    pub w_enhance: f64,
    #[serde(default = "default_w_trust")]
    pub w_trust: f64,
    #[serde(default = "default_w_unique")]
    pub w_unique: f64,
    #[serde(default = "default_w_R")]
    pub w_R: f64,
}

fn default_w_enhance() -> f64 { 0.40 }
fn default_w_trust() -> f64 { 0.30 }
fn default_w_unique() -> f64 { 0.20 }
fn default_w_R() -> f64 { 0.10 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct MappingConfig {
    #[serde(default)]
    pub K_pot: MappingKPot,
    #[serde(default)]
    pub K_soil: MappingKSoil,
    #[serde(default)]
    pub K_comp: MappingKComp,
    #[serde(default)]
    pub omega: MappingOmega,
}

#[derive(Debug, Deserialize, Clone, Default)]
pub struct MappingKPot {
    #[serde(default = "default_kpot_base")]
    pub base: f64,
    #[serde(default = "default_kpot_slope")]
    pub slope: f64,
    #[serde(default = "default_kpot_w_surge")]
    pub w_surge: f64,
    #[serde(default = "default_kpot_w_current")]
    pub w_current: f64,
    #[serde(default = "default_kpot_w_terrain")]
    pub w_terrain: f64,
}

fn default_kpot_base() -> f64 { 0.8 }
fn default_kpot_slope() -> f64 { 0.7 }
fn default_kpot_w_surge() -> f64 { 0.4 }
fn default_kpot_w_current() -> f64 { 0.4 }
fn default_kpot_w_terrain() -> f64 { 0.2 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct MappingKSoil {
    #[serde(default = "default_ksoil_base")]
    pub base: f64,
    #[serde(default = "default_ksoil_slope")]
    pub slope: f64,
    #[serde(default = "default_ksoil_w_density")]
    pub w_density: f64,
    #[serde(default = "default_ksoil_w_connect")]
    pub w_connect: f64,
}

fn default_ksoil_base() -> f64 { 0.3 }
fn default_ksoil_slope() -> f64 { 1.2 }
fn default_ksoil_w_density() -> f64 { 0.6 }
fn default_ksoil_w_connect() -> f64 { 0.4 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct MappingKComp {
    #[serde(default = "default_kcomp_base")]
    pub base: f64,
    #[serde(default = "default_kcomp_slope")]
    pub slope: f64,
}

fn default_kcomp_base() -> f64 { 1.0 }
fn default_kcomp_slope() -> f64 { 0.7 }

#[derive(Debug, Deserialize, Clone, Default)]
pub struct MappingOmega {
    #[serde(default = "default_mapping_omega_scale")]
    pub scale: f64,
    #[serde(default = "default_mapping_omega_denom")]
    pub denom: f64,
}

fn default_mapping_omega_scale() -> f64 { 2.5 }
fn default_mapping_omega_denom() -> f64 { 1000.0 }

pub fn load_config(path: &Path) -> Result<SystemConfig, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(path)?;
    let config: SystemConfig = serde_json::from_str(&content)?;
    Ok(config)
}

pub fn validate_config(config: &SystemConfig) -> Vec<String> {
    let mut warnings = Vec::new();
    if config.state_transfer.gamma_social_proof < 0.0 || config.state_transfer.gamma_social_proof > 1.0 {
        warnings.push(format!(
            "gamma_social_proof {} out of [0.0, 1.0], will be clamped",
            config.state_transfer.gamma_social_proof
        ));
    }
    if config.system.alpha <= 0.0 {
        warnings.push("alpha must be positive".to_string());
    }
    warnings
}
