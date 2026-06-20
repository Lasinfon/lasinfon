# Comment Stream Calibration Guide

Real-world audience comments are the most honest "neuron feedback" from the gain medium. By analyzing a small sample of comments (5-10 is often enough), we can correct the initial simulation parameters and produce a more accurate "second forecast".

## Calibration Principle (Data Assimilation)

Per Section 10.4 of the theory master document:
- **Only exponent-layer parameters** (R, μ_psych, σ, γ coefficients) may be adjusted during calibration.
- **Base-layer parameters** (E, K, S) are fixed—they represent the fundamental properties of the content and platform.

## Comment-to-Parameter Mapping Table

| Comment Pattern | Affected Parameter | Correction Direction | Explanation |
| :--- | :--- | :--- | :--- |
| "Too expensive" / "Not worth it" | **μ_psych** (financial risk component) | ↑ increase L_antipathy by 1-2 points | Financial risk is a form of social risk—sharing expensive items may signal poor judgment. |
| "I don't understand" / "What does this mean?" | **S** via L_cognitive | ↑ increase L_cognitive by 1-3 points | High cognitive barrier prevents photon absorption. |
| "Is this real?" / "Seems fake" / "Source?" | **μ_psych** via L_suspicion | ↑ increase L_suspicion by 1-3 points | Trust deficit; audience doubts content authenticity. |
| "This is so me" / "Exactly what I feel" | **R** via audience_resonance_match | ↑ increase by 1-2 points | Strong resonance detected; content frequency perfectly matches audience absorption spectrum. |
| "Meh" / "So what?" / No reaction | **R** (overall) | ↓ decrease R by 1-2 points | Weak resonance; frequency mismatch. |
| "Sharing this!" / "Forwarding to my friends" | **social_currency_t** | ↑ increase by 1-2 points | High stimulated emission detected; social currency boost. |
| "I want one" / "Where to buy?" | **W** (willingness to pay) | ↑ increase W by 1-2 points | Purchase intent; enhance trust and uniqueness components. |
| Angry / hostile comments (on topic) | **Ω** (Q-switch potential) | Monitor T and circle_opposition | May indicate Q-switch trigger conditions building up. |
| Angry / hostile comments (off-topic / trolling) | No parameter change | — | Random noise, not useful for calibration. |

## Calibration Workflow

1. Collect the first 5-10 comments on a published piece.
2. Run them through an NLP sentiment classifier (or manual inspection).
3. Map each comment pattern to the affected parameter using the table above.
4. Adjust the initial `field` state in your input JSON (e.g., increase `mu_psych_t` by 1.0).
5. Re-run the simulation with the same config and updated field state.
6. Compare the new forecast with actual spread; iterate if necessary.

## Confidence Update

After calibration, the system's confidence in affected parameters should increase:
- Parameters corrected by hard comment evidence → confidence +2
- Parameters inferred from ambiguous comments → confidence +1
- Parameters untouched → confidence unchanged

This confidence update feeds into the v5.2.0 parameter-level perturbation system for more accurate ensemble forecasts.
