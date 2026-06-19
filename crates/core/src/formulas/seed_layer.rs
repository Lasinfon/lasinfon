#![allow(dead_code)]

use crate::types::SeedScores;
use crate::types::SeedWeights;

/// Compute seed potential E according to Section 3.1.
/// Internally scales 0–10 scores to 0–100 to align with E_raw / 100 formula.
pub fn compute_seed_potential(scores: &SeedScores, weights: &SeedWeights) -> f64 {
    let info_advantage = (scores.uniqueness + scores.innovation + scores.enhancement + scores.strangeness) / 4.0;
    // Scale each factor by 10 to bring scores from 0–10 to 0–100
    let e_raw = 10.0 * (
          scores.content_emotion_arousal * weights.w_emotion_arousal
        + scores.social_currency_attr * weights.w_social_currency
        + scores.practical_value * weights.w_practical_value
        + info_advantage * weights.w_info_advantage
        + scores.narrative_completeness * weights.w_narrative_completeness
        + scores.remix_openness * weights.w_remix_openness
        + scores.source_credibility * weights.w_source_credibility
        + scores.personification * weights.w_personification
    );
    let e = 0.1 + 0.9 * (e_raw / 100.0);
    e.clamp(0.1, 1.0)
}

pub fn compute_info_advantage(uniqueness: f64, innovation: f64, enhancement: f64, strangeness: f64) -> f64 {
    (uniqueness + innovation + enhancement + strangeness) / 4.0
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::SeedWeights;

    fn test_weights() -> SeedWeights {
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

    #[test]
    fn seed_potential_all_max() {
        let scores = SeedScores {
            content_emotion_arousal: 10.0,
            social_currency_attr: 10.0,
            practical_value: 10.0,
            uniqueness: 10.0,
            innovation: 10.0,
            enhancement: 10.0,
            strangeness: 10.0,
            narrative_completeness: 10.0,
            remix_openness: 10.0,
            source_credibility: 10.0,
            personification: 10.0,
        };
        let e = compute_seed_potential(&scores, &test_weights());
        assert!((e - 1.0).abs() < 1e-12, "Expected 1.0, got {}", e);
    }

    #[test]
    fn seed_potential_all_min() {
        let scores = SeedScores {
            content_emotion_arousal: 0.0,
            social_currency_attr: 0.0,
            practical_value: 0.0,
            uniqueness: 0.0,
            innovation: 0.0,
            enhancement: 0.0,
            strangeness: 0.0,
            narrative_completeness: 0.0,
            remix_openness: 0.0,
            source_credibility: 0.0,
            personification: 0.0,
        };
        let e = compute_seed_potential(&scores, &test_weights());
        assert!((e - 0.1).abs() < 1e-12, "Expected 0.1, got {}", e);
    }
}
