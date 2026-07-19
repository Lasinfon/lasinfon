// components/WasmLoader.tsx
'use client';

import { useEffect, useState, ReactNode } from 'react';

interface WasmLoaderProps {
  children: (wasm: any) => ReactNode;
}

export default function WasmLoader({ children }: WasmLoaderProps) {
  const [wasm, setWasm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // 重试逻辑
        const retries = 3;
        for (let i = 0; i < retries; i++) {
          try {
            const mod = await import('../public/pkg/lasinfon_wasm.js');
            await mod.default();
            if (mounted) {
              setWasm(mod);
              setLoading(false);
              return;
            }
          } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
          }
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load WASM');
          setLoading(false);
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">⏳ Loading WASM engine...</div>;
  }
  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        ❌ WASM load error: {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Retry
        </button>
      </div>
    );
  }
  return <>{children(wasm)}</>;
}
