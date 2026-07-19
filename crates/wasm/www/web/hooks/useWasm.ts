import { useState, useEffect } from 'react';

export function useWasm() {
  const [wasmModule, setWasmModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const mod = await import('../public/pkg/lasinfon_wasm.js');
        await mod.default();
        if (mounted) {
          setWasmModule(mod);
          setLoading(false);
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

  return { wasmModule, loading, error };
}
