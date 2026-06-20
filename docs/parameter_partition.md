# Parameter Controllability Partition

All input parameters are classified into three zones based on the user's ability to modify them. This partition is critical for generating actionable optimization suggestions—only parameters in the "Controllable" zone can be tuned by the content creator.

## Zone 1: Controllable (治己 · Self-Governance)

Parameters that the content creator can directly change through editing, rewriting, or presentation choices.

| Parameter | Location | What to Change |
| :--- | :--- | :--- |
| **Seed Potential E** (all 19 factors) | `scores.*` | Rewrite content: increase emotion arousal, add practical value, improve narrative structure, enhance uniqueness/strangeness, add credible sources, add personal touch. |
| **L_cognitive** | `env.L_cognitive` | Simplify language, use concrete examples, reduce jargon. |
| **L_operational** | `env.L_operational` | Add one-click share buttons, remove unnecessary interaction steps. |
| **L_antipathy** | `env.L_antipathy` | Soften controversial phrasing, add disclaimers, use humor to defuse tension. |
| **content_emotion_intensity** | `env.content_emotion_intensity` | Amplify or tone down emotional charge by rewriting hooks, headlines, or visuals. |
| **audience_resonance_match** | `env.audience_resonance_match` | Research target audience's pre-existing sentiments and align content tone/angle accordingly. |

## Zone 2: Semi-Controllable (寻地 · Seek Favorable Ground)

Parameters that can be influenced by choosing a different platform or community, but cannot be changed after posting.

| Parameter | Location | What to Choose |
| :--- | :--- | :--- |
| **A_algo** (algorithmic amplification) | `field.A_algo` | Select platforms with stronger organic reach (e.g., short-video platforms over professional networks). |
| **share_circle_preference** | `meme.share_circle_preference` | Choose communities that prefer public sharing vs. private group sharing. |
| **population_density** | `env.population_density` | Select high-traffic platforms or active sub-communities. |
| **connectivity** | `env.connectivity` | Prefer platforms with strong social graph density (friends, groups). |

## Zone 3: Fixed External (顺天 · Accept the Climate)

Parameters that are determined by the macro environment, platform policy, or competitive landscape. The user cannot change them; they must be treated as boundary conditions.

| Parameter | Location | Nature |
| :--- | :--- | :--- |
| **K_pot** (environmental potential) | `field.K_pot_t` | Social mood, seasonal trends, news cycle—large-scale forces outside individual control. |
| **K_comp** (competition crowding) | `field.K_comp` | Number of competing content pieces vying for the same audience. |
| **K_soil** (population × connectivity base) | `field.K_soil` | Inherent structural property of the platform. |
| **T** (threat index) | `field.T` | Platform censorship or regulatory pressure. |
| **T_effective** (effective threat) | `field.T_effective` | Net suppressive force after factoring in parasitic protection. |
| **Ω** (Q-switch) | auto-calculated | Triggered by extreme suppression + high resonance; cannot be manually controlled. |

## ROI Guidance Principle

When the system generates optimization suggestions:
1. First acknowledge the **Fixed External** constraints (e.g., "This topic faces heavy moderation. We must work within these limits.")
2. Then rank **Controllable** parameters by **effort-to-impact ratio (ROI)**:
   - High ROI: Small edit → large gain (e.g., simplify a headline, raise L_cognitive).
   - Low ROI: Large effort → small gain (e.g., obtain formal endorsement to lower L_suspicion).
3. **Semi-controllable** parameters are suggested as strategic pivots (e.g., "Consider shifting this content to Platform X where A_algo is higher").
