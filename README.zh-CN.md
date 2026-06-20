# Lasinfon
**社会激光动力学引擎 | 自主传播仿真系统**

[![开发语言](https://img.shields.io/badge/language-Rust-orange.svg)](https://www.rust-lang.org/)
[![开源协议](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)

Lasinfon 是一款工业级、全参数化的仿真引擎，基于**社会激光动力学**原理，用于建模与预测社交网络中的信息传播动态规律。该引擎将原始内容视为“信号光”（信息子 Infon），将目标受众视为社会谐振腔内的“增益介质”，以此模拟社会原子的状态跃迁、受激辐射以及类量子相变过程。

> **注意**：本仓库不包含核心数学推导内容。速率方程的完整理论推导请查阅内部《理论总纲文档》。

---

## 项目状态
当前版本 `v5.1.2`，已完整实现确定性计算流水线、多时间步状态演化、蒙特卡洛集合预测、CLI 参数覆写、标准 WASM 绑定（`wasm32-unknown-unknown`），以及离线独立 Canvas 可视化仪表盘。

---

## 架构设计
```text
lasinfon/
  crates/
      core          # 纯计算引擎（无标准库依赖、零 I/O，实现速率方程）
      state         # 状态转移方程与多时间步仿真逻辑
      monte-carlo   # 注入高斯噪声的集合预测能力
      config        # 分层配置加载与语义合并机制
      cli           # 命令行交互接口（运行、仿真指令）
      wasm          # WebAssembly 绑定 + 独立 Canvas 仪表盘
  docs/              # 用户指南、AI 评估手册与系统提示词
  presets/           # 预置的城市、平台、受众参数覆写集
  config/            # 默认配置 JSON 文件
  examples/          # 输入 JSON 示例文件
```

---

## 快速上手
### 1. 前置依赖（Rust 工具链）
请确保已安装较新版本的 Rust 工具链（2021 版）。可通过 [rustup](https://rustup.rs/) 安装：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. 克隆仓库并编译
```bash
git clone git@github.com:yourname/lasinfon.git
cd lasinfon
cargo build --release -p lasinfon-cli
```

### 3. 运行确定性预测
在标准环境参数下执行单步仿真：
```bash
./target/release/lasinfon run \
  --config config/default.json \
  --input example_input.json
```
执行后将输出结构化 JSON 结果，包含曝光指数 `G`、自增长乘数 `\Lambda`、后续场状态，以及分类标签（如 `TrueSelfGrowth` 真实自增长）。

### 4. 运行多时间步生命周期仿真
执行多步传播路径仿真，注入系统级高斯噪声（$\sigma$），用于评估随时间变化的相变过程：
```bash
./target/release/lasinfon simulate \
  --config config/default.json \
  --input example_input.json \
  --max-ticks 15 \
  --sigma 0.05 \
  --seed 42
```

### 5. 多层预置参数覆写（零代码预置方案）
预置文件仅包含与默认配置有差异的参数，在类型安全反序列化前，会按从左到右的顺序依次合并（右侧参数覆盖左侧）[1, 2]：
```bash
./target/release/lasinfon simulate \
  --config config/default.json \
  --config presets/cities/second_tier_city.json \
  --config presets/platforms/short_video.json \
  --config presets/audiences/gen_z.json \
  --input example_input.json \
  --max-ticks 10 \
  --sigma 0.1 \
  --seed 123
```

#### 可用预置集：
*   **城市维度**：`high_density_metro`（高密度都市）、`second_tier_city`（二线城市）、`global_hub`（全球枢纽）
*   **平台维度**：`short_video`（短视频）、`image_sharing`（图文分享）、`professional_network`（职业社交）
*   **受众维度**：`gen_z`（Z世代）、`young_women`（年轻女性群体）、`parents`（家长群体）

*注：所有平台与地域名称均采用抽象化、去品牌化命名，以保证理论模型的通用性与严谨性。*

---

## 输入内容准备与 AI 辅助评估
为了打通原始社交媒体内容与数学化输入参数之间的壁垒，我们提供了一套结构化的量化评估流程：

```bash
cp input_template.json my_content.json
# 参照 docs/ai_assessment_guide.md 编辑 my_content.json
```

### AI 自动化参数估算
你可以将 `docs/ai_evaluator_prompt.md` 中的专用系统提示词输入给大语言模型（如 Claude、GPT），让其充当**“参数编译器”**。AI 将解析你的原始内容（文本、脚本或链接），输出标准化的 `input_template.json` 文件，可直接用于仿真计算。

---

## 独立 Web 演示（零依赖、零拷贝）
我们将 `lasinfon` 编译为纯无界面 WebAssembly 模块，目标架构为 `wasm32-unknown-unknown` [1]。该模块无任何 I/O 或操作系统依赖，可保证运行稳定可靠 [1, 2]。

```bash
# 1. 编译 WASM 目标（需先安装 wasm-pack）
cd crates/wasm
wasm-pack build --target web

# 2. 在 crate 目录内直接启动本地静态服务
python3 -m http.server 8000
```

打开浏览器访问 `http://localhost:8000` 即可使用。你可以选择预置参数、调整配置，实时触发物理速率方程计算。页面采用轻量原生 Canvas 脚本渲染原子极化度（$C_t$）与曝光曲线（$G$），无需引入任何外部 JavaScript 依赖。

---

## 文档
*   [`docs/ai_assessment_guide.md`](docs/ai_assessment_guide.md) — 内容、受众、环境维度的标准化评分锚点（0-10 分制）
*   [`docs/ai_evaluator_prompt.md`](docs/ai_evaluator_prompt.md) — 用于智能体自动参数估算的结构化系统提示词
*   [`docs/ROADMAP.md`](docs/ROADMAP.md) — 未来开发规划（参数级置信度扰动、蒙特卡洛 CLI 集成等）

---

## 开源协议
本项目基于 Apache License 2.0 协议开源。

## 贡献指南
提交的贡献代码需通过 `cargo check --workspace` 无警告编译，并通过 `cargo test --workspace` 的全部测试。请遵循项目既定的领域术语规范（物理常量采用大写标注，变量需配备清晰的文档说明）。

---
**Lasinfon v5.1.2**  
*预测传播趋势，而非信息本身。*