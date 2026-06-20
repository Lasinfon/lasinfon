# Lasinfon

**Social Laser Dynamics Engine**  Autonomous Propagation Simulation System

[![Language](https://img.shields.io/badge/language-Rust-orange.svg)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)

Lasinfon is an industrial-grade, fully parameterized simulation engine designed to model and predict information propagation dynamics in social networks using the principles of **Social Laser Dynamics**. By treating raw content as "signal light" (Infon) and target audiences as a "gain medium" inside a resonant social cavity, Lasinfon simulates state-changing transitions, stimulated emissions, and quantum-like phase transitions of social atoms.

> **Warning**: This repository contains no core mathematical descriptions. For the complete theoretical derivation of the rate equations, please refer to the internal *Theory Master Document*.

---

## Project Status

`v5.1.2`  Fully implemented deterministic pipeline, multi-tick state evolution, Monte Carlo ensemble forecasting, CLI parameter overloading, standard WASM bindings (`wasm32-unknown-unknown`), and an offline standalone Canvas dashboard.

---

## Architecture

```text
lasinfon/
  crates/
      core          # Pure computation engine (no_std, zero I/O, rate equations)
      state         # State transfer equations and multi-tick simulation
      monte-carlo   # Ensemble forecast with Gaussian noise injection
      config        # Layered configuration loading and semantic merging
      cli           # Command-line interface (run, simulate)
      wasm          # WebAssembly bindings + standalone canvas dashboard
  docs/              # User guides, AI assessment manual, and system prompts
  presets/           # Prebuilt city, platform, and audience parameter overlays
  config/            # Default configuration JSON files
  examples/          # Example input JSON files
```

---

## Quick Start

### 1. Prerequisite (Rust Toolchain)
Ensure you have a recent Rust toolchain installed (Edition 2021). Install via [rustup](https://rustup.rs/):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. Clone & Compile

```bash
git clone git@github.com:yourname/lasinfon.git
cd lasinfon
cargo build --release -p lasinfon-cli
```

### 3. Run a Deterministic Forecast
Execute a single-step simulation under standard environment parameters:

```bash
./target/release/lasinfon run \
  --config config/default.json \
  --input example_input.json
```

This outputs a structured JSON payload containing the exposure index `G`, the self-growth multiplier `\Lambda`, subsequent field states, and classification labels (e.g., `TrueSelfGrowth`).

### 4. Run a Multi-Tick Lifecycle Simulation
Run a multi-step propagation path. Adds system-level Gaussian noise ($\sigma$) to evaluate phase transitions over time:

```bash
./target/release/lasinfon simulate \
  --config config/default.json \
  --input example_input.json \
  --max-ticks 15 \
  --sigma 0.05 \
  --seed 42
```

### 5. Multi-Layer Preset Overloading (Zero-Code Presets)
Preset files contain only the parameters that differ from the defaults. They are merged sequentially from left-to-right (right overrides left) before type-safety deserialization [1, 2]:

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

#### Available Presets:
*   **Cities**: `high_density_metro`, `second_tier_city`, `global_hub`
*   **Platforms**: `short_video`, `image_sharing`, `professional_network`
*   **Audiences**: `gen_z`, `young_women`, `parents`

*(Note: All platform and geography names are kept abstract and de-branded to preserve theoretical integrity.)*

---

## Input Preparation & AI-Assisted Assessment

To bridge the gap between raw social media content and the mathematical input parameters, we provide a structured measurement protocol:

```bash
cp input_template.json my_content.json
# Edit my_content.json following docs/ai_assessment_guide.md
```

###  AI-Automated Parameter Estimation
You can leverage advanced Large Language Models (e.g., Claude, GPT) as **"parameter compilers"** by feeding them the specialized system prompt located in `docs/ai_evaluator_prompt.md`. The AI will parse your raw content (text, scripts, or URLs) and output a standardized `input_template.json` ready for simulation.

---

## Standalone Web Demo (Zero-Dependency & Zero-Copy)

We compile `lasinfon` into a pure, headless WebAssembly module targetting `wasm32-unknown-unknown` [1]. It has zero I/O or OS dependencies, guaranteeing flawless execution [1, 2].

```bash
# 1. Compile WASM target (ensure wasm-pack is installed)
cd crates/wasm
wasm-pack build --target web

# 2. Spin up a local static server directly inside the crate directory
python3 -m http.server 8000
```

Open your browser and navigate to `http://localhost:8000`. You can select presets, tweak parameters, and trigger the physical rate-equations in real-time. A pure, lightweight Canvas script will render atomic polarization ($C_t$) and exposure curves ($G$) without loading a single line of external JavaScript dependencies.

---

## Documentation

*   [`docs/ai_assessment_guide.md`](docs/ai_assessment_guide.md)  Standardized scoring anchors (010 scale) for content, audience, and environment.
*   [`docs/ai_evaluator_prompt.md`](docs/ai_evaluator_prompt.md)  Structured System Prompt for Agentic automatic parameter estimation.
*   [`docs/ROADMAP.md`](docs/ROADMAP.md)  Future development phases (Parameter-level confidence perturbations, Monte Carlo CLI integration, etc.).

---

## License

This project is licensed under the Apache License 2.0.

## Contributing

Contributions must compile warning-free with `cargo check --workspace` and pass all tests via `cargo test --workspace`. Please adhere to the established domain language (uppercase notation for physical constants where appropriate, clear documentation for variables).

---

**Lasinfon v5.1.2**  *Predict the propagation, not the message.*

## 💡 Input Validation & Auto-Fill

If your input JSON is missing required fields, Lasinfon will report them and abort.  
Use the `--auto-fill` flag to automatically fill missing fields with sensible defaults:

```bash
./target/release/lasinfon simulate \
  --config config/default.json \
  --input my_partial_input.json \
  --auto-fill
```

*Note: Always prefer providing a complete input (see AI-assisted assessment above). Use `--auto-fill` as a safety net.*
