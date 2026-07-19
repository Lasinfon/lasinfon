'use client';

import React from 'react';

interface RadarChartProps {
  data: { label: string; value: number }[];
  size?: number;
  colors?: string[];
}

export default function RadarChart({ data, size = 220, colors }: RadarChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-slate-400 text-xs">暂无数据</div>;
  }

  const n = data.length;
  const radius = size * 0.35;
  const center = size / 2;
  const maxValue = 10;

  const defaultColors = ['#2563eb', '#7c3aed', '#db2777', '#f59e0b', '#10b981', '#8b5cf6'];
  const colorSet = colors || defaultColors;

  // 计算多边形顶点
  const getPoints = (scale: number) => {
    return data.map((d, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      const r = (d.value / maxValue) * radius * scale;
      return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
    });
  };

  const fullPoints = getPoints(1);
  const pathD = fullPoints.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ') + 'Z';

  // 网格环（50%, 25%）
  const ring50 = getPoints(0.5);
  const ring25 = getPoints(0.25);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {/* 背景网格 */}
      <polygon points={ring25.map(p => p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ')} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
      <polygon points={ring50.map(p => p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ')} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
      <polygon points={fullPoints.map(p => p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ')} fill="none" stroke="#d1d5db" strokeWidth="1" />

      {/* 数据区域 */}
      <polygon points={fullPoints.map(p => p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ')} fill="rgba(37,99,235,0.15)" stroke="#2563eb" strokeWidth="2" />

      {/* 数据点 */}
      {fullPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={colorSet[i % colorSet.length]} stroke="#fff" strokeWidth="1.5" />
      ))}

      {/* 标签 */}
      {data.map((d, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const r = radius * 1.15;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        const textAnchor = (angle > -Math.PI/2 && angle < Math.PI/2) ? 'start' : (angle > Math.PI/2 || angle < -Math.PI/2) ? 'end' : 'middle';
        const dy = (angle > 0) ? '0.6em' : '-0.2em';
        const dx = (angle > -Math.PI/2 && angle < Math.PI/2) ? '0.4em' : '-0.4em';
        return (
          <text
            key={i}
            x={x}
            y={y}
            fontSize="9"
            fill="#475569"
            textAnchor={textAnchor}
            dx={dx}
            dy={dy}
            className="font-medium"
          >
            {d.label}
          </text>
        );
      })}

      {/* 中心值显示 */}
      <text x={center} y={center + 2} fontSize="11" fill="#1e293b" textAnchor="middle" fontWeight="bold">
        {data.reduce((acc, d) => acc + d.value, 0) / data.length > 0 
          ? (data.reduce((acc, d) => acc + d.value, 0) / data.length).toFixed(1)
          : '-'}
      </text>
    </svg>
  );
}
