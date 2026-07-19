"use client";

import React, { useState } from "react";

interface EnvParams {
  surge_match: number;
  current_direction: number;
  terrain_passability: number;
  population_density: number;
  connectivity: number;
  raw_suppression: number;
  L_cognitive: number;
  L_operational: number;
  L_antipathy: number;
  content_emotion_intensity: number;
  audience_resonance_match: number;
  environment_emotion_fit: number;
}

interface MemeParams {
  social_currency: number;
  share_cost: number;
  audience_trust_base: number;
  share_circle_preference: number;
}

interface EnvironmentPanelProps {
  presetEnv: EnvParams;
  presetMeme: MemeParams;
  onApply: (env: EnvParams, meme: MemeParams) => void;
  initialEnv?: EnvParams;
  initialMeme?: MemeParams;
}

const envLabels: Record<keyof EnvParams, string> = {
  surge_match: "热点匹配度",
  current_direction: "舆论流向",
  terrain_passability: "平台可穿透性",
  population_density: "受众密度",
  connectivity: "连接度",
  raw_suppression: "压制因素",
  L_cognitive: "认知负荷",
  L_operational: "操作复杂度",
  L_antipathy: "对抗情绪",
  content_emotion_intensity: "内容情感强度",
  audience_resonance_match: "受众共鸣匹配",
  environment_emotion_fit: "环境情感适配",
};

const envTooltips: Record<keyof EnvParams, string> = {
  surge_match: "内容与当前热点话题的吻合度",
  current_direction: "舆论的主流方向（正向/逆向）",
  terrain_passability: "平台允许内容扩散的难易程度",
  population_density: "目标受众在传播网络中的浓度",
  connectivity: "受众之间的信息传递效率",
  raw_suppression: "平台政策或舆论环境对内容的限制",
  L_cognitive: "内容理解的难度，越高则传播障碍越大",
  L_operational: "用户采取行动（如转发）的复杂程度",
  L_antipathy: "受众对内容的反感或抵触情绪",
  content_emotion_intensity: "内容本身的情感冲击力",
  audience_resonance_match: "内容与受众既有认知的共鸣程度",
  environment_emotion_fit: "内容情感基调与当前社会情绪的一致性",
};

const memeLabels: Record<keyof MemeParams, string> = {
  social_currency: "社交货币",
  share_cost: "分享成本",
  audience_trust_base: "受众信任基准",
  share_circle_preference: "圈层分享偏好",
};

const memeTooltips: Record<keyof MemeParams, string> = {
  social_currency: "内容能提升用户社交形象的价值",
  share_cost: "用户分享该内容需要付出的认知或社交成本",
  audience_trust_base: "受众对信息来源的初始信任度",
  share_circle_preference: "内容在特定圈层中的传播契合度",
};

export default function EnvironmentPanel({
  presetEnv,
  presetMeme,
  onApply,
  initialEnv,
  initialMeme,
}: EnvironmentPanelProps) {
  // 当前编辑的环境值（初始为预设或传入的初始值）
  const [envValues, setEnvValues] = useState<EnvParams>(initialEnv || presetEnv);
  const [memeValues, setMemeValues] = useState<MemeParams>(initialMeme || presetMeme);

  // 判断是否与预设不同（用于显示“已修改”标记）
  const isEnvModified = (key: keyof EnvParams) => envValues[key] !== presetEnv[key];
  const isMemeModified = (key: keyof MemeParams) => memeValues[key] !== presetMeme[key];

  const handleEnvChange = (key: keyof EnvParams, value: number) => {
    setEnvValues({ ...envValues, [key]: value });
  };

  const handleMemeChange = (key: keyof MemeParams, value: number) => {
    setMemeValues({ ...memeValues, [key]: value });
  };

  const resetAll = () => {
    setEnvValues(presetEnv);
    setMemeValues(presetMeme);
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <span>🌍</span> 环境参数（可手动调整）
        </h4>
        <div className="flex gap-2">
          <button
            onClick={resetAll}
            className="text-xs px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            ↺ 复位所有
          </button>
          <button
            onClick={() => onApply(envValues, memeValues)}
            className="text-xs px-3 py-1 rounded-lg bg-brand-primary text-white hover:bg-blue-700 transition"
          >
            📊 重新推演
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* MEME 部分 */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">模因参数 (Meme)</div>
          {(Object.keys(memeLabels) as Array<keyof MemeParams>).map((key) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-24 text-xs text-slate-600" title={memeTooltips[key]}>
                {memeLabels[key]}
              </span>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={memeValues[key]}
                onChange={(e) => handleMemeChange(key, parseFloat(e.target.value))}
                className="flex-1 accent-blue-600 h-1"
              />
              <span className="w-8 text-xs font-mono text-right" style={{ color: isMemeModified(key) ? '#f97316' : '#64748b' }}>
                {memeValues[key].toFixed(1)}
              </span>
              {isMemeModified(key) && (
                <span className="text-[10px] text-orange-500">(已改)</span>
              )}
            </div>
          ))}
        </div>

        {/* ENV 部分 */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">环境参数 (Env)</div>
          {(Object.keys(envLabels) as Array<keyof EnvParams>).map((key) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-24 text-xs text-slate-600" title={envTooltips[key]}>
                {envLabels[key]}
              </span>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={envValues[key]}
                onChange={(e) => handleEnvChange(key, parseFloat(e.target.value))}
                className="flex-1 accent-blue-600 h-1"
              />
              <span className="w-8 text-xs font-mono text-right" style={{ color: isEnvModified(key) ? '#f97316' : '#64748b' }}>
                {envValues[key].toFixed(1)}
              </span>
              {isEnvModified(key) && (
                <span className="text-[10px] text-orange-500">(已改)</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-100 pt-2">
        💡 调整滑块可临时修改环境参数，点击“重新推演”即可看到新结果。<br />
        橙色数值表示您已修改，点击“复位所有”可恢复预设值。
      </div>
    </div>
  );
}
