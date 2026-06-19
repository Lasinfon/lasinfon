```markdown
# Lasinfon

****

Lasinfon 

> ****

## 

`v5.1.2`  CLI WASM 

## 

```
lasinfon/
 crates/
    core          # no_std IO
    state         # 
    monte-carlo   # 
    config        # 
    cli           # run, simulate
    wasm          # WebAssembly  + 
 docs/             # AI 
 presets/          # 
 config/           # 
 examples/         #  JSON 
```

## 

### 1.  Rust

 Rust edition 2021 [rustup](https://rustup.rs/) 

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

 JSON `G` ``

### 4. 

```bash
./target/release/lasinfon simulate \
  --config config/default.json \
  --input example_input.json \
  --max-ticks 15 \
  --sigma 0.05 \
  --seed 42
```

 (`sigma`) `C_t`  `G` 

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


- ****`high_density_metro``second_tier_city``global_hub`
- ****`short_video``image_sharing``professional_network`
- ****`gen_z``young_women``parents`



## 



```bash
cp input_template.json my_content.json
#  docs/ai_assessment_guide.md  my_content.json
```

 010 

## AI 

 `docs/ai_evaluator_prompt.md`  AI JSON

## 

```bash
cd crates/wasm
wasm-pack build --target web
cp -r pkg www/pkg
cd www
python3 -m http.server 8000
```

 `http://localhost:8000`

## 

- `docs/ai_assessment_guide.md`  
- `docs/ai_evaluator_prompt.md`   JSON  LLM 
- `docs/ROADMAP.md`  ensemble 

## 

MIT   [LICENSE](LICENSE)

## 

 Pull Request `cargo check --workspace` `cargo test --workspace`

---

**Lasinfon v5.1.2**
```
