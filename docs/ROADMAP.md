# Lasinfon Development Roadmap

## v5.1.2 (Current)
- Deterministic pipeline
- Multi-tick simulation with noise
- Ensemble forecast (Monte Carlo)
- CLI (run, simulate) with layered config merging
- WASM binding + standalone canvas demo
- AI assessment guide and input template with confidence scores

## v5.2.0 (Planned)
- **Parameter-level confidence-driven perturbation** in Monte Carlo engine
  - Use `cf_*` fields to scale per-parameter Gaussian noise
  - High confidence → narrow perturbation; low confidence → wide perturbation
  - Enable Bayesian uncertainty propagation
- WASM demo enhance with interactive preset composer
- Ensemble CLI subcommand

## Future
- Data assimilation and auto-calibration from real-world spread data
- Support for multi-circle / multi-platform concurrent simulations
- Full City/App/Circle preset library with empirically tuned defaults
