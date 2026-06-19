use crate::types::SystemConfig;
use crate::merge::load_and_merge_json_files;
use serde_json::Value;
use std::path::PathBuf;

/// Load a single config JSON file.
pub fn load_config(path: &std::path::Path) -> Result<SystemConfig, Box<dyn std::error::Error>> {
    let content = std::fs::read_to_string(path)?;
    let config: SystemConfig = serde_json::from_str(&content)?;
    Ok(config)
}

/// Load and merge multiple config JSON files, then deserialize into SystemConfig.
/// Files are merged left-to-right (later files override earlier ones).
pub fn load_merged_configs(paths: &[PathBuf]) -> Result<SystemConfig, Box<dyn std::error::Error>> {
    let merged: Value = load_and_merge_json_files(paths)?;
    let config: SystemConfig = serde_json::from_value(merged)?;
    Ok(config)
}

/// Validate merged config and return warnings.
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
