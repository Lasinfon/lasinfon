// components/PropagationChart.tsx
'use client';

import { SimulationRecord } from '../types/diagnostic';

interface PropagationChartProps {
  records: SimulationRecord[];
  width?: number;
  height?: number;
}

export default function PropagationChart({ records, width = 600, height = 300 }: PropagationChartProps) {
  if (!records || records.length < 2) {
    return <div className="text-gray-400">Not enough data for chart.</div>;
  }

  const maxG = Math.max(...records.map(r => r.G ?? 0), 0.1);
  const minG = 0;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const points = records.map((r, idx) => {
    const x = padding.left + (idx / (records.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - ((r.G ?? 0) - minG) / (maxG - minG) * innerHeight;
    return { x, y, t: r.t, G: r.G };
  });

  const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');

  return (
    <svg width={width} height={height} className="border border-gray-200 rounded bg-white">
      {/* Axes */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#ccc" />
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#ccc" />

      {/* Y labels */}
      <text x={padding.left - 8} y={padding.top + 4} textAnchor="end" fontSize="10" fill="#666">
        {maxG.toFixed(2)}
      </text>
      <text x={padding.left - 8} y={height - padding.bottom + 4} textAnchor="end" fontSize="10" fill="#666">
        {minG.toFixed(2)}
      </text>

      {/* Path */}
      <polyline points={points.map(p => p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ')} fill="none" stroke="#2563eb" strokeWidth="2" />

      {/* Points (optional) */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill="#2563eb" />
      ))}

      {/* Title */}
      <text x={width/2} y={16} textAnchor="middle" fontSize="12" fill="#333" fontWeight="500">
        G_active over time
      </text>
    </svg>
  );
}
