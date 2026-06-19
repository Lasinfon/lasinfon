//! Formulas module – decomposed by theoretical layers.
//! Each submodule corresponds to a layer of the Social Laser Dynamics theory.

pub mod seed_layer;
pub mod base_layer;
pub mod exponent_layer;
pub mod niche_layer;
pub mod willingness;

// Re-export all public functions to maintain backward-compatible paths
pub use seed_layer::*;
pub use base_layer::*;
pub use exponent_layer::*;
pub use niche_layer::*;
pub use willingness::*;
