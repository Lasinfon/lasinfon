---
date created: ,  24 2026, 6:06:39 
date modified: ,  6 2026, 3:22:18 
---
#   

[![](https://img.shields.io/badge/language-Rust-orange.svg)](https://www.rust-lang.org/)
[![](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)

Lasinfon **Social Laser Dynamics**Infon

> ****  

---

## 

`v5.1.2`  multi-tickPreset Overloading WASM `wasm32-unknown-unknown` Canvas 

---

## 

```text
lasinfon/
  crates/
      core          #  ( no_std,  I/O, )
      state         # 
      monte-carlo   # 
      config        # 
      cli           #  (run, simulate )
      wasm          #  WebAssembly  +  Canvas 
  docs/              # AI  (Prompt)
  presets/           # 
  config/            #  JSON 
  examples/          #  JSON 
```

---

## 

### 1.  (Rust )
 Rust Edition 2021 [rustup](https://rustup.rs/) 

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. 

```bash
git clone git@github.com:yourname/lasinfon.git
cd lasinfon
cargo build --release -p lasinfon-cli
```

### 3.  (Deterministic Forecast)


```bash
./target/release/lasinfon run \
  --config config/default.json \
  --input example_input.json
```

 JSON  `G` `\Lambda` `TrueSelfGrowth`

### 4.  (Multi-Tick Simulation)
$\sigma$

```bash
./target/release/lasinfon simulate \
  --config config/default.json \
  --input example_input.json \
  --max-ticks 15 \
  --sigma 0.05 \
  --seed 42
```

 `C_t` `G` 

### 5.  (Layer Presets)
Preset AST  [1, 2]

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

#### 
*   **Cities**`high_density_metro` (), `second_tier_city` (), `global_hub` ()
*   **Platforms**`short_video` (), `image_sharing` (), `professional_network` ()
*   **Audiences**`gen_z` (Z), `young_women` (), `parents` ()

*()*

---

##  AI 



```bash
cp input_template.json my_content.json
#  docs/ai_assessment_guide.md  my_content.json 
```

###  AI  (AIGC )
 Claude 3.5GPT-4**** [`docs/ai_evaluator_prompt.md`](docs/ai_evaluator_prompt.md) AI  `input_template.json` 

---

##  Web  ()

 `lasinfon-core`  I/O  WebAssembly `wasm32-unknown-unknown` [1]

```bash
# 1.  WASM ( wasm-pack)
cd crates/wasm
wasm-pack build --target web

# 2. 
python3 -m http.server 8000
```

 `http://localhost:8000` Canvas $C_t$$G$ JavaScript 

---

## 

*   [`docs/ai_assessment_guide.md`](docs/ai_assessment_guide.md)  0-10 
*   [`docs/ai_evaluator_prompt.md`](docs/ai_evaluator_prompt.md)   System Prompt
*   [`docs/ROADMAP.md`](docs/ROADMAP.md)   CLI 

---

## 

 Apache License 2.0 

## 

 Pull Requests `cargo check --workspace`  [1, 2] API  LaTeX
