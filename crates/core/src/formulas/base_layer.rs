/// Compute K_pot (environmental potential) as per Section 3.3.
pub fn compute_K_pot(
    surge_match: f64,
    current_direction: f64,
    terrain_passability: f64,
    base: f64,
    slope: f64,
    w_surge: f64,
    w_current: f64,
    w_terrain: f64,
) -> f64 {
    base + slope * (surge_match * w_surge + current_direction * w_current + terrain_passability * w_terrain) / 10.0
}

/// Compute K_soil (soil conductance).
pub fn compute_K_soil(
    population_density: f64,
    connectivity: f64,
    base: f64,
    slope: f64,
    w_density: f64,
    w_connect: f64,
) -> f64 {
    base + slope * (population_density * w_density + connectivity * w_connect) / 10.0
}

/// Compute K_comp (competition crowding).
pub fn compute_K_comp(
    raw_suppression: f64,
    info_advantage: f64,
    base: f64,
    slope: f64,
) -> f64 {
    let effective_suppression = raw_suppression * (1.0 - info_advantage / 10.0);
    base - slope * (effective_suppression / 10.0)
}

/// Compute physical conductance S (Section 3.4).
pub fn compute_structural_conductance(
    L_cognitive: f64,
    L_operational: f64,
    w_cog: f64,
    w_op: f64,
) -> f64 {
    1.0 - (w_cog * L_cognitive + w_op * L_operational) / 10.0
}
