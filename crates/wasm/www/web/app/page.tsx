// app/page.tsx
'use client';

import { Provider } from 'react-redux';
import { store } from '../store';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setInputText, setStep } from '../store/slices/uiSlice';
import { setMaxTicks, setSigma, setSeed, setEnableEmergence } from '../store/slices/configSlice';
import { resetDiagnostic } from '../store/slices/diagnosticSlice';
import WasmLoader from '../components/WasmLoader';
import DiagnosticRunner from '../components/DiagnosticRunner';
import SimulationReport from '../components/SimulationReport';
import PropagationChart from '../components/PropagationChart';

function HomeContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { step, inputText } = useSelector((state: RootState) => state.ui);
  const { maxTicks, sigma, seed, enableEmergence } = useSelector((state: RootState) => state.config);
  const { result, isLoading, error, logs } = useSelector((state: RootState) => state.diagnostic);

  const handleNext = () => {
    if (step === 1 && inputText.trim().length < 5) {
      alert('Please enter at least 5 characters.');
      return;
    }
    if (step === 3) {
      // Trigger diagnostic (run from runner)
      // We'll let the runner handle it, but we can set step to 4
      dispatch(setStep(4));
    } else {
      dispatch(setStep((step + 1) as 1|2|3|4));
    }
  };

  const handleBack = () => {
    if (step > 1) dispatch(setStep((step - 1) as 1|2|3|4));
  };

  const handleReset = () => {
    dispatch(resetDiagnostic());
    dispatch(setStep(1));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-light mb-2">⚡ Lasinfon · Social Laser Metrology</h1>
        <p className="text-gray-500 mb-6">Deterministic propagation engine · v6.3.0</p>

        {/* Wizard Stepper */}
        <div className="flex items-center gap-4 mb-6 border-b pb-2">
          {[1,2,3,4].map((s) => (
            <div key={s} className={`flex items-center gap-2 ${step === s ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${step === s ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {s}
              </span>
              <span className="hidden sm:inline">
                {s === 1 ? 'Input' : s === 2 ? 'Config' : s === 3 ? 'Run' : 'Results'}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Input */}
        {step === 1 && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-medium mb-4">Enter your content</h2>
            <textarea
              className="w-full h-40 border rounded p-3 font-mono text-sm"
              placeholder="Paste your ad copy, article, or script here (min 5 chars)..."
              value={inputText}
              onChange={(e) => dispatch(setInputText(e.target.value))}
            />
            <div className="mt-4 flex justify-end">
              <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Config */}
        {step === 2 && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-medium mb-4">Simulation Parameters</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                Max Ticks
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20"
                  value={maxTicks}
                  onChange={(e) => dispatch(setMaxTicks(Number(e.target.value)))}
                  min={1}
                />
              </label>
              <label className="flex items-center gap-2">
                Sigma
                <input
                  type="number"
                  step="0.01"
                  className="border rounded px-2 py-1 w-20"
                  value={sigma}
                  onChange={(e) => dispatch(setSigma(Number(e.target.value)))}
                  min={0}
                />
              </label>
              <label className="flex items-center gap-2">
                Seed
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20"
                  value={seed}
                  onChange={(e) => dispatch(setSeed(Number(e.target.value)))}
                  min={0}
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={enableEmergence}
                  onChange={(e) => dispatch(setEnableEmergence(e.target.checked))}
                />
                Enable Emergence
              </label>
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={handleBack} className="px-4 py-2 border rounded hover:bg-gray-50">
                ← Back
              </button>
              <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Run */}
        {step === 3 && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-medium mb-4">Ready to Diagnose</h2>
            <p className="text-gray-600 mb-4">We will evaluate your content and run the propagation simulation.</p>
            <WasmLoader>
              {(wasm) => <DiagnosticRunner wasm={wasm} />}
            </WasmLoader>
            <div className="mt-6 flex justify-between">
              <button onClick={handleBack} className="px-4 py-2 border rounded hover:bg-gray-50">
                ← Back
              </button>
              {/* The runner already has its own run button; we keep navigation */}
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-medium mb-4">Results</h2>
            {isLoading && <div className="text-center py-8">⏳ Running simulation...</div>}
            {error && <div className="text-red-600">❌ {error}</div>}
            {result && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Propagation Chart</h3>
                  <PropagationChart records={result.simulation.records || []} />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Summary Report</h3>
                  <SimulationReport result={result.simulation} />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Raw JSON</h3>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-60">
                    {result.rawResponse || JSON.stringify(result.simulation, null, 2)}
                  </pre>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Start Over
                </button>
              </div>
            )}
            {!isLoading && !result && !error && (
              <div className="text-gray-400">No results yet. Go back and run diagnosis.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Provider store={store}>
      <HomeContent />
    </Provider>
  );
}
