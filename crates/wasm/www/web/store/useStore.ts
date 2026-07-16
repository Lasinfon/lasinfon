"use client";

import { create } from "zustand";

// Defined finite states representing the Ginlix-inspired diagnostic lifecycle
export type AppState = "idle" | "collecting" | "diagnosing" | "rendering";

// Decoupled input contract demanded by the backend API
export interface DiagnosticsInput {
  platform: string;
  purpose: string;
  content: string;
}

interface AppStore {
  // State variables
  state: AppState;
  step: number; // 3-step wizard progress tracker (1: Platform, 2: Purpose, 3: Content)
  inputs: DiagnosticsInput;
  isLoading: boolean;
  activeDiagnosticResult: any | null; // Stores final calibrated simulation result JSON
  diagnosticLogs: string[];

  // Control Flow Parameters (Configurable, no more hardcoding!)
  maxTicks: number;
  sigma: f64;
  seed: string;

  // Event-driven state transition actions
  startFlow: () => void;
  setPlatform: (platform: string) => void;
  setPurpose: (purpose: string) => void;
  setContent: (content: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetFlow: () => void;
  
  // Setters for control flow parameters
  setMaxTicks: (ticks: number) => void;
  setSigma: (sigma: number) => void;
  setSeed: (seed: string) => void;

  // Transition actions for the asynchronous API layer
  setDiagnosing: (logs: string[]) => void;
  setDiagnosticResult: (result: any) => void;
}

/**
 * Global Zustand State Machine for Lasinfon.
 * No polling allowed; transitions are strictly event-driven.
 */
export const useStore = create<AppStore>((set) => ({
  state: "idle",
  step: 1,
  inputs: {
    platform: "",
    purpose: "",
    content: "",
  },
  isLoading: false,
  activeDiagnosticResult: null,
  diagnosticLogs: [],

  // Default control flow values (v6.1.2)
  maxTicks: 14,
  sigma: 0.0,
  seed: "123",

  // transition: idle -> collecting
  startFlow: () => set({ state: "collecting", step: 1, activeDiagnosticResult: null }),
  
  setPlatform: (platform) =>
    set((state) => ({ inputs: { ...state.inputs, platform } })),
    
  setPurpose: (purpose) =>
    set((state) => ({ inputs: { ...state.inputs, purpose } })),
    
  setContent: (content) =>
    set((state) => ({ inputs: { ...state.inputs, content } })),
    
  nextStep: () =>
    set((state) => {
      if (state.step < 3) {
        return { step: state.step + 1 };
      }
      return {};
    }),
    
  prevStep: () =>
    set((state) => {
      if (state.step > 1) {
        return { step: state.step - 1 };
      }
      return {};
    }),
    
  resetFlow: () =>
    set({
      state: "idle",
      step: 1,
      inputs: { platform: "", purpose: "", content: "" },
      isLoading: false,
      activeDiagnosticResult: null,
      diagnosticLogs: [],
    }),
    
  setMaxTicks: (maxTicks) => set({ maxTicks }),
  setSigma: (sigma) => set({ sigma }),
  setSeed: (seed) => set({ seed }),

  // transition: collecting -> diagnosing
  setDiagnosing: (logs) => set({ state: "diagnosing", isLoading: true, diagnosticLogs: logs }),
  
  // transition: diagnosing -> rendering
  setDiagnosticResult: (result) =>
    set({ state: "rendering", isLoading: false, activeDiagnosticResult: result }),
}));
