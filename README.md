# Lasinfon

**Social Laser Dynamics Engine** • Autonomous Propagation Simulation System

[![Language](https://img.shields.io/badge/language-Rust-orange.svg)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)

Lasinfon is an industrial-grade, fully parameterized simulation engine designed to model and predict information propagation dynamics in social networks using the principles of **Social Laser Dynamics**. By treating raw content as "signal light" (Infon) and target audiences as a "gain medium" inside a resonant social cavity, Lasinfon simulates state-changing transitions, stimulated emissions, and quantum-like phase transitions of social atoms.

> **Warning**: This repository contains no core mathematical descriptions. For the complete theoretical derivation of the rate equations, please refer to the internal *Theory Master Document*.

---

## Project Status

`v6.1.1`  Fully implemented deterministic pipeline, multi-tick state evolution, Monte Carlo ensemble forecasting, CLI parameter overloading, standard WASM bindings (`wasm32-unknown-unknown`), and an advanced **Standard Reference Projection (SRP)** dual-track simulation. The user interface has been completely upgraded to a premium, Dribbble-inspired light-themed Next.js/React dashboard with smooth SVG vector graphs and a Ginlix-inspired onboarding wizard.

---

## Architecture

```text
lasinfon/
  crates/
      core          # Pure computation engine (no_std, zero I/O, rate equations)
      state         # State transfer equations and multi-tick timeline simulation
      monte-carlo   # Ensemble forecast with Gaussian noise injection
      config        # Layered configuration loading and semantic merging
      cli           # Command-line interface (run, simulate)
      wasm          # WebAssembly bindings + high-fidelity Next.js & static dashboards
  docs/              # User guides, AI assessment manual, and system prompts
  presets/           # Prebuilt city, platform, and audience parameter overlays
  config/            # Default configuration JSON files
  examples/          # Example input JSON files
```

---

## Quick Start

### 1. Prerequisite (Rust Toolchain & Wasm-Pack)
Ensure you have a recent Rust toolchain installed (Edition 2021). Install via [rustup](https://rustup.rs/):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

To compile WebAssembly bindings, install [wasm-pack](https://rustwasm.github.io/wasm-pack/):
```bash
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

### 2. Clone & Compile CLI

```bash
git clone git@github.com:yourname/lasinfon.git
cd lasinfon
cargo build --release -p lasinfon-cli
```

### 3. Run a Deterministic Forecast
Execute a single-step simulation. In `v6.1.1`, the output includes both the active outcome `G` and the **Standard Potential (`G_std`)** via Standard Reference Projection (SRP) along with the **Environmental Multiplier (`K_mult`)**:

```bash
./target/release/lasinfon run \
  --config config/default.json \
  --input example_input.json
```

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
Preset files contain only the parameters that differ from the defaults. They are merged sequentially from left-to-right (right overrides left) before type-safety deserialization:

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

---

## Input Preparation & AI-Assisted Assessment

To bridge the gap between raw social media content and the mathematical input parameters, we provide a structured measurement protocol:

```bash
cp input_template.json my_content.json
# Edit my_content.json following docs/ai_assessment_guide.md
```

###  AI-Automated Parameter Estimation (BARS 5-Point System)
You can leverage advanced Large Language Models (e.g., Claude, GPT) as **"parameter compilers"** by feeding them the specialized system prompt located in `docs/ai_evaluator_prompt.md`. The AI will parse your raw content (text, scripts, or URLs) and output a standardized, calibrated `input_template.json` ready for simulation.

---

## Premium Web Dashboard & Local Web Server

Lasinfon v6.1.1 features a premium, responsive Web Dashboard compiled into headless WebAssembly with zero standard runtime or OS dependencies.

### 1. Compile WASM Targets
```bash
# Compile and copy binary assets to static web directories
cd crates/wasm
wasm-pack build --target web
cp -R pkg/* www/pkg/
cp -R pkg/* www/web/public/pkg/
```

### 2. Run Personal Local Tester (Static HTML)
Use our adaptive Python server script which resolves macOS WebAssembly MIME type mapping issues:
```bash
python3 crates/wasm/server.py
# Navigate to: http://localhost:8000/www/index.html in your browser
```

### 3. Run SaaS Web Cockpit (Next.js & Tailwind CSS v4)
To experience the high-fidelity, Dribbble-inspired light-themed dashboard with vector SVG graphics and a Ginlix onboarding wizard:
```bash
cd crates/wasm/www/web
npm run dev
# Navigate to: http://localhost:3000 in your browser
```

---

## Documentation

*   [`docs/ai_assessment_guide.md`](docs/ai_assessment_guide.md)  BARS 5-point metrology and scoring anchors for content, audience, and environment.
*   [`docs/ai_evaluator_prompt.md`](docs/ai_evaluator_prompt.md)  Calibrated complete System Prompt for Agentic automatic parameter estimation.
*   [`docs/ai_result_interpreter_prompt.md`](docs/ai_result_interpreter_prompt.md)  AI Diagnostic Interpreter Prompt for Web Chat.
*   [`docs/ROADMAP.md`](docs/ROADMAP.md)  The official Lasinfon v6.1.1 Upgrade Plan Whitepaper and roadmap.

---

## License

This project is licensed under the Apache License 2.0.

## Contributing

Contributions must compile warning-free with `cargo check --workspace` and pass all tests via `cargo test --workspace`. Please adhere to the established domain language (uppercase notation for physical constants where appropriate, clear documentation for variables).

---

**Lasinfon v6.1.1**  *Predict the propagation, not the message.*
