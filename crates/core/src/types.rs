/// Core data structures for the lasinfon engine.

/// Seed content scores (19 factors).
pub struct SeedScores {
    pub content_emotion_arousal: f64,
    pub social_currency_attr: f64,
    pub practical_value: f64,
    pub uniqueness: f64,
    pub innovation: f64,
    pub enhancement: f64,
    pub strangeness: f64,
    pub narrative_completeness: f64,
    pub remix_openness: f64,
    pub source_credibility: f64,
    pub personification: f64,
}

/// Meme entity (seed light + gain medium parameters).
pub struct MemeEntity {
    pub E: f64,    // seed potential [0.1, 1.0]
    pub S: f64,    // physical conductance [0.0, 1.0]
    pub social_currency: f64,   // [0.0, 10.0]
    pub share_cost: f64,        // [0.0, 10.0]
    pub audience_trust_base: f64, // [0.0, 10.0]
    pub share_circle_preference: f64, // [0.0, 10.0]
}

/// Dynamic field state (evolving parameters).
pub struct FieldState {
    pub t: usize,
    pub C_t: f64,           // active resonance ratio [0.0, 1.0]
    pub R_t: f64,           // resonance heat [0.0, 10.0]
    pub R_0: f64,           // initial resonance heat
    pub mu_psych_t: f64,    // psychological friction [0.0, 10.0]
    pub K_pot_t: f64,       // environmental potential [0.8, 1.5]
    pub K_pot_0: f64,
    pub K_soil: f64,        // soil conductance [0.3, 1.5]
    pub K_comp: f64,        // competition crowding [0.3, 1.0]
    pub K_base: f64,        // base field topology [0.0, 2.25]
    pub A_algo: f64,        // algorithmic amplifier [0.0, ∞)
    pub T: f64,             // threat index [0.0, 10.0]
    pub T_effective: f64,   // effective threat [0.0, 10.0]
    pub challengability_score: f64, // [0.0, 10.0]
    pub circle_opposition: f64,     // [0.0, 10.0]
    pub social_currency_t: f64,     // dynamic social currency [0.0, 10.0]
}

/// Outcome of Q-switch detection.
pub struct QSwitchResult {
    pub omega: f64,         // Q-switch magnitude
    pub K_niche: f64,       // niche coefficient
    pub triggered: bool,
}

/// Result of a single lambda/exposure computation.
pub struct ExposureResult {
    pub lambda_val: f64,
    pub lambda_effective: f64,
    pub G: f64,             // comprehensive exposure index
}

/// Niche assessment (threat & parasitic index).
pub struct NicheAssessment {
    pub T: f64,
    pub P: f64,
    pub beta: f64,
    pub T_effective: f64,
}

/// Growth level classification.
#[derive(Debug)]
pub enum GrowthLevel {
    Decay,
    Steady,
    Weak,
    Strong,
    Explosive,
}

/// Exposure level classification.
#[derive(Debug)]
pub enum ExposureLevel {
    Trace,
    Circle,
    CrossCircle,
    Phenomenal,
    Global,
}

/// Quadrant classification.
#[derive(Debug)]
pub enum Quadrant {
    TrueSelfGrowth,
    PseudoSelfGrowth,
    Choked,
    Decay,
}

/// Willingness to pay level.
#[derive(Debug)]
pub enum WillingnessLevel {
    Low,
    Medium,
    High,
    VeryHigh,
}

/// Weights for computing seed potential E.
pub struct SeedWeights {
    pub w_emotion_arousal: f64,
    pub w_social_currency: f64,
    pub w_practical_value: f64,
    pub w_info_advantage: f64,
    pub w_narrative_completeness: f64,
    pub w_remix_openness: f64,
    pub w_source_credibility: f64,
    pub w_personification: f64,
}

/// Weight sub-structures (mirrors lasinfon-config but independent).
pub struct SWeights {
    pub w_cognitive: f64,
    pub w_operational: f64,
}

pub struct RWeights {
    pub w_content: f64,
    pub w_audience: f64,
    pub w_environment: f64,
}

pub struct MuPsychWeights {
    pub w_antipathy: f64,
    pub w_suspicion: f64,
}

pub struct TrustWeights {
    pub w_source: f64,
    pub w_audience: f64,
}

pub struct WWeights {
    pub w_enhance: f64,
    pub w_trust: f64,
    pub w_unique: f64,
    pub w_R: f64,
}

pub struct KMappings {
    pub k_pot: MappingKPot,
    pub k_soil: MappingKSoil,
    pub k_comp: MappingKComp,
}

pub struct MappingKPot {
    pub base: f64,
    pub slope: f64,
    pub w_surge: f64,
    pub w_current: f64,
    pub w_terrain: f64,
}

pub struct MappingKSoil {
    pub base: f64,
    pub slope: f64,
    pub w_density: f64,
    pub w_connect: f64,
}

pub struct MappingKComp {
    pub base: f64,
    pub slope: f64,
}

pub struct MappingOmega {
    pub scale: f64,
    pub denom: f64,
}

pub struct OmegaConfig {
    pub trigger_T: f64,
    pub trigger_R: f64,
    pub trigger_social_currency: f64,
}

/// Environment inputs that are not part of the meme or field state.
pub struct EnvInputs {
    pub surge_match: f64,
    pub current_direction: f64,
    pub terrain_passability: f64,
    pub population_density: f64,
    pub connectivity: f64,
    pub raw_suppression: f64,
    pub L_cognitive: f64,
    pub L_operational: f64,
    pub L_antipathy: f64,
    pub content_emotion_intensity: f64,
    pub audience_resonance_match: f64,
    pub environment_emotion_fit: f64,
}
