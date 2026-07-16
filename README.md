# Lasinfon

**Social Laser Dynamics Engine** • Autonomous Propagation & Sequential Retention Simulation System

[![Language](https://img.shields.io/badge/language-Rust-orange.svg)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)

Lasinfon is an industrial-grade, fully parameterized simulation engine designed to model and predict information propagation dynamics in social networks using the principles of **Social Laser Dynamics**. By treating raw content as "signal light" (Infon) and target audiences as a "gain medium" inside a resonant social cavity, Lasinfon simulates state-changing transitions, stimulated emissions, and quantum-like phase transitions of social atoms.

> **Warning**: This repository contains no core mathematical descriptions. For the complete theoretical derivation of the rate equations, please refer to the internal *Theory Master Document*.

---

## Project Status

`v6.3.0`  Fully implemented four decoupled, high-fidelity physical propagation solvers:
1.  **StandardSolver (Track 1)**: Measures the copy's absolute inherent potential ($G_{\text{std}}$) under standard vacuum reference conditions ($K=1.0, A_{\text{algo}}=1.0$) [5].
2.  **ActiveSolver (Track 2)**: Simulates active environment campaigns with dynamic audience attention decay and platform algorithmic recommended decay [5].
3.  **EmergenceSolver (Track 3)**: Models high-energy public opinion phase transitions (polarization confrontation & memetic mutation) with strict $10.0x$ saturation clamping.
4.  **CascadeSolver (Track 4)**: Evaluates sequential campaigns (serialized novels, short dramas, consecutive news events) using time-interval memory decay, aesthetic fatigue recursive baselines, and a first-impression threshold barrier.

The user interface features a premium, responsive Web Dashboard compiled into headless WebAssembly (Retina-ready vector SVG lines, dynamic hover tooltips, and a parameter-source validation inspector card) paired with a Ginlix-inspired onboarding wizard.

---

## Architecture

```text
lasinfon/
  crates/
      core          # Pure computation engine (no_std, zero I/O, rate equations)
      state         # Solvers sub-workspace (Standard, Active, Cascade, Emergence) and state transfer
      monte-carlo   # Ensemble forecast with SHA-256 deterministic master-seed splitting
      config        # Layered configuration loading and semantic merging
      cli           # Command-line interface (run, simulate)
      wasm          # WebAssembly bindings + high-fidelity Next.js & static dashboards
  docs/              # User guides, AI assessment manuals, and pluggable system prompts
  presets/           # Prebuilt platform and audience parameter overlays
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
Execute a single-step simulation. In `v6.3.0`, the output includes the active outcome `G`, the **Standard Potential (`G_std`)** via Standard Reference Projection (SRP), and the **Environmental Multiplier (`K_mult`)**:

```bash
./target/release/lasinfon run \
  --config config/default.json \
  --input example_input.json
```

### 4. Run a Multi-Tick Lifecycle Simulation
Run a multi-step propagation path. Adds system-level Gaussian noise ($\sigma$) to evaluate phase transitions over time with SHA-256 audit-reproducible random seeds:

```bash
./target/release/lasinfon simulate \
  --config config/default.json \
  --input example_input.json \
  --max-ticks 20 \
  --sigma 0.05 \
  --seed 123
```

---

## Input Preparation & AI-Assisted Assessment

To bridge the gap between raw social media content and the mathematical input parameters, we provide a structured measurement protocol:

```bash
cp input_template.json my_content.json
# Edit my_content.json following docs/ai_assessment_guide.md
```

### AI-Automated Parameter Estimation (BARS 5-Point System)
You can leverage advanced Large Language Models (e.g., Claude, GPT, DeepSeek) as **"parameter compilers"** by feeding them the specialized system prompt located in `docs/ai_evaluator_prompt.md`. The AI will parse your raw content (text, scripts, or URLs) and output a standardized `input_template.json` ready for simulation.

---

## Premium Web Dashboard & Local Web Server

Lasinfon v6.3.0 features a premium, responsive Web Dashboard compiled into headless WebAssembly with zero standard runtime or OS dependencies.

### 1. Compile WASM Targets
```bash
# Compile and copy binary assets to static web directories
cd crates/wasm
wasm-pack build --target web
cp -R pkg/* www/pkg/
cp -R pkg/* www/web/public/pkg/
```

### 2. Run Personal Local Tester (Static HTML)
Use our adaptive Python server script which resolves macOS WebAssembly MIME type mapping and serves the directory directly:
```bash
python3 crates/wasm/server.py
# Navigate to: http://localhost:8000 in your browser (no sub-folders needed)
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
*   [`docs/ai_serial_coherence_prompt.md`](docs/ai_serial_coherence_prompt.md)  Serial Coherence prompt for cascading multi-episode campaigns.
*   [`docs/ai_result_interpreter_prompt.md`](docs/ai_result_interpreter_prompt.md)  AI Diagnostic Interpreter Prompt for Web Chat.
*   [`docs/ROADMAP.md`](docs/ROADMAP.md)  The official Lasinfon v6.3.0 Upgrade Plan Whitepaper and roadmap.

---

## License

This project is licensed under the Apache License 2.0.

## Contributing

Contributions must compile warning-free with `cargo check --workspace` and pass all tests via `cargo test --workspace`. Please adhere to the established domain language (uppercase notation for physical constants where appropriate, clear documentation for variables).

---

**Lasinfon v6.3.0**  *Predict the propagation, not the message.*