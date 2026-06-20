# Scale Mapping Reference

Lasinfon uses **relative 0–10 parameters** to represent audience size, platform connectivity, and algorithmic amplification. This document provides a suggested mapping from real-world scale to these abstract parameters for more intuitive simulation results.

## Population Density (`env.population_density`)

| MAU (Monthly Active Users) | Suggested `population_density` | Description |
| :--- | :--- | :--- |
| > 1 billion | 10 | Nearly every target user is present |
| 500M – 1B | 9 | Dominant global platforms |
| 100M – 500M | 8 | Major regional/national platforms |
| 50M – 100M | 7 | Large niche platforms |
| 10M – 50M | 6 | Medium-sized communities |
| 1M – 10M | 5 | Small specialized networks |
| < 1M | 1–4 | Private groups, beta products |

## Connectivity (`env.connectivity`)

| Social Graph Density | Suggested `connectivity` |
| :--- | :--- |
| Everyone knows everyone (family groups, close teams) | 9–10 |
| Dense friend networks (WeChat, Facebook) | 7–8 |
| Loose interest-based networks (Reddit, Discord) | 4–6 |
| Mostly stranger interactions (public feeds) | 1–3 |

## Algorithmic Amplification (`field.A_algo`)

| Platform Type | Suggested `A_algo` |
| :--- | :--- |
| Pure algorithmic feed (short-video platforms) | 30–50 |
| Hybrid social + algorithm (image sharing, microblogging) | 10–20 |
| Mostly chronological / social graph (messaging, forums) | 1–5 |
| No algorithm (private groups, newsletters) | 1 |

## Example: Calibrating a Simulation

1. Choose the platform's MAU and map to `population_density`.
2. Estimate how interconnected users are (`connectivity`).
3. Set `A_algo` based on how aggressively the platform pushes content.
4. Place these values in a preset file or directly in your input JSON.
5. After running, you can compare relative G values across scenarios.

*Note: Future versions (v5.3.0+) may support an explicit `scale_anchor` field to automatically convert abstract G into approximate real-world exposure estimates.*
