// components/DiagnosticRunner.tsx
'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { startDiagnostic, addDiagnosticLog, setDiagnosticResult, setDiagnosticError } from '../store/slices/diagnosticSlice';
import { setStep } from '../store/slices/uiSlice';
import { ScenarioInput, DiagnosticResult } from '../types/diagnostic';

interface DiagnosticRunnerProps {
  wasm: any;
}

export default function DiagnosticRunner({ wasm }: DiagnosticRunnerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { inputText } = useSelector((state: RootState) => state.ui);
  const { maxTicks, sigma, seed, enableEmergence } = useSelector((state: RootState) => state.config);
  const { isLoading, logs, result, error } = useSelector((state: RootState) => state.diagnostic);

  const [statusMsg, setStatusMsg] = useState('');

  const runDiagnostic = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text to analyze.');
      return;
    }

    dispatch(startDiagnostic());
    dispatch(setStep(4)); // go to results step

    try {
      // Step 1: Call API to get scenario
      dispatch(addDiagnosticLog('[1/4] Sending text to AI evaluator...'));
      const resp = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, engine: 'auto' }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'API error');
      dispatch(addDiagnosticLog(`[2/4] AI evaluated (engine: ${data.engine})`));
      dispatch(addDiagnosticLog('[3/4] Assembling scenario...'));

      const scenario = data.scenario as ScenarioInput;
      // Log scenario scores
      const scoreStr = Object.entries(scenario.scores)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');
      dispatch(addDiagnosticLog(`Scores: ${scoreStr}`));

      // Step 2: Run WASM simulation
      dispatch(addDiagnosticLog('[4/4] Running propagation simulation...'));
      const config = {
        system: { alpha: 0.2 },
        stochastic: { sigma: 0.15, gamma_saturation: 0.5 },
        state_transfer: {
          social_proof: 0.3,
          autocatalysis: 0.2,
          social_pressure: 0.1,
        },
        weights: {
          seed_weight: 0.15,
          S_weight: 0.20,
          R_weight: 0.35,
          psych_weight: 0.30,
        },
        mapping: {
          K_pot: { a: 0.8, b: 1.2 },
          K_soil: { a: 0.5, b: 1.5 },
          K_comp: { a: 0.6, b: 1.4 },
        },
      };

      const resultStr = wasm.simulate(
        JSON.stringify(config),
        JSON.stringify(scenario),
        maxTicks,
        sigma,
        BigInt(seed),
        enableEmergence
      );
      const simResult = JSON.parse(resultStr);
      dispatch(addDiagnosticLog('✅ Simulation complete'));

      const diagnosticResult: DiagnosticResult = {
        scenario,
        simulation: simResult,
        engine: data.engine || 'unknown',
        logs: logs,
        rawResponse: JSON.stringify(simResult, null, 2),
      };
      dispatch(setDiagnosticResult(diagnosticResult));
    } catch (err: any) {
      dispatch(setDiagnosticError(err.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Diagnostic Runner</h3>
        <button
          onClick={runDiagnostic}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Running...' : 'Run Diagnosis'}
        </button>
      </div>

      {/* Logs */}
      <div className="bg-gray-50 p-3 rounded max-h-48 overflow-y-auto text-xs font-mono">
        {logs.map((log, i) => (
          <div key={i} className="border-b border-gray-200 py-0.5">{log}</div>
        ))}
        {error && <div className="text-red-600 font-bold">❌ {error}</div>}
        {!isLoading && logs.length === 0 && !error && (
          <span className="text-gray-400">Ready. Click "Run Diagnosis" to start.</span>
        )}
      </div>

      {/* Result preview (optional) */}
      {result && (
        <div className="text-xs text-green-700">
          ✅ Diagnosis complete. See report below.
        </div>
      )}
    </div>
  );
}
