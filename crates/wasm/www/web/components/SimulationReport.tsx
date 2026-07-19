// components/SimulationReport.tsx
'use client';

import { SimulationResult } from '../types/diagnostic';

interface SimulationReportProps {
  result: SimulationResult;
}

export default function SimulationReport({ result }: SimulationReportProps) {
  const records = result.records || [];
  if (records.length === 0) return <div className="text-gray-500">No simulation data.</div>;

  const last = records.length - 1;
  const initial = records[0];
  // find peak G
  let peakIdx = 0;
  let peakG = -Infinity;
  for (let i = 0; i < records.length; i++) {
    const g = records[i].G ?? 0;
    if (g > peakG) { peakG = g; peakIdx = i; }
  }
  const peak = records[peakIdx];

  // cumulative G_total
  let gTotal = 0;
  let sumLambda = 0;
  for (let i = 0; i < records.length; i++) {
    const g = records[i].G ?? 0;
    const lam = records[i].lambda_eff ?? 0;
    sumLambda += lam;
    if (i > 0) {
      const prevG = records[i-1].G ?? 0;
      gTotal += (prevG + g) / 2;
    }
  }
  const avgLambda = records.length > 0 ? sumLambda / records.length : 0;

  const initG = initial.G ?? 0;
  const crossed = (initG > 0.25 || avgLambda > 1.0) ? 'YES' : 'NO';
  const finalQuadrant = records[last].quadrant ?? 'Unknown';

  const fmt = (v: any) => (typeof v === 'number' ? v.toFixed(4) : String(v));

  const lines = [];
  lines.push('=== LASINFON METROLOGY SIMULATION SUMMARY REPORT ===');
  lines.push(`Timeline ticks: 0 to ${records.length-1} (Total steps: ${records.length})`);
  lines.push('');
  lines.push('[INITIAL STATE (t=0) - COLD START SECTION]:');
  lines.push(`- G_active (Active Simulated Exposure): ${fmt(initG)}`);
  lines.push(`- G_std (Standard Reference Potency / SRP): ${fmt(initial.G_std ?? 0)}`);
  lines.push(`- K_mult (Environmental Multiplier / Wind Speed): ${fmt(initial.K_mult ?? 1)}x`);
  lines.push(`- R_t (Resonance Heat / Emotional Alignment): ${fmt(initial.R_t ?? 0)}`);
  lines.push(`- C_t (Active Resonance Node Ratio): ${fmt((initial.C_t ?? 0)*100)}%`);
  lines.push(`- mu_psych (Psychological Friction / Social Resistance): ${fmt(initial.mu_psych_t ?? 0)}`);
  lines.push('');
  lines.push(`[PEAK STATE (t=${peak.t ?? peakIdx}) - INFLECTION POINT]:`);
  lines.push(`- Peak G_active: ${fmt(peakG)}`);
  lines.push(`- Peak G_std (Standard Potency at Peak): ${fmt(peak.G_std ?? 0)}`);
  lines.push(`- Peak K_mult (Wind Speed at Peak): ${fmt(peak.K_mult ?? 1)}x`);
  lines.push('');
  lines.push(`[FINAL STATE (t=${records.length-1}) - STEADY STATE / EXHAUSTION]:`);
  const finalG = records[last].G ?? 0;
  lines.push(`- Final G_active: ${fmt(finalG)}`);
  lines.push(`- Final G_std: ${fmt(records[last].G_std ?? 0)}`);
  lines.push(`- Final K_mult: ${fmt(records[last].K_mult ?? 1)}x`);
  lines.push(`- Final R_t: ${fmt(records[last].R_t ?? 0)}`);
  lines.push(`- Final C_t: ${fmt((records[last].C_t ?? 0)*100)}%`);
  lines.push('');
  lines.push('[INTEGRATED PROPAGATION METRICS - LIFECYCLE INTEGRAL]:');
  lines.push(`- Cumulative Exposure (G_total - Area Under Active Curve): ${fmt(gTotal)}`);
  lines.push(`- Average Gain Multiplier (lambda_eff - Average Growth Velocity): ${fmt(avgLambda)}`);
  lines.push(`- Autonomous Growth Crossed Threshold? ${crossed} (initial G=${fmt(initG)} > 0.25 or avgλ>1.0)`);
  lines.push(`- Final Propagation Quadrant (Phase State): ${finalQuadrant}`);
  lines.push('');
  // extra stats
  let gMin = Infinity, gMax = -Infinity, gSum = 0, gCount = 0;
  for (const r of records) {
    const g = r.G ?? 0;
    if (g < gMin) gMin = g;
    if (g > gMax) gMax = g;
    gSum += g;
    gCount++;
  }
  const gAvg = gCount > 0 ? gSum / gCount : 0;
  lines.push('[STATISTICAL SUMMARY - G_active distribution]:');
  lines.push(`- Min G_active: ${fmt(gMin)}`);
  lines.push(`- Max G_active: ${fmt(gMax)}`);
  lines.push(`- Average G_active: ${fmt(gAvg)}`);
  lines.push('======================================================');

  return (
    <div className="bg-gray-50 p-4 rounded font-mono text-sm whitespace-pre-wrap">
      {lines.join('\n')}
    </div>
  );
}
