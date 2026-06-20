# Lasinfon Development Roadmap

## v5.1.2 (Current) ✅
- Deterministic pipeline (`compute_full_pipeline`)
- Multi-tick simulation with Gaussian noise
- Ensemble forecast (Monte Carlo, `run_ensemble_forecast`)
- CLI with `run` and `simulate` subcommands
- Layered config merging (`--config` repeated)
- WASM binding (`wasm-pack build --target web`)
- Standalone canvas demo (`www/index.html`)
- AI assessment guide and input template with confidence scores
- Parameter controllability partition document
- Comment stream calibration guide
- Parameter preset library (cities, platforms, audiences)

## v5.2.0 (Planned)
### Parameter-Level Confidence-Driven Perturbation
- Read `cf_*` confidence fields from input JSON
- Scale per-parameter Gaussian noise: high confidence → narrow sigma, low confidence → wide sigma
- Enable Bayesian uncertainty propagation in ensemble forecasts
- See `docs/comment_calibration_guide.md` for confidence update rules

### Ensemble CLI Subcommand
- Add `lasinfon ensemble` command
- Accept `--runs 1000 --sigma 0.15` and output probability distribution
- Output percentiles (p5, p25, p50, p75, p95) and quadrant counts
- Support layered config merging like `run` and `simulate`

## v5.3.0 (Planned)
### Sensitivity Analysis Module
- Compute partial derivatives of G and Lambda with respect to each Controllable parameter
- Rank parameters by ROI (effort-to-impact ratio)
- Generate actionable optimization suggestions (e.g., "Simplify your headline to raise S from 0.4 to 0.8")

### Comment Calibration API
- Provide a function that accepts a list of comment strings and returns adjusted FieldState
- Internally map comment patterns to parameter adjustments per `docs/comment_calibration_guide.md`
- Support confidence updates based on calibration evidence

## v5.4.0+ (Vision)
- Full interactive dashboard UI (confidence gauge, ROI slider, before/after comparison)
- AI auto-optimization suggestion generator using LLM as back-end
- Multi-circle / multi-platform concurrent simulation
- Real-time data assimilation from live comment streams
