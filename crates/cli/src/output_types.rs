#![allow(non_snake_case)]

use lasinfon_state::simulation::StepRecord;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct RunOutput {
    pub E: f64,
    pub K: f64,
    pub S: f64,
    pub R: f64,
    pub mu_psych: f64,
    pub omega: f64,
    pub q_triggered: bool,
    pub lambda_val: f64,
    pub lambda_eff: f64,
    pub G: f64,             // Active exposure output (G_active)
    pub G_std: f64,         // SRP standard exposure output (G_std)
    pub K_mult: f64,        // Dynamic environmental multiplier (K_mult)
    pub W: f64,
    pub growth_level: String,
    pub exposure_level: String,
    pub quadrant: String,
    pub willingness_level: String,
    pub field_next: FieldNext,
}

#[derive(Debug, Serialize)]
pub struct FieldNext {
    pub t: usize,
    pub C_t: f64,
    pub R_t: f64,
    pub mu_psych_t: f64,
    pub K_pot_t: f64,
    pub social_currency_t: f64,
}

#[derive(Debug, Serialize)]
pub struct SimulateOutput {
    pub records: Vec<StepRecord>,
}
