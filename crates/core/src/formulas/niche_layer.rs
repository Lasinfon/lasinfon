/// Compute niche coefficient K_niche (Section 5.3/6.1).
/// omega_triggered: whether Q-switch is active.
pub fn compute_niche(T_effective: f64, omega_triggered: bool) -> f64 {
    if omega_triggered {
        1.0
    } else {
        1.0 - T_effective / 10.0
    }
}
