# Lasinfon AI Assessment & Metrology Guide v6.1

This document provides the official metrological standard for converting raw copy/text into structured inputs required by the Lasinfon simulation engine (v5.1.2/v6.1). 

Lasinfon operates on the **Ruler Paradigm**: it does not predict absolute sales or define what a "hit" is. It acts as a standardized vernier caliper measuring **Standard Potential ($G_{\text{std}}$)** and **Environmental Multiplier ($K_{\text{mult}}$)**. Defining business success is left entirely to the user, who calibrates Lasinfon’s scores against their unique industry conversion curves.

---

## 1. Core Metrology: Decoupling Content from Environment

To protect the rating accuracy and prevent "attention dilution" in large language models (LLMs), v6.1 strictly separates content evaluation from environmental variables:

- **LLM Evaluator (Call 1 - Scorer)**: Only evaluates the **11 Seed Scores** (intrinsic content quality) using three highly aligned **5-point Behaviorally Anchored Rating Scales (BARS)**. It does NOT touch environment or audience parameters.
- **Environment Inputs (K-factor)**: Sourced objectively from platform presets, search trends APIs (e.g., Google Trends), and automated SERP title similarity calculations.
- **WASM Mapping Layer**: Linearly stretches the LLM’s 5-point outputs into the Rust engine's $0.0 \sim 10.0$ domain, applying strict boundary clamping.

---

## 2. The 3-Template 5-Point BARS Framework (Seed Scores)

LLMs achieve maximum expert-level alignment on a 5-point BARS scale rather than a loose 10-point absolute scale. Evaluate the 11 Seed factors by matching the text features against the three universal templates below.

### Template 1: Content & Narrative Quality
*Applied to: `practical_value`, `narrative_completeness`, `source_credibility`, `personification`*
* **1 (Terrible)**: Broken logic, completely chaotic, highly untrustworthy, or purely corporate-robotic.
* **2 (Below Average)**: Mediocre, low-value information, weak credibility/logic, flat and uninspiring tone.
* **3 (Average)**: Clear, logically coherent, standard utility, average narrative structure, reasonable trustworthiness.
* **4 (Great)**: High professional utility, strong narrative tension, credible evidence/references, high personification with warm tone.
* **5 (Masterclass)**: Flawless narrative arc, masterclass rhetoric, ironclad authority/trustworthiness, deeply humanized and unforgettable tone.

### Template 2: Emotion & Resonance
*Applied to: `content_emotion_arousal`, `social_currency_attr`*
* **1 (Terrible)**: Completely dry, purely informative, triggers zero emotional response or curiosity.
* **2 (Below Average)**: Minor ripple; readers slightly notice but remain largely indifferent.
* **3 (Average)**: Noticeable emotional resonance; triggers curiosity, amusement, mild worry, or intent to read.
* **4 (Great)**: Deep emotional hook; triggers strong empathy, awe, anger, or intense vanity (wanting to share to look good).
* **5 (Masterclass)**: Triggers intense physiological response (heart racing, tears, chills) or an irresistible primal urge to share immediately.

### Template 3: Cognitive Arbitrage & Innovation
*Applied to: `uniqueness`, `innovation`, `enhancement`, `strangeness`, `remix_openness`*
* **1 (Terrible)**: Highly redundant, generic platitudes, uses outdated narrative cliches.
* **2 (Below Average)**: Minor optimizations, largely fighting in a red-ocean paradigm; zero structural surprise.
* **3 (Average)**: Localized novelty; offers useful upgrades or a slightly fresh perspective on existing ideas.
* **4 (Great)**: High cognitive arbitrage; introduces a fresh dimension of observation/solution with high informational advantage.
* **5 (Masterclass)**: Extreme paradigm arbitrage; completely flips the reader's cognitive balance (e.g., Elon Musk's 10x value/cost ratio), triggers cognitive phase-transition.

