# Lasinfon

**社会激光动力学引擎** • 自生长传播模拟系统

[![开发语言](https://img.shields.io/badge/language-Rust-orange.svg)](https://www.rust-lang.org/)
[![开源协议](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)

Lasinfon 是一款工业级、全参数化的数值模拟引擎，致力于运用**社会激光动力学（Social Laser Dynamics）**的物理学原理，预测和研究信息在社交场域中的自主扩散规律。本系统将舆情内容抽象为“信号光子”（Infon），将受众圈层抽象为“增益介质”。通过模拟信息在社交谐振腔内的受激激发、粒子数反转及弛豫冷却过程，系统可精确推演舆情风暴的相干激光爆发或耗散衰减周期。

> **警告**：本公开仓库中不包含核心算法的数学推导公式。如需深入研究完整的速率方程组与动力学主方程，请参阅内部《自生长传播学 · 理论体系总纲》。

---

## 项目状态

`v5.1.2` • 已实现完全确定性的计算管道、多时间步（multi-tick）生命周期演化、蒙特卡洛多路径集合预报、命令行预设叠加（Preset Overloading）、标准端侧 WASM 编译（`wasm32-unknown-unknown`），以及零外部依赖的原生 Canvas 气象雷达演示单页。

---

## 目录架构

```text
lasinfon/
 ├── crates/
 │    ├── core          # 纯数值计算求解核 (支持 no_std, 零 I/O, 速率方程组)
 │    ├── state         # 状态转移方程与多步生命周期仿真
 │    ├── monte-carlo   # 注入高斯噪声的蒙特卡洛集合预报引擎
 │    ├── config        # 多层预设语义深度合并与加载器
 │    ├── cli           # 命令行交互终端 (run, simulate 子命令)
 │    └── wasm          # 标准 WebAssembly 绑定 + 独立 Canvas 气象雷达单页
 ├── docs/              # 用户指南、AI 评估手册、系统提示词 (Prompt)
 ├── presets/           # 预置的环境、平台、受众特征参数差异化预设包
 ├── config/            # 默认的系统配置 JSON 文件
 └── examples/          # 示例输入 JSON 文件
```

---

## 快速开始

### 1. 环境准备 (Rust 工具链)
您需要安装最新版的 Rust 工具链（Edition 2021）。可通过 [rustup](https://rustup.rs/) 安装：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. 克隆并编译

```bash
git clone git@github.com:yourname/lasinfon.git
cd lasinfon
cargo build --release -p lasinfon-cli
```

### 3. 运行确定性预测 (Deterministic Forecast)
在标准默认参数环境下，运行单期确定性数值推演：

```bash
./target/release/lasinfon run \
  --config config/default.json \
  --input example_input.json
```

该命令将输出结构化的 JSON 载荷，包含单期曝光指数 `G`、自生长乘数 `\Lambda`、物理场演化状态及分类标签（如 `TrueSelfGrowth`）。

### 4. 运行多步生命周期仿真 (Multi-Tick Simulation)
运行多步传播生命周期。在计算中注入参数级高斯噪声（$\sigma$）以评估随机扰动下的相变分叉趋势：

```bash
./target/release/lasinfon simulate \
  --config config/default.json \
  --input example_input.json \
  --max-ticks 15 \
  --sigma 0.05 \
  --seed 42
```

该命令将输出随时间演化的时空足迹记录，展现活跃原子比例 `C_t`（受众激活度）与相干曝光量 `G` 的博弈曲线。

### 5. 零代码多层预设叠加 (Layer Presets)
预设文件（Preset）仅包含与默认参数不同的差异化基因。系统执行自左向右（右侧覆盖左侧）的递归 AST 级深度合并，最后通过强类型语义校验 [1, 2]：

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

#### 可用预设包：
*   **城市物理边界（Cities）**：`high_density_metro` (高密都市), `second_tier_city` (二线城市), `global_hub` (全球枢纽)
*   **分发几何平台（Platforms）**：`short_video` (短视频), `image_sharing` (图文种草), `professional_network` (专业网络)
*   **受众能级结构（Audiences）**：`gen_z` (Z世代), `young_women` (年轻女性), `parents` (父母圈层)

*(注意：所有平台与城市命名均进行去品牌化、中性化抽象，以维护物理模型的普适性。)*

---

## 输入准备与 AI 辅助评估

为了将人类社会的“非结构化舆情内容”转化为物理引擎所需的“高精度量化参数”，我们提供了一套标准测量协议：

```bash
cp input_template.json my_content.json
# 对照 docs/ai_assessment_guide.md 修改 my_content.json 的参数得分
```

### 🤖 AI 自动化参数估算 (AIGC 闭环)
您可以直接将任何先进的大语言模型（如 Claude 3.5、GPT-4）作为您的**“参数前置编译器”**。将 [`docs/ai_evaluator_prompt.md`](docs/ai_evaluator_prompt.md) 中的系统提示词喂给模型，AI 将自动分析您的文案或视频脚本，并一键生成完全符合 `input_template.json` 规范的量化参数与置信度。

---

## 独立 Web 演示单页 (零依赖、零拷贝本地沙箱)

得益于 `lasinfon-core` 的零 I/O 纯数值计算特征，我们将其编译为完全脱离系统调用依赖的标准 WebAssembly 字节码（`wasm32-unknown-unknown`） [1]。

```bash
# 1. 编译 WASM (确保本地已安装 wasm-pack)
cd crates/wasm
wasm-pack build --target web

# 2. 直接在当前目录下启动轻量静态服务器，实现零拷贝原地装载
python3 -m http.server 8000
```

打开浏览器访问 `http://localhost:8000`。您可以自由选择预设组合、拖拽微调参数并一键运行。纯手写的原生 Canvas 脚本将在网格中毫秒级渲染受众原子的极化起伏（$C_t$）与相干光强演化曲线（$G$），不加载任何外部 JavaScript 依赖。

---

## 协议与文档指引

*   [`docs/ai_assessment_guide.md`](docs/ai_assessment_guide.md) — 0-10 评分锚点标准（内容、受众、环境）。
*   [`docs/ai_evaluator_prompt.md`](docs/ai_evaluator_prompt.md) — 用于智能体自动化估算参数的结构化 System Prompt。
*   [`docs/ROADMAP.md`](docs/ROADMAP.md) — 演化路线图（参数级置信度高斯降噪、集合预报 CLI 并行命令等）。

---

## 开源协议

本项目基于 Apache License 2.0 协议开源。

## 贡献指南

我们非常欢迎 Pull Requests。请确保您的所有修改可以通过 `cargo check --workspace` 做到零警告 [1, 2]，并且所有单元测试通过。请遵守既定的代码风格（物理常数在代码中保持大写以对齐公式，公共 API 需附带 LaTeX 数学注释）。

---

**Lasinfon v5.1.2** • *预测传播，而非预设内容。*