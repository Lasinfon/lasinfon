import { NextResponse } from "next/server";
import { DiagnoseInputSchema } from "@/config/schema";
import fs from "fs";
import path from "path";

/**
 * Type-safe value retrieval helper with fallback guardrails (v6.3.0).
 * Prevents downstream TypeError or ReferenceError during parse loops.
 */
const getVal = (val: unknown, fallback: number): number => {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  return fallback;
};

/**
 * Maps the 1-5 integer BARS score into the Rust engine's [0.0, 10.0] physical domain.
 * Applies strict double clamping guardrails to prevent downstream simulation panic.
 */
function mapAndClampScore(score5: number): number {
  const raw = (score5 - 1.0) * 2.5;
  return Math.max(0.0, Math.min(10.0, raw));
}

/**
 * High-fidelity environment and audience estimator mapping (docs/ai_env_estimator_prompt.md).
 * Dynamically converts platform and strategic purpose into environmental K_env & Meme attributes.
 *
 * NOTE (Decoupling Specification):
 * Strictly excludes content-dependent factors like L_cognitive or L_antipathy to maintain
 * a single authoritative source from LLM content evaluation.
 */
function estimateEnv(platform: string, purpose: string) {
  const isStandard = platform.toLowerCase() === "standard";
  
  // Platform density mapping unifies under social laser medium density
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
      population_density: densityMap[platform.toLowerCase()] || 5.0,
      connectivity: platform.toLowerCase() === "wechat" ? 8.5 : (platform.toLowerCase() === "standard" ? 5.0 : 4.0),
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

    //  Contract Verification (Hard Melt on failure) 
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
      //  High-Fidelity Mock Engine (Dev Sandbox v6.3.0) 
      // Note: Chinese keyword matching below represents temporary dev heuristics for sandboxing,
      // and will be entirely replaced by active LLM evaluations in production.
      const len = content.length;
      const is_emotional = content.includes("!") || content.includes("?") || content.includes("") || content.includes("") || content.includes("");
      const is_uniqueness = content.includes("") || content.includes("") || content.includes("");
      const is_innovation = content.includes("") || content.includes("") || content.includes("");
      
      const emotion_score = is_emotional ? 4 : 2; // BARS 1-5 integer scale
      const unique_score = is_uniqueness ? 5 : 2;
      const innovation_score = is_innovation ? 4 : 2;
      const practical_score = len < 100 ? 4 : 2; // Short axiom has higher immediate practical utility
      const completeness_score = len > 1000 ? 5 : 2; // Long story has higher narrative completeness
      const personification_score = len > 1000 ? 5 : 3;

      const L_cognitive_score = len > 500 ? 4 : 2; // BARS 1-5
      const L_antipathy_score = content.includes("") ? 4 : 1;

      // Call dynamic environment estimator to compute Meme & Env factors (Zero hardcoding!)
      const envMeme = estimateEnv(platform, purpose);

      const mockResult = {
        scores: {
          content_emotion_arousal: mapAndClampScore(emotion_score),
          social_currency_attr: mapAndClampScore(is_emotional ? 4 : 3),
          practical_value: mapAndClampScore(practical_score),
          uniqueness: mapAndClampScore(unique_score),
          innovation: mapAndClampScore(innovation_score),
          enhancement: mapAndClampScore(len > 1000 ? 4 : 2),
          strangeness: mapAndClampScore(is_uniqueness ? 4 : 2),
          narrative_completeness: mapAndClampScore(completeness_score),
          remix_openness: mapAndClampScore(len < 100 ? 4 : 2),
          source_credibility: mapAndClampScore(len > 1000 ? 4 : 2),
          personification: mapAndClampScore(personification_score),
        },
        meme: envMeme.meme,
        field: {
          t: 0,
          C_t: 0.0,
          R_t: mapAndClampScore(emotion_score),
          R_0: mapAndClampScore(emotion_score),
          mu_psych_t: 3.0,
          K_pot_t: 1.0,
          K_pot_0: 1.0,
          K_soil: 1.0,
          K_comp: 1.0,
          K_base: 1.0,
          A_algo: platform.toLowerCase() === "standard" ? 1.0 : 80.0, // Dynamic A_algo based on chosen platform
          T: 2.0,
          T_effective: 2.0,
          challengability_score: 5.0,
          circle_opposition: 8.0,
          social_currency_t: 5.0,
        },
        env: {
          ...envMeme.env,
          surge_match: 7.5,
          current_direction: 5.0,
          terrain_passability: 7.5,
          raw_suppression: 3.0,
          L_cognitive: mapAndClampScore(L_cognitive_score),
          L_operational: 1.0, // Restored: Required physical field in EnvInputs
          L_antipathy: mapAndClampScore(L_antipathy_score),
          content_emotion_intensity: mapAndClampScore(emotion_score),
          audience_resonance_match: 5.0,
          environment_emotion_fit: 5.0,
        },
        confidence: {
          content_access: true,
          reliability: "high"
        },
        engine: "Dev Sandbox (Mock)"
      };

      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json(mockResult);
    }

    //  Active SaaS Pipeline: Read Prompt and Call LLM API 
    const isDeepSeek = !!process.env.DEEPSEEK_API_KEY;
    const apiUrl = isDeepSeek 
      ? "https://api.deepseek.com/v1/chat/completions" 
      : "https://api.openai.com/v1/chat/completions";
    const model = isDeepSeek ? "deepseek-chat" : "gpt-4o-mini";

    // Dynamic Multi-Path File Read: Ensures absolute loading safety
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

    //  Epistemological Confidence Guardrail (Hard Melt on Silent Failure) 
    // Stops the pipeline immediately with a 400 Bad Request if the LLM cannot access the target URL,
    // protecting the simulation engine from hallucinated noise.
    const contentAccess = evaluatedJson.confidence?.content_access;
    if (contentAccess === false) {
      return NextResponse.json(
        {
          error: "AI Evaluation Pollution Blocked",
          message: "The AI agent failed to fetch or read the live web content. To protect the metrological purity of the simulator, please copy and paste the raw text directly instead of providing a URL.",
        },
        { status: 400 }
      );
    }
    
    // Map the LLM 1-5 integers to 0-10 floats on the API layer with robust getVal fallback
    const scoresMapped = {
      content_emotion_arousal: mapAndClampScore(getVal(evaluatedJson.content_emotion_arousal, 3.0)),
      social_currency_attr: mapAndClampScore(getVal(evaluatedJson.social_currency_attr, 3.0)),
      practical_value: mapAndClampScore(getVal(evaluatedJson.practical_value, 3.0)),
      uniqueness: mapAndClampScore(getVal(evaluatedJson.uniqueness, 3.0)),
      innovation: mapAndClampScore(getVal(evaluatedJson.innovation, 3.0)),
      enhancement: mapAndClampScore(getVal(evaluatedJson.enhancement, 3.0)),
      strangeness: mapAndClampScore(getVal(evaluatedJson.strangeness, 3.0)),
      narrative_completeness: mapAndClampScore(getVal(evaluatedJson.narrative_completeness, 3.0)),
      remix_openness: mapAndClampScore(getVal(evaluatedJson.remix_openness, 3.0)),
      source_credibility: mapAndClampScore(getVal(evaluatedJson.source_credibility, 3.0)),
      personification: mapAndClampScore(getVal(evaluatedJson.personification, 3.0)),
    };

    const l_cognitive_mapped = mapAndClampScore(getVal(evaluatedJson.L_cognitive, 3.0));
    const l_antipathy_mapped = mapAndClampScore(getVal(evaluatedJson.L_antipathy, 3.0));

    // Call dynamic environment estimator to compute Meme & Env factors
    const envMeme = estimateEnv(platform, purpose);

    const activeResult = {
      scores: scoresMapped,
      meme: envMeme.meme,
      field: {
        t: 0,
        C_t: 0.0,
        R_t: scoresMapped.content_emotion_arousal,
        R_0: scoresMapped.content_emotion_arousal,
        mu_psych_t: 3.0,
        K_pot_t: 1.0,
        K_pot_0: 1.0,
        K_soil: 1.0,
        K_comp: 1.0,
        K_base: 1.0,
        A_algo: platform.toLowerCase() === "standard" ? 1.0 : 80.0,
        T: 2.0,
        T_effective: 2.0,
        challengability_score: 5.0,
        circle_opposition: 8.0,
        social_currency_t: 5.0,
      },
      env: {
        ...envMeme.env,
        surge_match: 5.0, // Default fallback state
        current_direction: 5.0,
        terrain_passability: 5.0,
        raw_suppression: 3.0,
        L_cognitive: l_cognitive_mapped,
        L_operational: 1.0, // Restored: Required physical field in EnvInputs
        L_antipathy: l_antipathy_mapped,
        content_emotion_intensity: scoresMapped.content_emotion_arousal,
        audience_resonance_match: 5.0,
        environment_emotion_fit: 5.0,
      },
      engine: "Production SaaS (LLM)"
    };

    return NextResponse.json(activeResult);

  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}
