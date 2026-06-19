#![allow(non_snake_case)]
use libm::exp;

pub fn update_active_node_ratio(C_t: f64, Lambda_eff: f64, E: f64, eta: f64, theta: f64, lambda_C: f64) -> f64 {
    let C_relaxed = C_t * exp(-lambda_C);
    let dC_stimulated = eta * (Lambda_eff - 1.0) * C_relaxed * (1.0 - C_relaxed);
    let dC_spontaneous = theta * E * (1.0 - C_relaxed);
    (C_relaxed + dC_stimulated + dC_spontaneous).clamp(0.0, 1.0)
}
