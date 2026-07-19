# Lasinfon Prompt 索引

> 版本: v6.3.0 | 更新: 2026-07-19

## 使用说明

本索引用于统一管理 Lasinfon 的所有 LLM Prompt 文件。每个 Prompt 文件都包含特定的评估或分析任务，按分类组织。

**分类说明**：
- `core`：核心评估，每次推演必须调用
- `environment`：环境参数评估，用户可选启用
- `audit`：事后审计与分析，用户按需触发
- `serial`：连载作品专项，未来扩展

---

## Prompt 清单

| 文件名 | 分类 | 状态 | 触发条件 | 设计意图 |
|--------|------|------|----------|----------|
| `ai_evaluator_prompt.md` | core | ✅ stable | 每次推演 | 11 因子 1-5 整数 BARS 评分 |
| `ai_env_estimator_prompt.md` | environment | ✅ stable | 用户启用环境评估 | 评估 meme + env（与内容评估解耦） |
| `ai_result_interpreter_prompt.md` | audit | ✅ stable | 用户点击“复制完整诊断包” | 解读模拟报告，6 段式强制结构 |
| `ai_diagnostic_audit_prompt.md` | audit | 🟡 beta | 用户点击“查看诊断依据” | 评分追溯 + 亮点/坑点/矛盾/置信度 |
| `ai_serial_coherence_prompt.md` | serial | 🟡 draft | 连载模式（未来） | 评估系列相干性系数 κ_coherence |
| `ai_serial_structure_prompt.md` | serial | 🔵 design | 连载模式 + 用户点击（未来） | 剧情结构化解析（主线/副线/埋线/钩子） |

---

## 设计意图速查

| Prompt | 设计初衷 | 核心约束 |
|--------|----------|----------|
| `ai_evaluator_prompt.md` | 让 LLM 做“模式匹配”而非“分析”，输出 1-5 整数 | 禁止写评语，禁止解释，只输出 JSON |
| `ai_env_estimator_prompt.md` | 环境评估与内容评估严格解耦，防止注意力稀释 | 不评估文案本身，只评估平台/圈层环境 |
| `ai_result_interpreter_prompt.md` | 让用户获得“可操作的解读”，而非原始数据 | 6 段式结构（裁决→差异→归因→建议→限制） |
| `ai_diagnostic_audit_prompt.md` | 让评分“可追溯”，建立用户信任 | 禁止重新评分，每项必须引用具体文本证据 |
| `ai_serial_coherence_prompt.md` | 连载作品有独立的物理模型（状态转移） | 输出单一的 κ_coherence 系数 [0.1, 1.2] |

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v6.3.0 | 2026-07-19 | 初始索引创建，整合现有 5 个 Prompt |
| v6.3.0 | 2026-07-19 | 新增 `ai_serial_structure_prompt.md` 设计占位 |

---

## 相关文档

- `docs/ai_assessment_guide.md` — 评估方法论总纲
- `docs/ROADMAP.md` — 产品路线图与物理模型定义
- `config/contract_schema.json` — LLM 输出契约定义
