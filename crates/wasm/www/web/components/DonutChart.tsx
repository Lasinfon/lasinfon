'use client';

import React from 'react';

interface DonutChartProps {
  data: { label: string; value: number }[];
  size?: number;
  colors?: string[];
}

export default function DonutChart({ data, size = 160, colors }: DonutChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-slate-400 text-xs">暂无数据</div>;
  }

  const total = data.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) {
    return <div className="text-slate-400 text-xs">全部为 0</div>;
  }

  const radius = size * 0.35;
  const center = size / 2;
  const strokeWidth = size * 0.12;

  const defaultColors = ['#2563eb', '#7c3aed', '#db2777', '#f59e0b', '#10b981', '#8b5cf6'];
  const colorSet = colors || defaultColors;

  // 计算扇形路径
  let startAngle = -Math.PI / 2;
  const segments = data.map((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const result = { path, color: colorSet[i % colorSet.length], label: d.label, value: d.value, percent: (d.value / total * 100) };
    startAngle = endAngle;
    return result;
  });

  // 找出最大值（显示为亮点）
  const maxItem = data.reduce((a, b) => a.value > b.value ? a : b);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => (
          <path key={i} d={seg.path} fill={seg.color} stroke="#fff" strokeWidth="1.5" />
        ))}
        {/* 中心圆（形成环） */}
        <circle cx={center} cy={center} r={radius * 0.5} fill="#fff" />
        <text x={center} y={center - 3} fontSize="11" fill="#1e293b" textAnchor="middle" fontWeight="bold">
          {data.reduce((acc, d) => acc + d.value, 0).toFixed(1)}
        </text>
        <text x={center} y={center + 12} fontSize="7" fill="#94a3b8" textAnchor="middle">
          {data.length} 维度
        </text>
      </svg>
      <div className="text-[10px] text-emerald-600 font-medium mt-1">
        ★ {maxItem.label}: {maxItem.value.toFixed(1)}
      </div>
    </div>
  );
}
