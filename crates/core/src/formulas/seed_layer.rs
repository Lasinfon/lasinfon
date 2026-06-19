use crate::types::SeedScores;
use crate::types::SeedWeights;

/// Compute seed potential E according to Section 3.1.
pub fn compute_seed_potential(scores: &SeedScores, weights: &SeedWeights) -> f64 {
    let info_advantage = (scores.uniqueness + scores.innovation + scores.enhancement + scores.strangeness) / 4.0;
    let e_raw = scores.content_emotion_arousal * weights.w_emotion_arousal
        + scores.social_currency_attr * weights.w_social_currency
        + scores.practical_value * weights.w_practical_value
        + info_advantage * weights.w_info_advantage
        + scores.narrative_completeness * weights.w_narrative_completeness
        + scores.remix_openness * weights.w_remix_openness
        + scores.source_credibility * weights.w_source_credibility
        + scores.personification * weights.w_personification;
    let e = 0.1 + 0.9 * (e_raw / 100.0);
    e.clamp(0.1, 1.0)
}

pub fn compute_info_advantage(uniqueness: f64, innovation: f64, enhancement: f64, strangeness: f64) -> f64 {
    (uniqueness + innovation + enhancement + strangeness) / 4.0
}
