# Lasinfon
** | **

[![](https://img.shields.io/badge/language-Rust-orange.svg)](https://www.rust-lang.org/)
[![](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)

Lasinfon **** Infon

> ****

---

## 
 `v5.1.2`CLI  WASM `wasm32-unknown-unknown` Canvas 

---

## 
```text
lasinfon/
  crates/
      core          #  I/O
      state         # 
      monte-carlo   # 
      config        # 
      cli           # 
      wasm          # WebAssembly  +  Canvas 
  docs/              # AI 
  presets/           # 
  config/            #  JSON 
  examples/          #  JSON 
```

---

## 
### 1. Rust 
 Rust 2021  [rustup](https://rustup.rs/) 

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. 
```bash
git clone git@github.com:yourname/lasinfon.git
cd lasinfon
cargo build --release -p lasinfon-cli
```

### 3. 

```bash
./target/release/lasinfon run \
  --config config/default.json \
  --input example_input.json
```
 JSON  `G` `\Lambda` `TrueSelfGrowth` 

### 4. 
$\sigma$
```bash
./target/release/lasinfon simulate \
  --config config/default.json \
  --input example_input.json \
  --max-ticks 15 \
  --sigma 0.05 \
  --seed 42
```

### 5. 
[1, 2]
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
*   ****`high_density_metro``second_tier_city``global_hub`
*   ****`short_video``image_sharing``professional_network`
*   ****`gen_z`Z`young_women``parents`

**

---

##  AI 


```bash
cp input_template.json my_content.json
#  docs/ai_assessment_guide.md  my_content.json
```

### AI 
 `docs/ai_evaluator_prompt.md`  ClaudeGPT****AI  `input_template.json` 

---

##  Web 
 `lasinfon`  WebAssembly  `wasm32-unknown-unknown` [1] I/O  [1, 2]

```bash
# 1.  WASM  wasm-pack
cd crates/wasm
wasm-pack build --target web

# 2.  crate 
python3 -m http.server 8000
```

 `http://localhost:8000`  Canvas $C_t$$G$ JavaScript 

---

## 
*   [`docs/ai_assessment_guide.md`](docs/ai_assessment_guide.md)  0-10 
*   [`docs/ai_evaluator_prompt.md`](docs/ai_evaluator_prompt.md)  
*   [`docs/ROADMAP.md`](docs/ROADMAP.md)   CLI 

---

## 
 Apache License 2.0 

## 
 `cargo check --workspace`  `cargo test --workspace` 

---
**Lasinfon v5.1.2**
