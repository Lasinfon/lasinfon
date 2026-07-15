"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { TypingText } from "@/components/TypingText";

// Decouple presets into JSON file (conforms to Zero-Hardcoding Checkpoint)
import presetsData from "../config/presets.json";

export default function Home() {
  const {
    state,
    step,
    inputs,
    diagnosticLogs,
    activeDiagnosticResult,
    maxTicks,
    sigma,
    seed,
    startFlow,
    setPlatform,
    setPurpose,
    setContent,
    nextStep,
    prevStep,
    resetFlow,
    setMaxTicks,
    setSigma,
    setSeed,
    setDiagnosing,
    setDiagnosticResult,
  } = useStore();

  const [wasmModule, setWasmModule] = useState<any>(null);
  const [logIndex, setLogIndex] = useState(0);

  // ── Hover interaction state variables ──
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // ── Load WASM Dynamically from Next.js Public Directory ──
  useEffect(() => {
    import("../public/pkg/lasinfon_wasm.js")
      .then(async (mod) => {
        await mod.default();
        setWasmModule(mod);
      })
      .catch((err) => console.error("Failed to load WASM in Next.js", err));
  }, []);

  const getVal = (val: any, def = 0.0) => (val !== undefined && val !== null ? val : def);

  // ── Non-LLM Mathematical Summary Generator ──
  const generateSummaryText = (records: any[]) => {
    if (!records || records.length === 0) return "";
    const first = records[0];
    const last = records[records.length - 1];

    let peak_G = 0;
    let peak_tick = 0;
    records.forEach((r) => {
      if (r.G > peak_G) {
        peak_G = r.G;
        peak_tick = r.t;
      }
    });

    const total_G = records.reduce((acc, r) => acc + getVal(r.G), 0);
    const avg_lambda_eff = records.reduce((acc, r) => acc + getVal(r.lambda_eff), 0) / records.length;
    const crossed_threshold = records.some((r) => getVal(r.lambda_eff) > 1.0);
    const threshold_tick = records.findIndex((r) => getVal(r.lambda_eff) > 1.0);

    return `=== LASINFON SIMULATION SUMMARY REPORT ===
Timeline ticks: 0 to ${last.t} (Total steps: ${records.length})

[INITIAL STATE (t=0)]:
- G_active: ${getVal(first.G).toFixed(2)} | G_std: ${getVal(first.G_std, first.G).toFixed(2)} | K_mult: ${getVal(first.K_mult, 1.0).toFixed(2)}x
- R_t: ${getVal(first.R_t).toFixed(2)} | C_t: ${(getVal(first.C_t)*100).toFixed(1)}% | mu_psych: ${getVal(first.mu_psych_t).toFixed(2)}

[PEAK STATE (t=${peak_tick})]:
- Peak G_active: ${peak_G.toFixed(2)} | G_std: ${getVal(records[peak_tick]?.G_std, peak_G).toFixed(2)} | K_mult: ${getVal(records[peak_tick]?.K_mult, 1.0).toFixed(2)}x

[FINAL STATE (t=${last.t})]:
- Final G_active: ${getVal(last.G).toFixed(2)} | G_std: ${getVal(last.G_std, last.G).toFixed(2)} | K_mult: ${getVal(last.K_mult, 1.0).toFixed(2)}x

[PROPAGATION METRICS]:
- Cumulative Exposure (G_total): ${total_G.toFixed(2)}
- Average Gain Multiplier (lambda_eff): ${avg_lambda_eff.toFixed(4)}
- Autonomous Growth Crossed Threshold? ${crossed_threshold ? "YES (at t=" + threshold_tick + ")" : "NO"}
- Final Phase Quadrant: ${last.quadrant}
==========================================`;
  };

  // ── High-Fidelity SVG Path Generator (Bézier Spline) ──
  const generateSvgPath = (points: { x: number; y: number }[]): string => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
    }
    d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
    return d;
  };

  // ── Mousemove interactive tooltip logic ──
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - pad;
    const ratio = x / chartW;
    const idx = Math.round(ratio * (len - 1));
    if (idx >= 0 && idx < len) {
      setHoverIndex(idx);
    }
  };

  const handleMouseLeave = () => setHoverIndex(null);

  // ── Trigger Diagnostic Event (Elevator Mirror Lifecycle) ──
  const executeDiagnostics = async () => {
    setLogIndex(0);
    setDiagnosing([
      "REQUEST_INITIATED ── [1/4] 初始化引擎共振中，解构文本词法...",
    ]);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      if (!res.ok) throw new Error("Contract verification failed");
      const scenarioData = await res.json();

      setLogIndex(1);
      useStore.setState((state) => ({
        diagnosticLogs: [
          ...state.diagnosticLogs,
          "STREAM_STARTED ── [2/4] 环境参数注入中，校准社交摩擦阻尼...",
        ],
      }));
      await new Promise((r) => setTimeout(r, 600));

      setLogIndex(2);
      useStore.setState((state) => ({
        diagnosticLogs: [
          ...state.diagnosticLogs,
          "STREAM_COMPLETED ── [3/4] 运行 1000 次蒙特卡洛集合预报，解算状态转移主方程...",
        ],
      }));
      await new Promise((r) => setTimeout(r, 600));

      if (!wasmModule) throw new Error("WASM engine not ready");

      // Load config template from presets.json dynamically (No more hardcoded magic configs!)
      const targetPreset = (presetsData as any)[inputs.platform.toLowerCase()] 
        || (presetsData as any)["standard"];

      const result_string = wasmModule.simulate(
        JSON.stringify(targetPreset.config),
        JSON.stringify(scenarioData),
        maxTicks, // Configurable via UI state
        sigma,    // Configurable via UI state
        BigInt(seed), // Configurable via UI state
        false
      );

      const records = JSON.parse(result_string);

      setLogIndex(3);
      useStore.setState((state) => ({
        diagnosticLogs: [
          ...state.diagnosticLogs,
          "PARSING_DONE ── [4/4] 解译自生长传播谱线，生成物理诊断简报...",
        ],
      }));
      await new Promise((r) => setTimeout(r, 400));

      // Final Transition: diagnosing -> rendering
      setDiagnosticResult(records);

    } catch (err: any) {
      console.error(err);
      resetFlow();
      alert("Simulation Error: " + err.message);
    }
  };

  // ── SVG Coordinate Mapping Computations ──
  const pad = 35;
  const chartW = 580;
  const chartH = 200;

  const max_G = activeDiagnosticResult
    ? Math.max(...activeDiagnosticResult.map((r: any) => getVal(r.G)), ...activeDiagnosticResult.map((r: any) => getVal(r.G_std, getVal(r.G))), 2.0)
    : 2.0;

  const len = activeDiagnosticResult ? activeDiagnosticResult.length : 0;

  const points_std = activeDiagnosticResult
    ? activeDiagnosticResult.map((r: any, idx: number) => ({
        x: len > 1 ? pad + (idx / (len - 1)) * chartW : pad,
        y: pad + chartH - (getVal(r.G_std, getVal(r.G)) / max_G) * chartH,
      }))
    : [];

  const points_active = activeDiagnosticResult
    ? activeDiagnosticResult.map((r: any, idx: number) => ({
        x: len > 1 ? pad + (idx / (len - 1)) * chartW : pad,
        y: pad + chartH - (getVal(r.G) / max_G) * chartH,
      }))
    : [];

  const stdPathD = generateSvgPath(points_std);
  const activePathD = generateSvgPath(points_active);

  const stdAreaD = points_std.length > 0 ? `${stdPathD} L ${points_std[points_std.length - 1].x} ${pad + chartH} L ${points_std[0].x} ${pad + chartH} Z` : "";
  const activeAreaD = points_active.length > 0 ? `${activePathD} L ${points_active[points_active.length - 1].x} ${pad + chartH} L ${points_active[0].x} ${pad + chartH} Z` : "";

  // ── Metrics Chart (R_t & C_t) SVG Mapping ──
  const max_R = 10.0;
  const max_C = 1.0;

  const points_R = activeDiagnosticResult
    ? activeDiagnosticResult.map((r: any, idx: number) => ({
        x: len > 1 ? pad + (idx / (len - 1)) * chartW : pad,
        y: pad + chartH - (getVal(r.R_t) / max_R) * chartH,
      }))
    : [];

  const points_C = activeDiagnosticResult
    ? activeDiagnosticResult.map((r: any, idx: number) => ({
        x: len > 1 ? pad + (idx / (len - 1)) * chartW : pad,
        y: pad + chartH - (getVal(r.C_t) / max_C) * chartH,
      }))
    : [];

  const pathR_D = generateSvgPath(points_R);
  const pathC_D = generateSvgPath(points_C);

  const areaR_D = points_R.length > 0 ? `${pathR_D} L ${points_R[points_R.length - 1].x} ${pad + chartH} L ${points_R[0].x} ${pad + chartH} Z` : "";
  const areaC_D = points_C.length > 0 ? `${pathC_D} L ${points_C[points_C.length - 1].x} ${pad + chartH} L ${points_C[0].x} ${pad + chartH} Z` : "";

  // ── System Prompt for Web Chat Diagnostic Copies ──
  const SYSTEM_INTERPRETER_PROMPT = `You are an expert in social laser dynamics, public opinion prediction, and metrological calibration. Your task is to interpret the provided summarized Lasinfon Simulation Report and explain it in plain, actionable, and mathematically rigorous human language.

Output Structure:
1. One-Sentence Core Verdict - Standard potential (G_std), environmental multiplier (K_mult), active exposure (G_active).
2. Standard vs. Active Divergence Analysis - Why did it succeed/fail? Is it because of the copy's intrinsic strength, or did it ride a massive trend? Or did a masterpiece get choked? Cite explicit differences from the summary.
3. Driver & Bottleneck Attribution - Trace every major driver or bottleneck back to a specific input parameter (e.g. practical_value, emotion_arousal, L_antipathy).
4. Actionable Optimization Suggestions - 1-2 concrete actions mapped to controllable parameters, ranked by ROI.
5. Limitations & Honesty - Mention relative trends, and that random fluctuations affect results.

Metrological Interpretation Rules:
- If G_std is high (>50) but G_active is low (<10) because K_mult is low (<0.3x) -> Phenomenal Masterpiece Choked. Action: Do NOT rewrite, change channels.
- If G_std is low (<2.0) but G_active is high (>50) because K_mult is high (>50x) -> Algo Rider. Succeeded due to trend/ad push; warn on sudden organic drops.
- If both are high -> Coherent Resonance.
- If gain saturation observed -> Excited population depleted naturally.

Please analyze the following summarized simulation report:

`;

  // Fallback Copy Function for Web Chat direct transfer
  const copyDiagnosticPrompt = () => {
    if (!activeDiagnosticResult) return;
    const summary = generateSummaryText(activeDiagnosticResult);
    const fullText = `${SYSTEM_INTERPRETER_PROMPT}${summary}`;
    navigator.clipboard.writeText(fullText).then(() => {
      alert("📋 Prompt + Summary Copied! Paste directly into ChatGPT, Claude, or DeepSeek.");
    }).catch(() => {
      alert("Failed to auto-copy. Please manually select and copy the prompt block below.");
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Left Sidebar (Dribbble Premium Layout) ── */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
              L
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">LASINFON</span>
          </div>
          <nav className="flex flex-col gap-2">
            <div className="px-4 py-3 rounded-xl bg-blue-50/50 text-brand-primary font-semibold text-sm cursor-pointer">
              Dashboard
            </div>
            <div className="px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium text-sm cursor-pointer transition-all">
              Campaigns
            </div>
            <div className="px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium text-sm cursor-pointer transition-all">
              Audience Segment
            </div>
            <div className="px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium text-sm cursor-pointer transition-all">
              Calibration Hub
            </div>
          </nav>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          WASM Engine: v6.1.1
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <div className="flex-1 p-8 overflow-y-auto max-w-6xl">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Metrology Workspace</h1>
            <p className="text-slate-500 text-xs mt-1">Autonomous Self-Growing Propagation Analysis</p>
          </div>
          {state === "rendering" && (
            <Button variant="secondary" className="w-fit py-2.5 px-4 shadow-sm" onClick={resetFlow}>
              Reset Workspace
            </Button>
          )}
        </header>

        {/* ── STATE 1: IDLE ── */}
        {state === "idle" && (
          <div className="flex items-center justify-center h-[70vh]">
            <Card className="text-center w-full max-w-md p-10 border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-brand-primary mx-auto mb-6 text-xl">
                ⚡
              </div>
              <h2 className="text-xl font-bold mb-2 text-slate-900">Initialize Diagnostic Run</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Connect your campaign details directly to our physics engine. Measures standard potency and env multiplier.
              </p>
              <Button onClick={startFlow}>Get Started</Button>
            </Card>
          </div>
        )}

        {/* ── STATE 2: COLLECTING (Ginlix PTC Onboarding Flow) ── */}
        {state === "collecting" && (
          <div className="flex items-center justify-center h-[70vh]">
            <Card className="w-full max-w-xl border border-slate-200 p-8 shadow-md">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Ginlix Onboarding Flow
                </span>
                <span className="text-xs font-semibold text-brand-primary">
                  Step {step} of 3
                </span>
              </div>

              {step === 1 && (
                <div>
                  <label className="text-sm font-bold text-slate-800 mb-2">Select Target Platform</label>
                  <p className="text-xs text-slate-400 mb-4">Choose the dominant social environment for your campaign</p>
                  <div className="flex flex-col gap-3 my-4">
                    {[
                      { name: "Standard", desc: "Standard Metrology Reference • Standard platform/circle/environment calibration baseline" },
                      { name: "Douyin", desc: "High-Arousal Short-Video Resonance • Optimized for high emotional amplification" },
                      { name: "Xiaohongshu", desc: "Visual Seeding & Social Currency • Tailored for organic recommendation and aesthetics" },
                      { name: "WeChat", desc: "Private Circle Trust-Based Propagation • Designed for high-authority private forwarding" }
                    ].map((p) => (
                      <div
                        key={p.name}
                        onClick={() => {
                          setPlatform(p.name);
                          // Auto load configurable presets to Zustand store on select (No more hardcoding!)
                          const targetPreset = (presetsData as any)[p.name.toLowerCase()];
                          if (targetPreset) {
                            setMaxTicks(targetPreset.max_ticks);
                            setSigma(targetPreset.sigma);
                            setSeed(targetPreset.seed.toString());
                          }
                        }}
                        className={`p-5 border rounded-xl text-left cursor-pointer transition-all flex flex-col gap-1 ${
                          inputs.platform === p.name
                            ? "border-brand-primary bg-blue-50/50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className={`text-sm font-bold ${inputs.platform === p.name ? "text-brand-primary" : "text-slate-800"}`}>
                          {p.name}
                        </span>
                        <span className="text-xs text-slate-400">{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <label className="text-sm font-bold text-slate-800 mb-2">Select Strategic Purpose</label>
                  <p className="text-xs text-slate-400 mb-4">Define the primary physical action requested from the gain medium</p>
                  <div className="flex flex-col gap-3 my-4">
                    {[
                      { name: "Conversion Rate", desc: "Maximize functional value and transaction ROI thresholds" },
                      { name: "Social Currency", desc: "Maximize user sharing reputation and public self-presentation" },
                      { name: "Viral Resonance", desc: "Maximize emotional contagion and rapid network infiltration" }
                    ].map((p) => (
                      <div
                        key={p.name}
                        onClick={() => setPurpose(p.name)}
                        className={`p-5 border rounded-xl text-left cursor-pointer transition-all flex flex-col gap-1 ${
                          inputs.purpose === p.name
                            ? "border-brand-primary bg-blue-50/50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className={`text-sm font-bold ${inputs.purpose === p.name ? "text-brand-primary" : "text-slate-800"}`}>
                          {p.name}
                        </span>
                        <span className="text-xs text-slate-400">{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <label className="text-sm font-bold text-slate-800 mb-2">Enter Raw Copytext</label>
                  <p className="text-xs text-slate-400 mb-4">Input your original advertisement copy, video script, or social article</p>
                  
                  {/* Premium Sandbox Container (Ginlix IDE / Metrology Editor Style) */}
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-4 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-brand-primary transition-all duration-150 my-4">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 select-none">
                      <span>Metrology Editor</span>
                      <span className={inputs.content.length >= 5 ? "text-brand-green" : "text-slate-400"}>
                        {inputs.content.length} chars
                      </span>
                    </div>
                    <textarea
                      value={inputs.content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Paste your copy here (minimum 5 characters)..."
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-800 font-mono text-sm resize-none focus:outline-none h-36 leading-relaxed placeholder-slate-400"
                    />
                  </div>

                  {/* ── ⚙️ Advanced Controls (Ticks · Sigma · Seed - Conforms to SaaS v6.2.0 spec) ── */}
                  <details className="mt-4 border-t border-slate-200 pt-4">
                    <summary className="text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors">
                      ⚙️ Advanced Controls (Ticks · Sigma · Seed)
                    </summary>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 block mb-1">Max Ticks</label>
                        <input
                          type="number"
                          value={maxTicks}
                          onChange={(e) => setMaxTicks(Number(e.target.value))}
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-brand-primary"
                          min={1}
                          max={100}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 block mb-1">Sigma (Noise)</label>
                        <input
                          type="number"
                          value={sigma}
                          onChange={(e) => setSigma(Number(e.target.value))}
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-brand-primary"
                          min={0}
                          max={1}
                          step={0.01}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 block mb-1">Seed</label>
                        <input
                          type="text"
                          value={seed}
                          onChange={(e) => setSeed(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-brand-primary font-mono"
                        />
                      </div>
                    </div>
                  </details>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <Button variant="secondary" onClick={prevStep}>
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    disabled={
                      (step === 1 && !inputs.platform) ||
                      (step === 2 && !inputs.purpose)
                    }
                    onClick={nextStep}
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    disabled={inputs.content.length < 5}
                    onClick={executeDiagnostics}
                  >
                    Launch Simulation
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ── STATE 3: DIAGNOSING (ELEVATOR MIRROR REAL-TIME LOGS) ── */}
        {state === "diagnosing" && (
          <div className="flex items-center justify-center h-[70vh]">
            <Card className="w-full max-w-lg p-10 text-center border border-slate-200">
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="animate-spin h-10 w-10 text-brand-primary mb-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Solving Social Laser Masters ...
                </h4>
                <div className="text-left w-full bg-slate-50 border border-slate-100 rounded-xl p-5 font-mono text-xs text-slate-600 flex flex-col gap-3">
                  {diagnosticLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-brand-green font-bold">✓</span>
                      {idx === logIndex ? (
                        <TypingText text={log} speed={10} />
                      ) : (
                        <span>{log}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── STATE 4: RENDERING (RESULTS COCKPIT - DRIBBBLE INSPIRED) ── */}
        {state === "rendering" && activeDiagnosticResult && (
          <div className="w-full flex flex-col gap-6 relative">
            
            {/* Interactive Tooltip Card for curves */}
            {hoverIndex !== null && (
              <div
                className="absolute pointer-events-none bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg p-3 text-xs z-50 transition-opacity"
                style={{
                  left: Math.max(100, Math.min(chartW + pad * 2 - 100, pad + (hoverIndex / (len - 1)) * chartW)),
                  top: 130,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="font-bold text-slate-800">Time tick: t = {activeDiagnosticResult[hoverIndex].t}</div>
                <div className="flex gap-4 mt-1 font-mono">
                  <span className="text-brand-primary">G_std: {getVal(activeDiagnosticResult[hoverIndex].G_std, getVal(activeDiagnosticResult[hoverIndex].G)).toFixed(2)}</span>
                  <span className="text-brand-purple">G_active: {getVal(activeDiagnosticResult[hoverIndex].G).toFixed(2)}</span>
                </div>
                <div className="flex gap-4 mt-0.5 font-mono">
                  <span className="text-brand-pink">K_mult: {getVal(activeDiagnosticResult[hoverIndex].K_mult, 1.0).toFixed(2)}x</span>
                </div>
              </div>
            )}

            {/* Top 4 KPI Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="flex flex-col p-6 border border-slate-200 hover:shadow-md transition-all duration-300">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Standard Potency (G_std)
                </span>
                <span className="text-3xl font-bold text-brand-primary tracking-tight">
                  {getVal(
                    activeDiagnosticResult[activeDiagnosticResult.length - 1].G_std,
                    activeDiagnosticResult[activeDiagnosticResult.length - 1].G
                  ).toFixed(2)}
                </span>
                <span className="text-[11px] text-slate-400 mt-2 font-medium">
                  Inherent copy strength (K=1.0)
                </span>
              </Card>

              <Card className="flex flex-col p-6 border border-slate-200 hover:shadow-md transition-all duration-300">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Environmental Wind (K_mult)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-brand-purple tracking-tight">
                    {getVal(
                      activeDiagnosticResult[activeDiagnosticResult.length - 1].K_mult,
                      1.0
                    ).toFixed(2)}x
                  </span>
                  <span className="badge badge-green text-[10px]">
                    {getVal(activeDiagnosticResult[activeDiagnosticResult.length - 1].K_mult, 1.0) >= 1.0 ? "Boost" : "Suppress"}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-2 font-medium">
                  Multiplying power of the trend
                </span>
              </Card>

              <Card className="flex flex-col p-6 border border-slate-200 hover:shadow-md transition-all duration-300">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Active Exposure (G_active)
                </span>
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {getVal(activeDiagnosticResult[activeDiagnosticResult.length - 1].G, 0.0).toFixed(2)}
                </span>
                <span className="text-[11px] text-slate-400 mt-2 font-medium">
                  G_std × K_mult active outcome
                </span>
              </Card>

              <Card className="flex flex-col p-6 border border-slate-200 hover:shadow-md transition-all duration-300">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Diagnostic Phase
                </span>
                <div className="mt-1">
                  <span className={`badge ${
                    activeDiagnosticResult[activeDiagnosticResult.length - 1].quadrant === "TrueSelfGrowth" 
                      ? "badge-green" 
                      : "badge-yellow"
                  } text-xs py-1 px-3`}>
                    {activeDiagnosticResult[activeDiagnosticResult.length - 1].quadrant}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-2.5 font-medium">
                  Propagation ecosystem status
                </span>
              </Card>
            </div>

            {/* Main Graphs Dashboard Grid - Pristine SVG Vector Engining */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Chart (Exposure G Curve - 100% Crisp Vector SVG) */}
              <Card className="lg:col-span-2 p-6 flex flex-col justify-between border border-slate-200 hover:shadow-md transition-all duration-300 relative">
                <div className="flex justify-between items-center mb-4">
                  <div className="card-title">Dual-Track Exposure Wave (G)</div>
                  <div className="flex gap-4">
                    <div className="legend-item"><div className="legend-color bg-brand-primary" /> G_std (Standard)</div>
                    <div className="legend-item"><div className="legend-color bg-brand-purple" /> G_active (Active)</div>
                  </div>
                </div>
                
                {/* ── Pristine Responsive SVG Vector Engine with Tooltip Mouse Hooks ── */}
                <div className="w-full h-64 relative">
                  <svg 
                    ref={svgRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    viewBox={`0 0 ${chartW + pad * 2} ${chartH + pad * 2}`} 
                    className="w-full h-full cursor-crosshair"
                  >
                    <defs>
                      <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Standard Horizontal Axis Gridlines */}
                    {[1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1={pad}
                        y1={pad + (chartH / 4) * i}
                        x2={pad + chartW}
                        y2={pad + (chartH / 4) * i}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                    ))}

                    {/* X-Axis Tick Labels */}
                    {activeDiagnosticResult.map((r: any, idx: number) => (
                      idx % 2 === 0 && (
                        <text
                          key={`x-${idx}`}
                          x={len > 1 ? pad + (idx / (len - 1)) * chartW : pad}
                          y={pad + chartH + 18}
                          fontSize="9"
                          fill="#94a3b8"
                          textAnchor="middle"
                          className="font-mono font-bold select-none"
                        >
                          t={r.t}
                        </text>
                      )
                    ))}

                    {/* Y-Axis Value Labels (5 steps) */}
                    {[0, 1, 2, 3, 4].map((i) => {
                      const val = (i / 4) * max_G;
                      return (
                        <text
                          key={`y-${i}`}
                          x={pad - 8}
                          y={pad + chartH - (i / 4) * chartH + 3}
                          fontSize="9"
                          fill="#94a3b8"
                          textAnchor="end"
                          className="font-mono font-bold select-none"
                        >
                          {val.toFixed(1)}
                        </text>
                      );
                    })}

                    {/* standard reference (SRP) Vector Gradient & Line */}
                    {stdAreaD && <path d={stdAreaD} fill="url(#blueGrad)" />}
                    {stdPathD && (
                      <path
                        d={stdPathD}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                      />
                    )}

                    {/* Active Environment Vector Gradient & Line */}
                    {activeAreaD && <path d={activeAreaD} fill="url(#purpleGrad)" />}
                    {activePathD && (
                      <path
                        d={activePathD}
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Interactive Vertical Guidance Pointer Line */}
                    {hoverIndex !== null && (
                      <line
                        x1={len > 1 ? pad + (hoverIndex / (len - 1)) * chartW : pad}
                        y1={pad}
                        x2={len > 1 ? pad + (hoverIndex / (len - 1)) * chartW : pad}
                        y2={pad + chartH}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    )}

                    {/* Current Anchor Markers */}
                    {points_std.length > 0 && (
                      <circle
                        cx={hoverIndex !== null ? points_std[hoverIndex].x : points_std[points_std.length - 1].x}
                        cy={hoverIndex !== null ? points_std[hoverIndex].y : points_std[points_std.length - 1].y}
                        r="4.5"
                        fill="#ffffff"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                      />
                    )}
                    {points_active.length > 0 && (
                      <circle
                        cx={hoverIndex !== null ? points_active[hoverIndex].x : points_active[points_active.length - 1].x}
                        cy={hoverIndex !== null ? points_active[hoverIndex].y : points_active[points_active.length - 1].y}
                        r="5"
                        fill="#ffffff"
                        stroke="#7c3aed"
                        strokeWidth="3"
                      />
                    )}
                  </svg>
                </div>
              </Card>

              {/* Right Chart (CSS Grid Wave Polarizer) */}
              <Card className="p-6 flex flex-col justify-between border border-slate-200 hover:shadow-md transition-all duration-300">
                <div className="card-title mb-4">Polarization Active Grid (C_t)</div>
                <div className="flex items-center justify-center h-64">
                  {/* CSS Grid Matrix: 100% Vector crispness on Retina screens */}
                  <div 
                    className="grid gap-[2px] bg-slate-100 border border-slate-100 rounded-xl p-[3px] w-56 h-60 shadow-inner"
                    style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
                  >
                    {Array.from({ length: 225 }).map((_, idx) => {
                      const x = idx % 15;
                      const y = Math.floor(idx / 15);
                      const centerX = 15 / 2;
                      const centerY = 15 / 2;
                      
                      const lastRecord = activeDiagnosticResult[activeDiagnosticResult.length - 1];
                      const C_t = getVal(lastRecord.C_t, 0.0);
                      const t_wave = lastRecord.t;
                      
                      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                      const wave = Math.sin(dist * 0.8 - t_wave * 0.5);
                      const isActive = wave > (1.0 - C_t * 1.5) && (Math.sin(idx * 7.5) > (1.2 - C_t * 2.0));
                      
                      return (
                        <div 
                          key={idx} 
                          className="rounded-[2px] transition-all duration-300"
                          style={{
                            backgroundColor: isActive 
                              ? `rgba(124, 58, 237, ${0.4 + C_t * 0.6})` 
                              : "rgba(255, 255, 255, 0.95)"
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>

            {/* Bottom Large Metrics Chart & Report Box */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* R_t & C_t Vector SVG lines */}
              <Card className="lg:col-span-2 p-6 flex flex-col justify-between border border-slate-200 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <div className="card-title">Dynamic Resonance (R_t) & Activation (C_t)</div>
                  <div className="flex gap-4">
                    <div className="legend-item"><div className="legend-color bg-brand-pink" /> R_t (Resonance Heat)</div>
                    <div className="legend-item"><div className="legend-color bg-brand-purple" /> C_t (Active Ratio)</div>
                  </div>
                </div>

                <div className="w-full h-44 relative">
                  <svg viewBox={`0 0 ${chartW + pad * 2} ${chartH + pad * 2}`} className="w-full h-full">
                    <defs>
                      <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#db2777" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#db2777" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="purpleGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Standard Axis Gridlines */}
                    {[1, 2, 3].map((i) => (
                      <line
                        key={i}
                        x1={pad}
                        y1={pad + (chartH / 3) * i}
                        x2={pad + chartW}
                        y2={pad + (chartH / 3) * i}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                    ))}

                    {/* R_t vector lines & area gradient */}
                    {areaR_D && <path d={areaR_D} fill="url(#pinkGrad)" />}
                    {pathR_D && (
                      <path
                        d={pathR_D}
                        fill="none"
                        stroke="#db2777"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    )}

                    {/* C_t vector lines & area gradient */}
                    {areaC_D && <path d={areaC_D} fill="url(#purpleGrad2)" />}
                    {pathC_D && (
                      <path
                        d={pathC_D}
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Markers */}
                    {points_R.length > 0 && (
                      <circle
                        cx={points_R[points_R.length - 1].x}
                        cy={points_R[points_R.length - 1].y}
                        r="4"
                        fill="#ffffff"
                        stroke="#db2777"
                        strokeWidth="2"
                      />
                    )}
                    {points_C.length > 0 && (
                      <circle
                        cx={points_C[points_C.length - 1].x}
                        cy={points_C[points_C.length - 1].y}
                        r="4"
                        fill="#ffffff"
                        stroke="#7c3aed"
                        strokeWidth="2"
                      />
                    )}
                  </svg>
                </div>
              </Card>

              {/* High-fidelity diagnostic summary cards */}
              <div className="flex flex-col gap-6">
                <Card className="p-0 overflow-hidden flex-1 flex flex-col justify-between border border-slate-200 hover:shadow-md transition-all duration-300">
                  <div className="bg-slate-50 border-b border-slate-100 p-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">📊 Standard Summary Report</h4>
                  </div>
                  <pre className="m-0 rounded-none bg-white text-slate-700 p-4 text-[11px] font-mono border-none overflow-x-auto flex-1 h-36">
                    {generateSummaryText(activeDiagnosticResult)}
                  </pre>
                </Card>
              </div>
            </div>

            {/* Metrology Weather Radar Scan (Diagnosis outcome) */}
            <div className="interpretation-box" id="interpretation-box">
              <em>Generating diagnostic scan ...</em>
            </div>

            {/* Double-Box Prompt Compilation and Static Summary Section */}
            <div className="report-section">
              <div className="report-box">
                <h4>📊 Standard Summary Report (直接显示简报)</h4>
                <pre id="summary-report-box" style={{ background: "#ffffff", color: "#0f172a", border: "1px solid var(--border-color)" }}>
                  // Run simulation to generate summary...
                </pre>
              </div>
              <div className="report-box">
                <h4>💬 Compiled AI Prompt (大一统 AI 诊断整包)</h4>
                <textarea id="ai-compiled-prompt" readOnly placeholder="Run simulation to compile prompt..."></textarea>
                <button className="report-btn shadow-md shadow-blue-500/10" id="copy-ai-btn" onClick={copyDiagnosticPrompt}>
                  📋 Copy Whole Prompt (For Web Chat)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
