# Scale Mapping Reference v6.1.1

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

---

## The Metrological Solution: Standard Reference Projection (SRP)

In previous versions, converting abstract $G$ into real-world exposure was highly uncertain. 

In **v6.1.1**, this is natively resolved by the **Standard Reference Projection (SRP)**:
- Lasinfon isolates environmental wind speed by running a parallel simulation under a standard reference vacuum cavity ($K=1.0$), outputting **$G_{\text{std}}$ (Standard Potential)** [5].
- $G_{\text{std}}$ represents the absolute physical quality of the content, fully comparable across any platform.
- Users run campaigns, record $G_{\text{std}}$, and fit their private logistic regression curve ($Sales = f(G_{\text{std}})$) to map Lasinfon's standard scores to their unique business conversion rates [5].
- Environmental wind speed is explicitly quantified as **$K_{\text{mult}} = G_{\text{active}} / G_{\text{std}}$**, showing exactly how many times the active environment amplified or suppressed the copy's core potential.
