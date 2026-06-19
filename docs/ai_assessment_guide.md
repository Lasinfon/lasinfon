# Lasinfon AI Assessment Guide v5.1.2

This document provides the standard for converting raw content (text, video, image) into the structured input required by the Lasinfon simulation engine.  
All parameters use a **0–10 scale** unless otherwise noted.  

Each parameter should be accompanied by a **confidence score (0–10)**:
- 9–10: based on hard data or clear domain knowledge
- 6–8: based on experience and reasonable inference
- 3–5: subjective guess
- 0–2: pure speculation

## 1. Seed Scores (E-value factors)
These describe the *intrinsic quality and spectral fingerprint* of the content itself.

| Parameter | Description | Scoring Anchor |
| :--- | :--- | :--- |
| `content_emotion_arousal` | How emotionally intense is the content? (e.g., anger, joy, sadness) | 0 = neutral, 5 = noticeable emotion, 10 = extreme emotional charge |
| `social_currency_attr` | Does sharing this content make the sharer look good? (e.g., smart, funny, informed) | 0 = no social reward, 5 = modestly positive, 10 = highly desirable to share |
| `practical_value` | How practically useful is the information? (e.g., how-to, news, discounts) | 0 = useless, 5 = somewhat useful, 10 = instantly actionable |
| `uniqueness` | Contains rare or novel elements? | 0 = generic, 5 = somewhat different, 10 = completely unique |
| `innovation` | Presents old ideas in a new way? | 0 = clichéd, 5 = fresh twist, 10 = groundbreaking |
| `enhancement` | Is it significantly better than existing alternatives? | 0 = worse, 5 = comparable, 10 = far superior |
| `strangeness` | How visually or cognitively striking/unexpected is it? | 0 = mundane, 5 = slightly unusual, 10 = shocking |
| `narrative_completeness` | Storytelling structure (beginning, middle, end)? | 0 = fragmented, 5 = basic structure, 10 = masterfully told |
| `remix_openness` | How easy is it to remix, parody, or add to? | 0 = impossible, 5 = can be quoted, 10 = invites participation |
| `source_credibility` | Trustworthiness of the source (not the audience's trust). | 0 = anonymous rumor, 5 = medium credibility, 10 = official/verified |
| `personification` | Human face, personal story, or relatable character? | 0 = abstract, 5 = mild personalization, 10 = deeply personal |

## 2. Meme (Gain Medium Parameters)
These describe the *audience's inherent sharing behavior*.

| Parameter | Description | Scoring Anchor |
| :--- | :--- | :--- |
| `social_currency` | How much does this audience value sharing content? | 0 = never shares, 5 = occasionally, 10 = constantly curates |
| `share_cost` | Psychological/physical effort to share (platform friction). | 0 = one click, 5 = few steps, 10 = complex sign-up needed |
| `audience_trust_base` | Baseline trust of this audience toward information in this domain. | 0 = completely distrustful, 5 = neutral, 10 = fully trusting |
| `share_circle_preference` | Where do they share? (0 = public broadcast, 10 = only private groups) | 0 = always public, 5 = mixed, 10 = strictly private |

## 3. Environment Inputs
Contextual factors of the platform and societal mood.

| Parameter | Description | Scoring Anchor |
| :--- | :--- | :--- |
| `surge_match` | Is there a current event/surge that the content aligns with? | 0 = completely irrelevant, 5 = loosely related, 10 = perfect storm |
| `current_direction` | Direction of public discourse flow (positive/negative). | 0 = against current mood, 5 = neutral, 10 = riding the wave |
| `terrain_passability` | How frictionless is the platform for this type of content? | 0 = blocked, 5 = moderate friction, 10 = seamless |
| `population_density` | Audience size / active user density on the platform. | 0 = deserted, 5 = moderate, 10 = extremely crowded |
| `connectivity` | How interconnected are users? (friend networks, groups). | 0 = isolated, 5 = average, 10 = hyper-connected |
| `raw_suppression` | Level of content moderation / censorship threat. | 0 = no suppression, 5 = moderate filtering, 10 = severe crackdown |
| `L_cognitive` | How mentally demanding is the content to understand? | 0 = trivial, 5 = requires focus, 10 = expert knowledge needed |
| `L_operational` | How many steps to share? (UI complexity). | 0 = instant share, 5 = few taps, 10 = multi-app workflow |
| `L_antipathy` | How much social risk is associated with sharing this? | 0 = safe to share, 5 = may offend some, 10 = could get you fired |
| `content_emotion_intensity` | Emotional intensity of the content (similar to arousal but contextual). | 0 = dry facts, 5 = mild emotion, 10 = visceral |
| `audience_resonance_match` | How well does the content's emotion match the audience's pre-existing mood? | 0 = mismatch, 5 = somewhat aligned, 10 = perfect resonance |
| `environment_emotion_fit` | How well does the content fit the current social climate? | 0 = tone-deaf, 5 = acceptable, 10 = perfectly timed |

## 4. Example Workflow
1. Read/watch the content.
2. For each parameter, decide a score (0–10) based on the anchors.
3. Assign a confidence (0–10) for each score.
4. Combine scores into the `input.json` structure.
5. Later, compare simulation results with real-world spread; adjust scores (calibrate) based on observed deltas.

This guide ensures that AI agents and human analysts speak the same language when feeding data into Lasinfon.

## 5. Important Initialization Rule: mu_psych_t
- At **cold start (t = 0)**, the engine ignores any value you set for `field.mu_psych_t`. It computes the initial psychological friction from `L_antipathy` and trust deficit.
- If you are **restarting a simulation from a saved state (t > 0)**, you should set `field.mu_psych_t` to the exact value from the previous run's snapshot.
- Always set `cf_mu_psych_t` to reflect your confidence in this friction estimate (especially for hot restarts).
