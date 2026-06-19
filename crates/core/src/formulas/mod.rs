//! Formulas module – decomposed by theoretical layers.

pub mod seed_layer;
pub mod base_layer;
pub mod exponent_layer;
pub mod niche_layer;
pub mod willingness;
pub mod pipeline;

// Re-export all public functions for backward compatibility
pub use seed_layer::*;
pub use base_layer::*;
pub use exponent_layer::*;
pub use niche_layer::*;
pub use willingness::*;
pub use pipeline::*;