### 5-to-10 Linear Scaling & Clamping Formula
Before entering the Rust simulation engine, each 5-point score ($S_{\text{LLM}}$) is converted via:
$$ S_{\text{raw}} = (S_{\text{LLM}} - 1) \times 2.5 $$
$$ S_{\text{final}} = \max(0.0, \min(10.0, S_{\text{raw}})) $$

---

## 3. Objective Sourcing for Meme & Environment Parameters

To maintain physical objectivity, environmental inputs must be sourced from real-world data feeds or pre-calibrated audience templates, completely bypassing LLM content evaluation:

1. **`population_density` & `connectivity` (K_soil components)**:
   Pre-configured in the platform's audience preset file (e.g., Douyin Beauty channel has a high baseline density and connectivity, loaded automatically).
2. **`surge_match` & `current_direction` (K_pot components)**:
   Sourced from real-time trends APIs. If the copy's keywords match active trending search volume, the environment potential $K_{\text{pot}}$ is automatically increased.
3. **`raw_suppression` (K_comp component)**:
   Calculated on the backend by fetching the Top 10 SERP titles for the target keywords and computing their **average semantic cosine similarity**. If homogeneity is high, competitive suppression increases ($K_{\text{comp}}$ decreases).
4. **`terrain_passability` (Channel Passability)**:
   A hybrid variable. Calculated by matching the **LLM compliance/genre tags** of the copy against the active platform wind-tunnel policy database. 
   - **Red Card (<=2.0)**: Direct compliance block. Freezes simulation, outputs risk highlights.
   - **Yellow Card (2.0 - 6.0)**: Soft restriction. Increases natural active node relaxation ($\lambda_C \times 2.0$), simulating traffic suppression.
   - **Green Card (>6.0)**: Normal passability.

---

## 4. Standard Reference Projection (SRP) & Double-Track Simulation

To isolate environmental wind speed and measure the copy's "pure physical length", Lasinfon runs a **double-track simulation** in the Rust engine:

*   **Track A: Standard Reference Projection (SRP)**:
    Forces the environment multiplier $K_{\text{std}} = 1.0$ (vacuum reference cavity). It retains the content's intrinsic $E$ and the audience's emotional resonance parameters ($R_t$, $\mu_{\text{psych}}$).
    - **Output**: $G_{\text{std}}$ (Standard Exposure Potential). This represents the copy's unamplified core strength. Highly comparable across categories.
*   **Track B: Active Environment Simulation**:
    Runs the simulation under the real-time active environmental parameters ($K_{\text{active}}$ ranging from 0 to 450).
    - **Output**: $G_{\text{active}}$ (Actual Simulated Exposure).
*   **Environmental Multiplier ($K_{\text{mult}}$)**:
    Exposed as:
    $$ K_{\text{mult}} = \frac{G_{\text{active}}}{G_{\text{std}}} $$
    *(Protected by an EPSILON guardrail: if $G_{\text{std}} < 10^{-5}$, $K_{\text{mult}} = 1.0$)*. This shows the exact amplification factor (wind speed) provided by the environment.

---

## 5. Summary of Calibration Lifecycle
1. **Calibration (Every 30 Days)**: Run 3 standard reference ISO copies (ISO-001 at 2.0, ISO-002 at 5.0, ISO-003 at 8.0) through the 5-point evaluation pipeline to detect LLM drift. Apply piecewise linear interpolation to correct subsequent scores.
2. **Measurement**: Run Call 1 to get $S_{\text{final}}$ and run the dual-track Rust simulation.
3. **Optional Diagnostics (Paywalled/Toggle)**: Run Call 2 to extract key highlight sentences, pitfalls, and compliance risks without diluting the scoring engine's cognitive bandwidth.
4. **User Mapping**: Users run campaigns, record G_std, and fit their private logistic regression curve ($Sales = f(G_{\text{std}})$) to predict conversion rates.

This metrology guide ensures that Lasinfon remains a rigid, highly reproducible, and scientifically grounded physical instrument for propagation dynamics.
