import { useState } from 'react';
import { useStore } from '@/store/useStore';
import presetsData from '../config/presets.json';

export function useDiagnostics(wasmModule: any) {
  const {
    inputs,
    maxTicks,
    sigma,
    seed,
    envSource,
    manualEnvJson,
    setCustomEnv,
    clearCustomEnv,
    setDiagnosing,
    setDiagnosticScores,
    setDiagnosticResult,
    resetFlow,
    setApiEngine, // 新增
  } = useStore();

  const [logIndex, setLogIndex] = useState(0);
  const [jsonError, setJsonError] = useState('');

  const executeDiagnostics = async () => {
    setLogIndex(0);
    setDiagnosing(["REQUEST_INITIATED ── [1/4] 初始化引擎共振中，解构文本词法..."]);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      if (!res.ok) throw new Error("Contract verification failed");
      const scenarioData = await res.json();

      // 设置引擎类型
      if (scenarioData.engine) setApiEngine(scenarioData.engine);
      else setApiEngine("Dev Sandbox (Mock)");

      // 处理环境参数
      if (envSource === 'manual' && manualEnvJson.trim()) {
        try {
          const parsed = JSON.parse(manualEnvJson);
          if (parsed.meme && parsed.env) {
            scenarioData.env = { ...scenarioData.env, ...parsed.env };
            scenarioData.meme = { ...scenarioData.meme, ...parsed.meme };
            setCustomEnv(parsed.env, parsed.meme);
          } else throw new Error("JSON must contain 'meme' and 'env' keys");
        } catch (err: any) {
          setJsonError(err.message);
          throw new Error("环境 JSON 解析错误: " + err.message);
        }
      } else clearCustomEnv();

      setDiagnosticScores(scenarioData);

      // 模拟日志
      setLogIndex(1);
      useStore.setState((state) => ({
        diagnosticLogs: [...state.diagnosticLogs, "STREAM_STARTED ── [2/4] 环境参数注入中，校准社交摩擦阻尼..."]
      }));
      await new Promise(r => setTimeout(r, 600));

      setLogIndex(2);
      useStore.setState((state) => ({
        diagnosticLogs: [...state.diagnosticLogs, "STREAM_COMPLETED ── [3/4] 运行 1000 次蒙特卡洛集合预报，解算状态转移主方程..."]
      }));
      await new Promise(r => setTimeout(r, 600));

      if (!wasmModule) throw new Error("WASM engine not ready");

      const targetPreset = (presetsData as any)[inputs.platform.toLowerCase()] || (presetsData as any)["standard"];
      const fullScenario = {
        ...targetPreset.scenario,
        scores: scenarioData.scores,
        meme: scenarioData.meme,
        env: scenarioData.env,
      };

      const result_string = wasmModule.simulate(
        JSON.stringify(targetPreset.config),
        JSON.stringify(fullScenario),
        maxTicks, sigma, BigInt(seed), false
      );
      const records = JSON.parse(result_string);

      setLogIndex(3);
      useStore.setState((state) => ({
        diagnosticLogs: [...state.diagnosticLogs, "PARSING_DONE ── [4/4] 解译自生长传播谱线，生成物理诊断简报..."]
      }));
      await new Promise(r => setTimeout(r, 400));

      setDiagnosticResult(records);
    } catch (err: any) {
      console.error(err);
      resetFlow();
      alert("Simulation Error: " + err.message);
    }
  };

  return { executeDiagnostics, logIndex, jsonError, setJsonError };
}
