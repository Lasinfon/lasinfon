#![allow(non_snake_case)]

use lasinfon_core::types::*;
use lasinfon_config::merge::merge_json_values;
use serde::Deserialize;
use serde_json::Value;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Deserialize)]
pub struct InputData {
    pub scores: ScoresInput,
    pub meme: MemeInput,
    pub field: FieldInput,
    pub env: EnvInput,
}

#[derive(Debug, Deserialize)]
pub struct ScoresInput {
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

#[derive(Debug, Deserialize)]
pub struct MemeInput {
    pub social_currency: f64,
    pub share_cost: f64,
    pub audience_trust_base: f64,
    pub share_circle_preference: f64,
}

#[derive(Debug, Deserialize)]
pub struct FieldInput {
    pub t: usize,
    pub C_t: f64,
    pub R_t: f64,
    pub R_0: f64,
    pub mu_psych_t: f64,
    pub K_pot_t: f64,
    pub K_pot_0: f64,
    pub K_soil: f64,
    pub K_comp: f64,
    pub K_base: f64,
    pub A_algo: f64,
    pub T: f64,
    pub T_effective: f64,
    pub challengability_score: f64,
    pub circle_opposition: f64,
    pub social_currency_t: f64,
}

#[derive(Debug, Deserialize)]
pub struct EnvInput {
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

impl From<ScoresInput> for SeedScores {
    fn from(inp: ScoresInput) -> Self {
        SeedScores {
            content_emotion_arousal: inp.content_emotion_arousal,
            social_currency_attr: inp.social_currency_attr,
            practical_value: inp.practical_value,
            uniqueness: inp.uniqueness,
            innovation: inp.innovation,
            enhancement: inp.enhancement,
            strangeness: inp.strangeness,
            narrative_completeness: inp.narrative_completeness,
            remix_openness: inp.remix_openness,
            source_credibility: inp.source_credibility,
            personification: inp.personification,
        }
    }
}

impl From<FieldInput> for FieldState {
    fn from(inp: FieldInput) -> Self {
        FieldState {
            t: inp.t,
            C_t: inp.C_t,
            R_t: inp.R_t,
            R_0: inp.R_0,
            mu_psych_t: inp.mu_psych_t,
            K_pot_t: inp.K_pot_t,
            K_pot_0: inp.K_pot_0,
            K_soil: inp.K_soil,
            K_comp: inp.K_comp,
            K_base: inp.K_base,
            A_algo: inp.A_algo,
            T: inp.T,
            T_effective: inp.T_effective,
            challengability_score: inp.challengability_score,
            circle_opposition: inp.circle_opposition,
            social_currency_t: inp.social_currency_t,
        }
    }
}

impl From<EnvInput> for EnvInputs {
    fn from(inp: EnvInput) -> Self {
        EnvInputs {
            surge_match: inp.surge_match,
            current_direction: inp.current_direction,
            terrain_passability: inp.terrain_passability,
            population_density: inp.population_density,
            connectivity: inp.connectivity,
            raw_suppression: inp.raw_suppression,
            L_cognitive: inp.L_cognitive,
            L_operational: inp.L_operational,
            L_antipathy: inp.L_antipathy,
            content_emotion_intensity: inp.content_emotion_intensity,
            audience_resonance_match: inp.audience_resonance_match,
            environment_emotion_fit: inp.environment_emotion_fit,
        }
    }
}

/// Load and merge multiple input JSON files into a single InputData.
pub fn load_and_merge_inputs(paths: &[PathBuf]) -> Result<InputData, Box<dyn std::error::Error>> {
    let mut merged: Option<Value> = None;
    for path in paths {
        let content = fs::read_to_string(path)?;
        let val: Value = serde_json::from_str(&content)?;
        match merged.as_mut() {
            Some(base) => merge_json_values(base, &val),
            None => merged = Some(val),
        }
    }
    let final_val = merged.ok_or("At least one input file is required")?;
    let input: InputData = serde_json::from_value(final_val)?;
    Ok(input)
}
