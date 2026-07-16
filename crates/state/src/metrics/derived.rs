use libm::exp;

/// Constant scale coefficient for the Sigmoid growth
const SIGMOID_K: f64 = 10.0;
/// Midpoint offset for confrontation energy trigger threshold
const ENERGY_MIDPOINT: f64 = 0.40;
/// Decoupled constant decay rate for remix-openness memetic amplification
const REMIX_DECAY_RATE: f64 = 0.05;

/**
 * Calculates the Confrontation Gain (G_conf) representing the public opinion
 * polarization intensity inside the social laser cavity.
 * Maps highly controversial, emotionally charged, and opposed segments to a
 * dynamic multiplier bounded at [1.0, 2.0] using a standard Sigmoid function.
 */
pub fn calculate_confrontation_gain(circle_opposition: f64, l_antipathy: f64, r_t: f64) -> f64 {
    // Check out-of-bounds to protect arithmetic integrity
    let opposition = circle_opposition.clamp(0.0, 10.0);
    let antipathy = l_antipathy.clamp(0.0, 10.0);
    let heat = r_t.clamp(0.0, 10.0);

    // Calculate integrated polarization energy normalized to [0.0, 1.0]
    let polarization_energy = (opposition * antipathy * heat) / 1000.0;

    // Standard Sigmoid mapping: [1.0, 2.0]
    // If polarization energy < 0.4, gain stays near 1.0 (no effect).
    // If energy exceeds 0.4, gain rises sharply, simulating the Q-switched plasma explosion.
    1.0 + (1.0 / (1.0 + exp(-SIGMOID_K * (polarization_energy - ENERGY_MIDPOINT))))
}

/**
 * Calculates the Entropy/Remix Amplification (E_remix) coefficient.
 * When the copytext structure is highly modular (remix_openness > 5.0),
 * it triggers an exponential memetic boost to the environmental potential.
 */
pub fn calculate_remix_amplification(remix_openness: f64) -> f64 {
    let openness = remix_openness.clamp(0.0, 10.0);
    if openness <= 5.0 {
        1.0
    } else {
        // Exponential growth: e^(0.05 * (openness - 5.0))
        // Bounded range: [1.0, 1.284] representing up to 28.4% memetic boost
        exp(REMIX_DECAY_RATE * (openness - 5.0))
    }
}

// ── 🧪 High-Fidelity Unit Tests (Ensures zero mathematical regression) ──

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_confrontation_gain_boundaries() {
        // 1. Vacuum/Quiet state: should yield approx 1.018 (within 2e-2 background noise tolerance)
        let low_gain = calculate_confrontation_gain(1.0, 1.0, 1.0);
        assert!((low_gain - 1.0).abs() < 2e-2);

        // 2. High-energy confrontation peak: should saturate towards 1.9975 (within 3e-3 tolerance)
        let peak_gain = calculate_confrontation_gain(10.0, 10.0, 10.0);
        assert!((peak_gain - 2.0).abs() < 3e-3);
    }

    #[test]
    fn test_remix_amplification_boundaries() {
        // 1. Closed narrative: should yield exactly 1.0
        let closed_amp = calculate_remix_amplification(3.0);
        assert_eq!(closed_amp, 1.0);

        // 2. Standard threshold boundary: should yield exactly 1.0
        let threshold_amp = calculate_remix_amplification(5.0);
        assert_eq!(threshold_amp, 1.0);

        // 3. Fully modular meme: should yield approx 1.284 (28.4% boost)
        let max_amp = calculate_remix_amplification(10.0);
        assert!((max_amp - 1.28402).abs() < 1e-5);
    }
}
