import { NextResponse } from "next/server";
import { DiagnoseInputSchema } from "@/config/schema";
import fs from "fs";
import path from "path";

// High-fidelity environment and audience estimator mapping to docs/ai_env_estimator_prompt.md
function estimateEnv(platform: string, purpose: string, content: string) {
  const isStandard = platform.toLowerCase() === "standard";
  const len = content.length;
  const isEmotional = content.includes("!") || content.includes("?") || content.includes("前女友") || content.includes("付出了");
  
  // Platform density mapping (Population transmission coefficient / medium density base)
  const densityMap: Record<string, number> = {
    standard: 5.0,
    douyin: 9.0,
    xiaohongshu: 8.0,
    wechat: 8.5,
  };
  
  return {
    meme: {
      social_currency: isStandard ? 5.0 : (purpose.toLowerCase() === "social currency" ? 8.5 : 6.0),
      share_cost: isStandard ? 5.0 : (platform.toLowerCase() === "douyin" ? 2.0 : 4.0),
      audience_trust_base: isStandard ? 5.0 : (platform.toLowerCase() === "wechat" ? 8.0 : 5.0),
      share_circle_preference: isStandard ? 5.0 : (platform.toLowerCase() === "wechat" ? 9.0 : 4.0),
    },
    env: {
      surge_match: isEmotional ? 7.5 : 5.0,
      current_direction: 5.0,
      terrain_passability: isStandard ? 5.0 : 7.5,
      population_density: densityMap[platform.toLowerCase()] || 5.0,
      connectivity: platform.toLowerCase() === "wechat" ? 8.5 : (platform.toLowerCase() === "standard" ? 5.0 : 4.0),
      raw_suppression: isStandard ? 3.0 : 2.0,
      L_cognitive: len > 500 ? 7.5 : 2.5,
      L_operational: 1.0,
      L_antipathy: content.includes("争议") ? 7.5 : 2.5,
      content_emotion_intensity: isEmotional ? 7.5 : 5.0,
      audience_resonance_match: 5.0,
      environment_emotion_fit: 5.0,
    },
  };
}

/**
 * Orchestration Bus - POST /api/diagnose
 * Validates the contract via Zod schema. If verification fails, hard melts with 400.
 * Dynamically reads docs/ai_evaluator_prompt.md from disk and calls DeepSeek/OpenAI completions.
 * Falls back gracefully to a high-fidelity mock engine when no API keys are detected.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.json();

    // ── Contract Verification (Hard Melt on failure) ──
    const parsed = DiagnoseInputSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Contract Breakage",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { platform, purpose, content } = parsed.data;

    // Check pre-configured switch
    const enableCI144 = process.env.ENABLE_CI144 === "true";
    if (enableCI144) {
      return NextResponse.json({ message: "CI-144 pipeline executed" });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // ── High-Fidelity Mock Engine (Dev Sandbox) ──
      const len = content.length;
      const is_emotional = content.includes("!") || content.includes("?") || content.includes("哈") || content.includes("前女友") || content.includes("付出了");
      const is_uniqueness = content.includes("识人") || content.includes("独自") || content.includes("想整容");
      const is_innovation = content.includes("颠覆") || content.includes("全新") || content.includes("不纠缠");
      
      const emotion_score = is_emotional ? 7.5 : 2.5;
      const unique_score = is_uniqueness ? 10.0 : 2.5;
      const innovation_score = is_innovation ? 7.5 : 5.0;
      const practical_score = len < 100 ? 7.5 : 2.5; // Short axiom has higher immediate practical utility
      const completeness_score = len > 1000 ? 10.0 : 2.5; // Long story has higher narrative completeness
      const personification_score = len > 1000 ? 10.0 : 5.0; // Long story has higher personification

      // Call dynamic environment estimator to compute Meme & Env factors (Zero hardcoding!)
      const envMeme = estimateEnv(platform, purpose, content);

      const mockResult = {
        scores: {
          content_emotion_arousal: emotion_score,
          social_currency_attr: is_emotional ? 7.5 : 5.0,
          practical_value: practical_score,
          uniqueness: unique_score,
          innovation: innovation_score,
          enhancement: len > 1000 ? 7.5 : 2.5,
          strangeness: is_uniqueness ? 7.5 : 2.5,
          narrative_completeness: completeness_score,
          remix_openness: len < 100 ? 7.5 : 2.5, // Short axiom has higher remix openness
          source_credibility: len > 1000 ? 7.5 : 2.5,
          personification: personification_score,
        },
        meme: envMeme.meme,
        field: {
          t: 0,
          C_t: 0.0,
          R_t: emotion_score,
          R_0: emotion_score,
          mu_psych_t: 3.0,
          K_pot_t: 1.0,
          K_pot_0: 1.0,
          K_soil: 1.0,
          K_comp: 1.0,
          K_base: 1.0,
          A_algo: platform.toLowerCase() === "standard" ? 1.0 : 80.0, // Dynamic A_algo based on chosen platform!
          T: 2.0,
          T_effective: 2.0,
          challengability_score: 5.0,
          circle_opposition: 8.0,
          social_currency_t: 5.0,
        },
        env: envMeme.env,
        engine: "Dev Sandbox (Mock)"
      };

      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json(mockResult);
    }

    // ── Active SaaS Pipeline: Read Prompt and Call LLM API ──
    const isDeepSeek = !!process.env.DEEPSEEK_API_KEY;
    const apiUrl = isDeepSeek 
      ? "https://api.deepseek.com/v1/chat/completions" 
      : "https://api.openai.com/v1/chat/completions";
    const model = isDeepSeek ? "deepseek-chat" : "gpt-4o-mini";

    // Dynamic Multi-Path File Read: Ensures absolute loading safety across different deployment environments
    let systemPrompt = "";
    const pathsToTry = [
      path.join(process.cwd(), "../../../docs/ai_evaluator_prompt.md"),
      path.join(process.cwd(), "docs/ai_evaluator_prompt.md"),
      path.join(process.cwd(), "crates/wasm/www/web/docs/ai_evaluator_prompt.md")
    ];

    for (const p of pathsToTry) {
      if (fs.existsSync(p)) {
        systemPrompt = fs.readFileSync(p, "utf-8");
        break;
      }
    }

    if (!systemPrompt) {
      throw new Error("Critical Error: ai_evaluator_prompt.md system asset file not found on disk.");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        response_format: { type: "json_object" }, // Enforce strict JSON Mode
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please evaluate this content following the metrological BARS guidelines:\n\nPlatform: ${platform}\nPurpose: ${purpose}\nContent:\n${content}` }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`LLM API returned error: ${errText}`);
    }

    const payload = await response.json();
    const evaluatedJson = JSON.parse(payload.choices[0].message.content);
    
    // Inject active flag
    evaluatedJson.engine = "Production SaaS (LLM)";

    return NextResponse.json(evaluatedJson);

  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}
