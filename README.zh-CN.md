# Lasinfon

**社会激光动力学引擎** • 自主传播模拟系统

[![开发语言](https://img.shields.io/badge/language-Rust-orange.svg)](https://www.rust-lang.org/)

[![开源协议](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)

Lasinfon 是一款工业级、全参数化的仿真引擎，基于**社会激光动力学**原理，对社交网络中的信息传播动力学过程进行建模与预测。引擎将原始内容视为“信号光”（信息子 Infon），将目标受众视为社会谐振腔内的“增益介质”，以此模拟社会原子的状态跃迁、受激辐射与类量子相变过程。

> **注意**：本仓库不包含核心数学推导。速率方程的完整理论论证请参阅内部《理论主文档》。

---

## 项目状态

`v6.1.1`  已完整实现确定性计算流水线、多时间步状态演化、蒙特卡洛系综预测、CLI 参数重载、标准 WASM 绑定（`wasm32-unknown-unknown`），以及先进的**标准参考投影（SRP）双轨仿真**。用户界面已全面升级为高端质感、参考 Dribbble 风格的浅色主题 Next.js/React 仪表盘，搭载流畅的 SVG 矢量图表与 Ginlix 风格的引导向导。

---

## 项目架构

```text
lasinfon/
  crates/
      core          # 纯计算引擎（no_std，零 I/O，速率方程）
      state         # 状态转移方程与多时间步时序仿真
      monte-carlo   # 注入高斯噪声的系综预测
      config        # 分层配置加载与语义合并
      cli           # 命令行交互界面（运行、仿真）
      wasm          # WebAssembly 绑定 + 高保真 Next.js 与静态仪表盘
  docs/              # 用户指南、AI 评估手册与系统提示词
  presets/           # 预置城市、平台与受众参数覆盖层
  config/            # 默认配置 JSON 文件
  examples/          # 示例输入 JSON 文件
```

---

## 快速开始

### 1. 环境准备（Rust 工具链与 Wasm-Pack）

请确保安装了较新版本的 Rust 工具链（2021 版）。可通过 [rustup](https://rustup.rs/) 安装：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

如需编译 WebAssembly 绑定，请安装 [wasm-pack](https://rustwasm.github.io/wasm-pack/)：

```bash
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

### 2. 克隆仓库并编译 CLI

```bash
git clone git@github.com:yourname/lasinfon.git
cd lasinfon
cargo build --release -p lasinfon-cli
```

### 3. 运行确定性预测

执行单步仿真。在 `v6.1.1` 版本中，输出结果包含活跃输出值 `G`，以及通过标准参考投影（SRP）计算得到的**标准势能（`G_std`）**与**环境乘数（`K_mult`）**：

```bash
./target/release/lasinfon run \
  --config config/default.json \
  --input example_input.json
```

### 4. 运行多时间步生命周期仿真

执行多步传播路径仿真。系统会注入高斯噪声（$\sigma$），用于评估随时间演化的相变过程：

```bash
./target/release/lasinfon simulate \
  --config config/default.json \
  --input example_input.json \
  --max-ticks 15 \
  --sigma 0.05 \
  --seed 42
```

### 5. 多层预置参数重载（零代码预置方案）

预置文件仅包含与默认值存在差异的参数。在执行类型安全反序列化前，参数会按从左到右的顺序依次合并（右侧配置覆盖左侧）：

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

---

## 输入准备与 AI 辅助评估

为填补原始社交媒体内容与数学输入参数之间的语义鸿沟，我们提供了一套结构化的测量方案：

```bash
cp input_template.json my_content.json

# 按照 docs/ai_assessment_guide.md 编辑 my_content.json
```

### AI 自动化参数估算（BARS 5分制体系）

你可以将 `docs/ai_evaluator_prompt.md` 中的专用系统提示词输入给大语言模型（如 Claude、GPT），将其作为**“参数编译器”**使用。AI 会解析你的原始内容（文本、脚本或 URL），输出标准化、校准后的 `input_template.json` 文件，可直接用于仿真计算。

---

## 高端 Web 仪表盘与本地服务器

Lasinfon v6.1.1 搭载了高端响应式 Web 仪表盘，编译为无界面 WebAssembly 格式，不依赖任何标准运行时与操作系统组件。

### 1. 编译 WASM 目标

```bash
# 编译二进制资源并复制到静态 Web 目录
cd crates/wasm
wasm-pack build --target web
cp -R pkg/* www/pkg/
cp -R pkg/* www/web/public/pkg/
```

### 2. 运行本地静态测试页面

使用我们的自适应 Python 服务脚本，可解决 macOS 环境下 WebAssembly MIME 类型映射异常的问题：

```bash
python3 crates/wasm/server.py

# 在浏览器中访问：http://localhost:8000/www/index.html
```

### 3. 运行 SaaS Web 控制台（Next.js & Tailwind CSS v4）

体验高保真、参考 Dribbble 风格的浅色主题仪表盘，包含矢量 SVG 图表与 Ginlix 引导向导：

```bash
cd crates/wasm/www/web
npm run dev

# 在浏览器中访问：http://localhost:3000
```

---

## 文档

*   [`docs/ai_assessment_guide.md`](docs/ai_assessment_guide.md)  内容、受众与环境维度的 BARS 5分制计量规范与评分锚点
*   [`docs/ai_evaluator_prompt.md`](docs/ai_evaluator_prompt.md)  用于智能体自动参数估算的校准版完整系统提示词
*   [`docs/ai_result_interpreter_prompt.md`](docs/ai_result_interpreter_prompt.md)  用于网页对话的 AI 诊断解读器提示词
*   [`docs/ROADMAP.md`](docs/ROADMAP.md)  Lasinfon v6.1.1 官方升级方案白皮书与开发路线图

---

## 开源协议

本项目基于 Apache License 2.0 协议开源。

## 贡献指南

提交的代码必须通过 `cargo check --workspace` 无警告编译，并通过 `cargo test --workspace` 的全部测试。请遵循项目既定的领域术语规范：物理常量酌情使用大写记法，所有变量需配有清晰的文档说明。

---

**Lasinfon v6.1.1**  *预测传播之势，而非信息本身。*



