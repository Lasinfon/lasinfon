# Lasinfon

**社会激光动力学引擎** • 自生长传播与时序留存仿真系统

[![Language](https://img.shields.io/badge/语言-Rust-orange.svg)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/许可证-Apache_2.0-blue.svg)](LICENSE)

Lasinfon 是一套工业级、全参数化的仿真引擎，基于**社会激光动力学**原理，用于建模和预测信息在社交网络中的传播动力学。它将原始内容视为“信号光”，将目标受众视为谐振腔内的“增益介质”，模拟社会原子的状态跃迁、受激辐射以及量子级相变。

> **警告**：本仓库不包含核心数学描述。速率方程的完整理论推导，请参阅内部《理论总纲》。

---

## 项目状态

`v6.3.0`  已全面实现四路解耦的高保真物理传播求解器：
1.  **标准参考投影器 (Track 1)**：在标准真空参考条件 ($K=1.0$, $A_{\text{algo}}=1.0$) 下测量文案的绝对原生势能 ($G_{\text{std}}$) [5]。
2.  **实测信道仿真器 (Track 2)**：模拟真实环境下的投放活动，包含受众注意力动态衰减和平台算法推荐衰减 [5]。
3.  **自激等离子涌现器 (Track 3)**：对高能舆论相变（极化对抗与模因突变）建模，并施加严格的 $10.0$ 倍饱和钳位。
4.  **时序连载级联求解器 (Track 4)**：利用时间间隔记忆衰减、审美疲劳递归基线和第一印象门槛，评估系列化内容（连载小说、短剧、连续新闻事件）。

用户界面提供编译为无头 WebAssembly 的高级响应式 Web 仪表盘（Retina 级矢量 SVG 曲线、动态悬浮提示、参数来源校验检查器卡片），并配备 Ginlix 风格的上手指引向导。

---

## 架构

```text
lasinfon/
  crates/
      core          # 纯计算引擎 (no_std, 零 I/O, 速率方程)
      state         # 求解器子工作区 (Standard, Active, Cascade, Emergence) 与状态转移
      monte-carlo   # 集合预报，基于 SHA-256 确定性主种子分流
      config        # 分层配置加载与语义合并
      cli           # 命令行界面 (run, simulate)
      wasm          # WebAssembly 绑定 + 高保真 Next.js 与静态仪表盘
  docs/              # 用户指南、AI 评估手册、可插拔系统提示词
  presets/           # 预构建的平台与受众参数叠加层
  config/            # 默认配置 JSON 文件
  examples/          # 示例输入 JSON 文件
```

---

## 快速开始

### 1. 前置依赖 (Rust 工具链 & Wasm-Pack)
请确保已安装较新的 Rust 工具链 (Edition 2021)。通过 [rustup](https://rustup.rs/) 安装：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

为编译 WebAssembly 绑定，请安装 [wasm-pack](https://rustwasm.github.io/wasm-pack/)：
```bash
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

### 2. 克隆并编译 CLI

```bash
git clone git@github.com:yourname/lasinfon.git
cd lasinfon
cargo build --release -p lasinfon-cli
```

### 3. 运行确定性预报
执行单步仿真。`v6.3.0` 的输出包含活跃曝光 $G$、通过标准参考投影得到的**标准势能 ($G_{\text{std}}$)** 以及**环境调制系数 ($K_{\text{mult}}$)**：

```bash
./target/release/lasinfon run \
  --config config/default.json \
  --input example_input.json
```

### 4. 运行多轮生命周期仿真
运行多步传播路径。加入系统级高斯噪声 ($\sigma$) 以评估随时间演化的相变，并使用基于 SHA-256 的审计可复现随机种子：

```bash
./target/release/lasinfon simulate \
  --config config/default.json \
  --input example_input.json \
  --max-ticks 20 \
  --sigma 0.05 \
  --seed 123
```

---

## 输入准备与 AI 辅助评估

为了在原始社交媒体内容与数学输入参数之间架起桥梁，我们提供了结构化的测量方案：

```bash
cp input_template.json my_content.json
# 按照 docs/ai_assessment_guide.md 编辑 my_content.json
```

### AI 自动化参数估计 (BARS 5 分制系统)
你可以利用先进的大语言模型（例如 Claude、GPT、DeepSeek）作为**“参数编译器”**，通过将 `docs/ai_evaluator_prompt.md` 中的专用系统提示词提供给它们。AI 将解析你的原始内容（文本、脚本或链接），并输出可直接用于仿真的标准化 `input_template.json`。

---

## 高级 Web 仪表盘与本地 Web 服务器

Lasinfon v6.3.0 配备了一个高级响应式 Web 仪表盘，编译为无标准运行时或操作系统依赖的无头 WebAssembly。

### 1. 编译 WASM 目标
```bash
# 编译并将二进制资源复制到静态 web 目录
cd crates/wasm
wasm-pack build --target web
cp -R pkg/* www/pkg/
cp -R pkg/* www/web/public/pkg/
```

### 2. 运行个人本地测试器 (静态 HTML)
使用我们的自适应 Python 服务器脚本，它解决了 macOS 上 WebAssembly MIME 类型映射问题并直接提供目录服务：
```bash
python3 crates/wasm/server.py
# 在浏览器中访问: http://localhost:8000 （无需子目录）
```

### 3. 运行 SaaS Web 驾驶舱 (Next.js & Tailwind CSS v4)
要体验带有矢量 SVG 图形和 Ginlix 上手指引向导的高保真、Dribbble 风格浅色主题仪表盘：
```bash
cd crates/wasm/www/web
npm run dev
# 在浏览器中访问: http://localhost:3000
```

---

## 文档

*   [`docs/ai_assessment_guide.md`](docs/ai_assessment_guide.md)  针对内容、受众和环境的 BARS 5 分制计量与评分锚点。
*   [`docs/ai_evaluator_prompt.md`](docs/ai_evaluator_prompt.md)  用于智能体自动参数估计的标定完整系统提示词。
*   [`docs/ai_serial_coherence_prompt.md`](docs/ai_serial_coherence_prompt.md)  用于级联多集活动的系列相干性评估提示词。
*   [`docs/ai_result_interpreter_prompt.md`](docs/ai_result_interpreter_prompt.md)  用于 Web 聊天对话的 AI 诊断解释器提示词。
*   [`docs/ROADMAP.md`](docs/ROADMAP.md)  官方 Lasinfon v6.3.0 升级计划白皮书与路线图。

---

## 许可证

本项目基于 Apache License 2.0 许可。

## 贡献

贡献代码必须通过 `cargo check --workspace` 零警告编译，并通过 `cargo test --workspace` 全量测试。请遵循既定的领域语言（适当情况下物理常量使用大写标记，变量附有清晰文档）。

---

**Lasinfon v6.3.0**  *Predict the propagation, not the message.*