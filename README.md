```markdown
# Lasinfon

**Social Laser Dynamics Engine**  Autonomous Propagation Simulation System

Lasinfon is a highprecision, fully parameterised simulation engine for studying how information spreads through social networks driven by emotional resonance and audience activation. It treats content as "signal light" and audiences as "gain medium", producing coherent propagation beams or decay depending on resonance, friction, and environmental conditions.

> **Warning**: This repository contains no core algorithm descriptions. For the mathematical framework please refer to the internal Theory Master Document.

## Project Status

`v5.1.2`  Deterministic pipeline, multitick lifecycle simulation, Monte Carlo ensemble forecasting, CLI, WASM bindings, and an interactive web demo.

## Architecture

```
lasinfon/
 crates/
    core          # Pure computation engine (no_std, zero IO)
    state         # State transfer equations and multitick simulation
    monte-carlo   # Ensemble forecast with Gaussian noise injection
    config        # Layered configuration loading and merging
    cli           # Commandline interface (run, simulate)
    wasm          # WebAssembly bindings + standalone dashboard
 docs/             # User guides, AI assessment manual, roadmap
 presets/          # Prebuilt city, platform, and audience parameter overlays
 config/           # Default configuration files
 examples/         # Example input JSON files
```

## Quick Start

### 1. Install Rust

You need a recent Rust toolchain (edition 2021). Install via [rustup](https://rustup.rs/):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. Clone & Build

```bash
git clone git@github.com:yourname/lasinfon.git
cd lasinfon
cargo build --release -p lasinfon-cli
```

### 3. Run a Deterministic Forecast

```bash
./target/release/lasinfon run \
  --config config/default.json \
  --input example_input.json
```

This prints a JSON result with exposure index `G`, growth multiplier ``, field evolution, and classification labels.

### 4. Run a MultiTick Simulation

```bash
./target/release/lasinfon simulate \
  --config config/default.json \
  --input example_input.json \
  --max-ticks 15 \
  --sigma 0.05 \
  --seed 42
```

Adds Gaussian noise (`sigma`) and produces a time series of records showing how active node ratio `C_t` and coherent exposure `G` evolve.

### 5. Layer Presets (Cities, Platforms, Audiences)

Preset files contain only the parameters that differ from the defaults. They are merged lefttoright:

```bash
./target/release/lasinfon simulate \
  --config config/default.json \
  --config presets/cities/second_tier_city.json \
  --config presets/platforms/short_video.json \
  --config presets/audiences/gen_z.json \
  --input example_input.json \
  --max-ticks 10 \
  --sigma 0.1 \
  --seed 123
```

Available presets:
- **Cities**: `high_density_metro`, `second_tier_city`, `global_hub`
- **Platforms**: `short_video`, `image_sharing`, `professional_network`
- **Audiences**: `gen_z`, `young_women`, `parents`

All names are abstract (no real brand names).

## Input Preparation

A template with every field and recommended confidence scores is provided:

```bash
cp input_template.json my_content.json
# edit my_content.json following docs/ai_assessment_guide.md
```

The assessment guide explains each parameter on a 010 scale with concrete anchors.

## AIAssisted Parameter Estimation

You can use any LLM as a "parameter compiler" by providing the prompt in `docs/ai_evaluator_prompt.md`. The AI will produce a filled `input_template.json` ready for simulation.

## Web Demo (Standalone, No Dependencies)

```bash
cd crates/wasm
wasm-pack build --target web
cp -r pkg www/pkg
cd www
python3 -m http.server 8000
```

Open `http://localhost:8000`. Select a scenario, tweak parameters, and click Run Simulation. A realtime canvas shows atomic polarisation and exposure curves.

## Documentation

- `docs/ai_assessment_guide.md`  How to score content, audience, and environment.
- `docs/ai_evaluator_prompt.md`  LLM system prompt for automated JSON generation.
- `docs/ROADMAP.md`  Planned features (parameterlevel confidence perturbations, ensemble CLI, etc.).

## License

MIT  see [LICENSE](LICENSE).

## Contributing

Pull requests are welcome. Please ensure code compiles with `cargo check --workspace` and all tests pass with `cargo test --workspace`. Follow the existing code style (English identifiers, no hardcoded magic numbers).

---

**Lasinfon v5.1.2**  *Predict the propagation, not the message.*
```

Let me know if you'd like me to adjust any section or add a license file.
