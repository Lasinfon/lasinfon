"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { TypingText } from "@/components/TypingText";
import EnvironmentPanel from "@/components/EnvironmentPanel";

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
    customEnv,
    customEnvActive,
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
    setCustomEnv,
    clearCustomEnv,
  } = useStore();

  const [wasmModule, setWasmModule] = useState<any>(null);
  const [logIndex, setLogIndex] = useState(0);
  const [apiEngine, setApiEngine] = useState<string>("Dev Sandbox (Mock)");
  const [interpreterPrompt, setInterpreterPrompt] = useState<string>("");

  // ── 环境参数本地状态（Step 3 中使用） ──
  const [envSource, setEnvSource] = useState<'preset' | 'manual' | 'llm'>('preset');
  const [manualEnvJson, setManualEnvJson] = useState<string>('');
  const [jsonError, setJsonError] = useState<string>('');

  // ── 加载 AI 解读 Prompt ──
  useEffect(() => {
    fetch('/api/prompt')
      .then(res => res.json())
      .then(data => {
        if (data.prompt) setInterpreterPrompt(data.prompt);
      })
      .catch(err => console.error('Failed to load interpreter prompt:', err));
  }, []);

  // 获取当前平台的预设环境（用于显示）
  const getCurrentPreset = () => {
    const target = (presetsData as any)[inputs.platform.toLowerCase()] || (presetsData as any)["standard"];
    return {
      env: target?.scenario?.env || {},
      meme: target?.scenario?.meme || {},
    };
  };

  // 当平台切换时，重置环境状态为预设
  const handlePlatformSelect = (platform: string) => {
    setPlatform(platform);
    const target = (presetsData as any)[platform.toLowerCase()] || (presetsData as any)["standard"];
    if (target) {
      setMaxTicks(target.max_ticks);
      setSigma(target.sigma);
      setSeed(target.seed.toString());
    }
    // 重置环境状态
    setEnvSource('preset');
    setManualEnvJson('');
    setJsonError('');
    clearCustomEnv();
  };

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

  // ── Non-LLM Mathematical Summary Generator (v6.1.1 - High-Fidelity Metrology Explanation) ──
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

    return `=== LASINFON METROLOGY SIMULATION SUMMARY REPORT ===
Timeline ticks: 0 to ${last.t} (Total steps: ${records.length})

[INITIAL STATE (t=0) - COLD START SECTION]:
- G_active (Active Simulated Exposure): ${getVal(first.G).toFixed(2)}
- G_std (Standard Reference Potency / SRP): ${getVal(first.G_std, first.G).toFixed(2)}
- K_mult (Environmental Multiplier / Wind Speed): ${getVal(first.K_mult, 1.0).toFixed(2)}x
- R_t (Resonance Heat / Emotional Alignment): ${getVal(first.R_t).toFixed(2)}
- C_t (Active Resonance Node Ratio): ${(getVal(first.C_t)*100).toFixed(1)}%
- mu_psych (Psychological Friction / Social Resistance): ${getVal(first.mu_psych_t).toFixed(2)}

[PEAK STATE (t=${peak_tick}) - INFLECTION POINT]:
- Peak G_active: ${peak_G.toFixed(2)}
- Peak G_std (Standard Potency at Peak): ${getVal(records[peak_tick]?.G_std, peak_G).toFixed(2)}
- Peak K_mult (Wind Speed at Peak): ${getVal(records[peak_tick]?.K_mult, 1.0).toFixed(2)}x

[FINAL STATE (t=${last.t}) - STEADY STATE / EXHAUSTION]:
- Final G_active: ${getVal(last.G).toFixed(2)}
- Final G_std: ${getVal(last.G_std, last.G).toFixed(2)}
- Final K_mult: ${getVal(last.K_mult, 1.0).toFixed(2)}x
- Final R_t: ${getVal(last.R_t).toFixed(2)}
- Final C_t: ${(getVal(last.C_t)*100).toFixed(1)}%

[INTEGRATED PROPAGATION METRICS - LIFECYCLE INTEGRAL]:
- Cumulative Exposure (G_total - Area Under Active Curve): ${total_G.toFixed(2)}
- Average Gain Multiplier (lambda_eff - Average Growth Velocity): ${avg_lambda_eff.toFixed(4)}
- Autonomous Growth Crossed Threshold? ${crossed_threshold ? "YES (at t=" + threshold_tick + ")" : "NO"}
- Final Propagation Quadrant (Phase State): ${last.quadrant}
======================================================`;
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

      // Extract active API Engine type (Mock vs. LLM)
      if (scenarioData.engine) {
        setApiEngine(scenarioData.engine);
      } else {
        setApiEngine("Dev Sandbox (Mock)");
      }

      // ── 根据环境来源决定是否覆盖环境参数 ──
      if (envSource === 'manual' && manualEnvJson.trim()) {
        try {
          const parsed = JSON.parse(manualEnvJson);
          if (parsed.meme && parsed.env) {
            scenarioData.env = { ...scenarioData.env, ...parsed.env };
            scenarioData.meme = { ...scenarioData.meme, ...parsed.meme };
            setCustomEnv(parsed.env, parsed.meme);
          } else {
            throw new Error("JSON must contain 'meme' and 'env' keys");
          }
        } catch (err: any) {
          setJsonError(err.message);
          throw new Error("环境 JSON 解析错误: " + err.message);
        }
      } else {
        // 使用预设，清除 store 中的自定义环境
        clearCustomEnv();
      }

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
        maxTicks,
        sigma,
        BigInt(seed),
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

  // ── 重新推演（结果页使用） ──
  const reExecuteWithCurrentEnv = (env: any, meme: any) => {
    setCustomEnv(env, meme);
    // 同步到本地状态（使 Step 3 面板若重新打开也保持一致）
    setEnvSource('manual');
    setManualEnvJson(JSON.stringify({ meme, env }, null, 2));
    setJsonError('');
    executeDiagnostics();
  };

  // ── 复制功能 ──
  const copyFullPackage = async () => {
    if (!activeDiagnosticResult) return;
    const report = generateSummaryText(activeDiagnosticResult);
    let prompt = interpreterPrompt;
    if (!prompt) {
      try {
        const res = await fetch('/api/prompt');
        const data = await res.json();
        prompt = data.prompt || '';
      } catch (_) {}
    }
    const fullText = `${prompt}\n\n${report}`;
    await navigator.clipboard.writeText(fullText);
    alert('📋 完整诊断包已复制（含 Prompt + 报告）');
  };

  const copyReportOnly = async () => {
    if (!activeDiagnosticResult) return;
    const report = generateSummaryText(activeDiagnosticResult);
    await navigator.clipboard.writeText(report);
    alert('📄 报告已复制');
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

  // ── 渲染 ──
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Left Sidebar ── */}
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

        {/* ── STATE 2: COLLECTING ── */}
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
                        onClick={() => handlePlatformSelect(p.name)}
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

                  {/* ── Advanced Controls ── */}
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
                          max={300}
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

                  {/* ── 🌍 环境参数（可选）—— 默认折叠，文本框输入 ── */}
                  <details className="mt-4 border-t border-slate-200 pt-4">
                    <summary className="text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors">
                      🌍 Environment Parameters (optional)
                    </summary>
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-wrap gap-3 text-xs">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="envSource"
                            value="preset"
                            checked={envSource === 'preset'}
                            onChange={() => {
                              setEnvSource('preset');
                              setManualEnvJson('');
                              setJsonError('');
                              clearCustomEnv();
                            }}
                          />
                          <span>预设（当前平台）</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="envSource"
                            value="manual"
                            checked={envSource === 'manual'}
                            onChange={() => {
                              setEnvSource('manual');
                              if (customEnvActive && customEnv) {
                                setManualEnvJson(JSON.stringify({ meme: customEnv.meme, env: customEnv.env }, null, 2));
                              } else {
                                const preset = getCurrentPreset();
                                setManualEnvJson(JSON.stringify({ meme: preset.meme, env: preset.env }, null, 2));
                              }
                              setJsonError('');
                            }}
                          />
                          <span>手动输入 JSON</span>
                        </label>
                        <label className="flex items-center gap-1 text-slate-400 cursor-not-allowed">
                          <input type="radio" name="envSource" value="llm" disabled />
                          <span>LLM评估（即将开放）</span>
                        </label>
                      </div>

                      {envSource === 'manual' && (
                        <div className="border-t border-slate-100 pt-3">
                          <textarea
                            value={manualEnvJson}
                            onChange={(e) => {
                              setManualEnvJson(e.target.value);
                              setJsonError('');
                            }}
                            rows={8}
                            className="w-full font-mono text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-brand-primary"
                            placeholder={`{\n  "meme": {\n    "social_currency": 6.5,\n    "share_cost": 4.0,\n    ...\n  },\n  "env": {\n    "population_density": 8.5,\n    ...\n  }\n}`}
                          />
                          {jsonError && (
                            <div className="text-xs text-red-600 mt-1">❌ {jsonError}</div>
                          )}
                          <div className="text-[10px] text-slate-400 mt-1">
                            💡 请粘贴包含 <code>meme</code> 和 <code>env</code> 的 JSON。若留空，则使用预设。
                          </div>
                        </div>
                      )}
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

        {/* ── STATE 3: DIAGNOSING ── */}
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

        {/* ── STATE 4: RENDERING ── */}
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

            {/* ── 环境参数面板（结果页，滑块微调，默认折叠） ── */}
            <details className="border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
              <summary className="text-xs font-bold text-slate-600 cursor-pointer hover:text-slate-800">
                🌍 环境参数（微调，点击展开）
              </summary>
              <div className="mt-3">
                <EnvironmentPanel
                  presetEnv={presetsData.standard?.scenario?.env || {}}
                  presetMeme={presetsData.standard?.scenario?.meme || {}}
                  onApply={(env, meme) => {
                    reExecuteWithCurrentEnv(env, meme);
                  }}
                  initialEnv={customEnvActive ? customEnv?.env : undefined}
                  initialMeme={customEnvActive ? customEnv?.meme : undefined}
                />
              </div>
            </details>

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
              <Card className="lg:col-span-2 p-6 flex flex-col justify-between border border-slate-200 hover:shadow-md transition-all duration-300 relative">
                <div className="flex justify-between items-center mb-4">
                  <div className="card-title">Dual-Track Exposure Wave (G)</div>
                  <div className="flex gap-4">
                    <div className="legend-item"><div className="legend-color bg-brand-primary" /> G_std (Standard)</div>
                    <div className="legend-item"><div className="legend-color bg-brand-purple" /> G_active (Active)</div>
                  </div>
                </div>
                
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

                    {activeDiagnosticResult.map((r: any, idx: number) => (
                      idx % Math.max(1, Math.round(len / 10)) === 0 && (
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

              <Card className="p-6 flex flex-col justify-between border border-slate-200 hover:shadow-md transition-all duration-300">
                <div className="card-title mb-4">Polarization Active Grid (C_t)</div>
                <div className="flex items-center justify-center h-64">
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

            {/* ── 原始 JSON 数据（折叠） ── */}
            <details className="border border-slate-200 rounded-lg bg-white shadow-sm">
              <summary className="px-4 py-2 font-mono text-xs text-slate-600 cursor-pointer hover:text-slate-800">
                📄 原始 JSON 数据
              </summary>
              <pre className="p-4 bg-slate-50 text-xs font-mono overflow-auto max-h-96 border-t border-slate-200">
                {JSON.stringify(activeDiagnosticResult, null, 2)}
              </pre>
            </details>

            {/* ── 复制操作按钮 ── */}
            <div className="flex flex-wrap gap-3 mt-2">
              <button
                onClick={copyFullPackage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
              >
                📋 复制完整诊断包（Prompt + 报告）
              </button>
              <button
                onClick={copyReportOnly}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm font-medium"
              >
                📄 仅复制报告
              </button>
            </div>

            {/* ── ⚙️ METROLOGY INSPECTOR & CALIBRATION SNAPSHOT ── */}
            <Card className="p-6 border border-slate-200 hover:shadow-md transition-all duration-300">
              <div className="card-title mb-4">⚙️ METROLOGY INSPECTOR & CALIBRATION SNAPSHOT</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-slate-600 font-mono">
                <div className="flex flex-col gap-1 border-r border-slate-100 pr-4">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Active Preset</span>
                  <span className="font-bold text-slate-800">{inputs.platform} Mode</span>
                </div>
                <div className="flex flex-col gap-1 border-r border-slate-100 pr-4">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Simulation parameters</span>
                  <span>Max Ticks: <span className="font-bold text-slate-800">{maxTicks}</span></span>
                  <span>Sigma: <span className="font-bold text-slate-800">{sigma}</span></span>
                  <span>Seed: <span className="font-bold text-slate-800">{seed}</span></span>
                </div>
                <div className="flex flex-col gap-1 border-r border-slate-100 pr-4">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Active API Engine</span>
                  <span className={`badge ${apiEngine.includes("LLM") ? "badge-green" : "badge-yellow"} w-fit mt-0.5`}>
                    {apiEngine}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Environment Source</span>
                  <span className={`font-bold ${customEnvActive ? "text-orange-500" : "text-brand-green"}`}>
                    {customEnvActive ? "🟡 自定义 (手动修改)" : "🟢 预设 (标准场景)"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
