"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { TypingText } from "@/components/TypingText";

export default function Home() {
  const {
    state,
    step,
    inputs,
    diagnosticLogs,
    activeDiagnosticResult,
    startFlow,
    setPlatform,
    setPurpose,
    setContent,
    nextStep,
    prevStep,
    resetFlow,
    setDiagnosing,
    setDiagnosticResult,
  } = useStore();

  const [wasmModule, setWasmModule] = useState<any>(null);
  const [logIndex, setLogIndex] = useState(0);

  const gridCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const metricsCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ── Load WASM Dynamically from Next.js Public Directory ──
  useEffect(() => {
    import("../public/pkg/lasinfon_wasm.js")
      .then(async (mod) => {
        await mod.default();
        setWasmModule(mod);
      })
      .catch((err) => console.error("Failed to load WASM in Next.js", err));
  }, []);

  // ── Render Charts on State Change ──
  useEffect(() => {
    if (state === "rendering" && activeDiagnosticResult && wasmModule) {
      drawAllCharts(activeDiagnosticResult);
    }
  }, [state, activeDiagnosticResult, wasmModule]);

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

  // ── Canvas Drawing Engines ──
  const drawAllCharts = (records: any[]) => {
    const lastRecord = records[records.length - 1];
    drawGrid(lastRecord);
    drawChart(records);
    drawMetrics(records);
  };

  const drawGrid = (record: any) => {
    const canvas = gridCanvasRef.current;
    if (!canvas || !record) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const C_t = record.C_t;
    const cells = 15;
    const size = canvas.width / cells;
    for (let x = 0; x < cells; x++) {
      for (let y = 0; y < cells; y++) {
        const active = Math.random() < C_t;
        ctx.fillStyle = active ? `rgba(124, 58, 237, ${0.3 + C_t * 0.7})` : "#f1f5f9";
        ctx.strokeStyle = "#e2e8f0";
        ctx.fillRect(x * size, y * size, size, size);
        ctx.strokeRect(x * size, y * size, size, size);
      }
    }
  };

  const drawChart = (records: any[]) => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pad = 30;
    const w = canvas.width - pad * 2;
    const h = canvas.height - pad * 2;
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad); ctx.lineTo(pad, canvas.height - pad);
    ctx.lineTo(canvas.width - pad, canvas.height - pad);
    ctx.stroke();

    const max_G = Math.max(
      ...records.map(r => getVal(r.G, 0.0)),
      ...records.map(r => getVal(r.G_std, getVal(r.G, 0.0))),
      2.0
    );
    const len = records.length;

    // Draw G_std (Standard Reference Potency - Blue Dashed)
    ctx.strokeStyle = "#3b82f6";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    records.forEach((r, idx) => {
      const x = len > 1 ? pad + (idx / (len - 1)) * w : pad;
      const y = canvas.height - pad - (getVal(r.G_std, getVal(r.G, 0.0)) / max_G) * h;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw G_active (Active Environment - Purple Solid)
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 3;
    ctx.beginPath();
    records.forEach((r, idx) => {
      const x = len > 1 ? pad + (idx / (len - 1)) * w : pad;
      const y = canvas.height - pad - (getVal(r.G, 0.0) / max_G) * h;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  const drawMetrics = (records: any[]) => {
    const canvas = metricsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pad = 35;
    const w = canvas.width - pad * 2;
    const h = canvas.height - pad * 2;
    ctx.strokeStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(pad, pad); ctx.lineTo(pad, canvas.height - pad);
    ctx.lineTo(canvas.width - pad, canvas.height - pad);
    ctx.stroke();

    const max_R = 10;
    const max_C = 1.0;
    const len = records.length;

    // R_t (Resonance Heat - Pink)
    ctx.strokeStyle = "#db2777";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    records.forEach((r, idx) => {
      const x = len > 1 ? pad + (idx / (len - 1)) * w : pad;
      const y = canvas.height - pad - (getVal(r.R_t, 0.0) / max_R) * h;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // C_t (Active Nodes - Purple)
    ctx.strokeStyle = "#7c3aed";
    ctx.beginPath();
    records.forEach((r, idx) => {
      const x = len > 1 ? pad + (idx / (len - 1)) * w : pad;
      const y = canvas.height - pad - (getVal(r.C_t, 0.0) / max_C) * h;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

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

      const configPreset = {
        system: { alpha: 0.2 },
        stochastic: { eta: 0.3, theta: 0.01, gamma_saturation: 0.5 },
        state_transfer: {
          gamma_social_proof: 0.5, gamma_self_catalysis: 0.1, gamma_social_pressure: 0.3,
          gamma_algo_trending: 0.05, attention_decay: 0.0, lambda_R_relaxation: 0.1,
          lambda_K_relaxation: 0.1, lambda_C_relaxation: 0.3
        },
        omega: { trigger_T: 6, trigger_R: 7, trigger_social_currency: 7 },
        weights: {
          seed: { w_emotion_arousal: 0.21, w_social_currency: 0.18, w_practical_value: 0.09, w_info_advantage: 0.12, w_narrative_completeness: 0.125, w_remix_openness: 0.125, w_source_credibility: 0.105, w_personification: 0.045 },
          S: { w_cognitive: 0.6, w_operational: 0.4 },
          R: { w_content: 0.35, w_audience: 0.4, w_environment: 0.25 },
          mu_psych: { w_antipathy: 0.6, w_suspicion: 0.4 },
          trust: { w_source: 0.6, w_audience: 0.4 },
          W: { w_enhance: 0.4, w_trust: 0.3, w_unique: 0.2, w_R: 0.1 }
        },
        mapping: {
          K_pot: { base: 0.8, slope: 0.7, w_surge: 0.4, w_current: 0.4, w_terrain: 0.2 },
          K_soil: { base: 0.3, slope: 1.2, w_density: 0.6, w_connect: 0.4 },
          K_comp: { base: 1.0, slope: 0.7 },
          omega: { scale: 2.5, denom: 1000 }
        }
      };

      const result_string = wasmModule.simulate(
        JSON.stringify(configPreset),
        JSON.stringify(scenarioData),
        15,
        0.05,
        BigInt(123),
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

      setDiagnosticResult(records);

    } catch (err: any) {
      console.error(err);
      resetFlow();
      alert("Simulation Error: " + err.message);
    }
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
            <Card className="w-full max-w-xl border border-slate-200 p-8">
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
                      { name: "Douyin", desc: "High-Arousal Short-Video Resonance • Optimized for high emotional amplification" },
                      { name: "Xiaohongshu", desc: "Visual Seeding & Social Currency • Tailored for organic recommendation and aesthetics" },
                      { name: "WeChat", desc: "Private Circle Trust-Based Propagation • Designed for high-authority private forwarding" }
                    ].map((p) => (
                      <div
                        key={p.name}
                        onClick={() => setPlatform(p.name)}
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
                  <textarea
                    value={inputs.content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your copy here (minimum 5 characters)..."
                    className="my-4 h-40 focus:border-brand-primary font-mono text-sm"
                  />
                  <div className="flex justify-end text-[11px] text-slate-400 font-bold">
                    {inputs.content.length} characters
                  </div>
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
          <div className="w-full flex flex-col gap-6">
            
            {/* Top 4 KPI Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Standard Potency (G_std)
                </span>
                <span className="text-3xl font-bold text-brand-blue tracking-tight">
                  {getVal(
                    activeDiagnosticResult[activeDiagnosticResult.length - 1].G_std,
                    activeDiagnosticResult[activeDiagnosticResult.length - 1].G
                  ).toFixed(2)}
                </span>
                <span className="text-[11px] text-slate-400 mt-2 font-medium">
                  Inherent copy strength (K=1.0)
                </span>
              </Card>

              <Card className="flex flex-col">
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

              <Card className="flex flex-col">
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

              <Card className="flex flex-col">
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

            {/* Main Graphs Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Chart (Exposure G Curve) */}
              <Card className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <div className="card-title">Dual-Track Exposure Wave (G)</div>
                  <div className="flex gap-4">
                    <div className="legend-item"><div className="legend-color bg-brand-blue" /> G_std (Standard)</div>
                    <div className="legend-item"><div className="legend-color bg-brand-purple" /> G_active (Active)</div>
                  </div>
                </div>
                <canvas ref={chartCanvasRef} width="650" height="240" className="w-full h-64" />
              </Card>

              {/* Right Chart (Polarization Grid) */}
              <Card>
                <div className="card-title mb-4">Polarization Active Grid (C_t)</div>
                <div className="flex items-center justify-center h-64">
                  <canvas ref={gridCanvasRef} width="240" height="240" className="w-60 h-60" />
                </div>
              </Card>
            </div>

            {/* Bottom Large Metrics Chart & Report Box */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* R_t & C_t line chart */}
              <Card className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <div className="card-title">Dynamic Resonance (R_t) & Activation (C_t)</div>
                  <div className="flex gap-4">
                    <div className="legend-item"><div className="legend-color bg-brand-pink" /> R_t (Resonance Heat)</div>
                    <div className="legend-item"><div className="legend-color bg-brand-purple" /> C_t (Active Ratio)</div>
                  </div>
                </div>
                <canvas ref={metricsCanvasRef} width="650" height="180" className="w-full h-44" />
              </Card>

              {/* High-fidelity diagnostic summary cards */}
              <div className="flex flex-col gap-6">
                <Card className="p-0 overflow-hidden flex-1 flex flex-col justify-between">
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
          </div>
        )}
      </div>
    </div>
  );
}
