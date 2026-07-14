# Lasinfon

****  

[![](https://img.shields.io/badge/language-Rust-orange.svg)](https://www.rust-lang.org/)

[![](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)

Lasinfon **** Infon

> ****

---

## 

`v6.1.1`  CLI  WASM `wasm32-unknown-unknown`**SRP** Dribbble  Next.js/React  SVG  Ginlix 

---

## 

```text
lasinfon/
  crates/
      core          # no_std I/O
      state         # 
      monte-carlo   # 
      config        # 
      cli           # 
      wasm          # WebAssembly  +  Next.js 
  docs/              # AI 
  presets/           # 
  config/            #  JSON 
  examples/          #  JSON 
```

---

## 

### 1. Rust  Wasm-Pack

 Rust 2021  [rustup](https://rustup.rs/) 

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

 WebAssembly  [wasm-pack](https://rustwasm.github.io/wasm-pack/)

```bash
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

### 2.  CLI

```bash
git clone git@github.com:yourname/lasinfon.git
cd lasinfon
cargo build --release -p lasinfon-cli
```

### 3. 

 `v6.1.1`  `G`SRP**`G_std`****`K_mult`**

```bash
./target/release/lasinfon run \
  --config config/default.json \
  --input example_input.json
```

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

##  AI 



```bash
cp input_template.json my_content.json

#  docs/ai_assessment_guide.md  my_content.json
```

### AI BARS 5

 `docs/ai_evaluator_prompt.md`  ClaudeGPT****AI  URL `input_template.json` 

---

##  Web 

Lasinfon v6.1.1  Web  WebAssembly 

### 1.  WASM 

```bash
#  Web 
cd crates/wasm
wasm-pack build --target web
cp -R pkg/* www/pkg/
cp -R pkg/* www/web/public/pkg/
```

### 2. 

 Python  macOS  WebAssembly MIME 

```bash
python3 crates/wasm/server.py

# http://localhost:8000/www/index.html
```

### 3.  SaaS Web Next.js & Tailwind CSS v4

 Dribbble  SVG  Ginlix 

```bash
cd crates/wasm/www/web
npm run dev

# http://localhost:3000
```

---

## 

*   [`docs/ai_assessment_guide.md`](docs/ai_assessment_guide.md)   BARS 5
*   [`docs/ai_evaluator_prompt.md`](docs/ai_evaluator_prompt.md)  
*   [`docs/ai_result_interpreter_prompt.md`](docs/ai_result_interpreter_prompt.md)   AI 
*   [`docs/ROADMAP.md`](docs/ROADMAP.md)  Lasinfon v6.1.1 

---

## 

 Apache License 2.0 

## 

 `cargo check --workspace`  `cargo test --workspace` 

---

**Lasinfon v6.1.1**  **
