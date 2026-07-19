"use client";

import { create } from "zustand";

export type AppState = "idle" | "collecting" | "diagnosing" | "rendering";

export interface DiagnosticsInput {
  platform: string;
  purpose: string;
  content: string;
}

interface AppStore {
  state: AppState;
  step: number;
  inputs: DiagnosticsInput;
  isLoading: boolean;
  activeDiagnosticResult: any | null;
  diagnosticLogs: string[];
  maxTicks: number;
  sigma: number;
  seed: string;
  customEnv: any | null;
  customEnvActive: boolean;
  diagnosticScores: any | null;  // 新增：存储评分结果

  startFlow: () => void;
  setPlatform: (platform: string) => void;
  setPurpose: (purpose: string) => void;
  setContent: (content: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetFlow: () => void;
  setMaxTicks: (ticks: number) => void;
  setSigma: (sigma: number) => void;
  setSeed: (seed: string) => void;
  setDiagnosing: (logs: string[]) => void;
  setDiagnosticResult: (result: any) => void;
  setCustomEnv: (env: any, meme: any) => void;
  clearCustomEnv: () => void;
  setDiagnosticScores: (scores: any) => void;
}

export const useStore = create<AppStore>((set) => ({
  state: "idle",
  step: 1,
  inputs: { platform: "", purpose: "", content: "" },
  isLoading: false,
  activeDiagnosticResult: null,
  diagnosticLogs: [],
  maxTicks: 100,
  sigma: 0.05,
  seed: "1",
  customEnv: null,
  customEnvActive: false,
  diagnosticScores: null,

  startFlow: () => set({ state: "collecting", step: 1, activeDiagnosticResult: null }),
  setPlatform: (platform) => set((state) => ({ inputs: { ...state.inputs, platform } })),
  setPurpose: (purpose) => set((state) => ({ inputs: { ...state.inputs, purpose } })),
  setContent: (content) => set((state) => ({ inputs: { ...state.inputs, content } })),
  nextStep: () => set((state) => ({ step: state.step < 3 ? state.step + 1 : state.step })),
  prevStep: () => set((state) => ({ step: state.step > 1 ? state.step - 1 : state.step })),
  resetFlow: () => set({ 
    state: "idle", 
    step: 1, 
    inputs: { platform: "", purpose: "", content: "" }, 
    isLoading: false, 
    activeDiagnosticResult: null, 
    diagnosticLogs: [], 
    customEnv: null, 
    customEnvActive: false,
    diagnosticScores: null,
  }),
  setMaxTicks: (maxTicks) => set({ maxTicks }),
  setSigma: (sigma) => set({ sigma }),
  setSeed: (seed) => set({ seed }),
  setDiagnosing: (logs) => set({ state: "diagnosing", isLoading: true, diagnosticLogs: logs }),
  setDiagnosticResult: (result) => set({ state: "rendering", isLoading: false, activeDiagnosticResult: result }),
  setCustomEnv: (env, meme) => set({ customEnv: { env, meme }, customEnvActive: true }),
  clearCustomEnv: () => set({ customEnv: null, customEnvActive: false }),
  setDiagnosticScores: (scores) => set({ diagnosticScores: scores }),
}));
