# Lasinfon v6.3.0 哲学与工程增强升级计划
## ——基于“物理参数调制与时序相干级联”的自生长传播势能测量系统重构（终极发布版）

**基座版本对齐：v5.1.2 理论总纲**  
**文件状态：已封印，全线进入开发阶段（Sealed & Authorized for Development）**  
**指导哲学：《Milk Zen 工程哲学》**  
**核心理念：无量纲定标、多轨解耦、自激相变、时序相干、完全复现**

---

## 一、 背景与产品哲学（Metrological Philosophy）

### 1.1 核心定位：卡尺原器
Lasinfon 的核心定位是一把**高精密、高复现性的传播势能测量卡尺**。
*   **不作主观承诺**：系统不对用户做出绝对销量或流量的承诺，不提供流于概念的概率百分比。
*   **内容与信道完全解耦**：传播不是孤立发生的，而是信息信号 $X(t)$ 在传播信道 $H(t)$（环境）中进行相互作用的物理动力学过程。系统在物理和数据层面上将“内容原生能级（E）”与“信道环境常数（K）”完全隔离 [5]。
*   **用户自行校准（Calibration）**：不同行业的用户通过使用卡尺，在自身业务内部建立“自生长传播指数（$S_{\text{api}}$） ↔ 实际转化销量”的专属回归映射。卡尺只负责保障刻度的一致性与可复现性 [5]。

### 1.2 连续波激射（CW Laser）与时空自生长
单篇内容的爆发属于**脉冲激射（Pulsed Laser）**，测量的是内容在空间上的自生长能力；系列连载与连续社会热点则属于**连续波激射（Continuous-Wave Laser）**，测量的是系统在时间轴上维持稳定粒子数反转（追更留存）的生命周期。

---

## 二、 “三柱两级”双轨光谱投影与“自激涌现”开关

为了维持主卡尺（$G_{\text{std}}$）的纯净性，系统绝对不改变 v5.1.2 的物理核心公式，而是采用**“三轨隔离求解器（Three-Track Solvers）”**与前端**“光谱投影展示”**架构。

```
                              [ 用户文案输入 (E) ]
                                       │
                     ┌─────────────────┼─────────────────┐
                     ▼                 ▼                 ▼
             ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
             │ 1.标准参考器 │  │ 2.实测信道器 │  │ 3.自激涌现器 │
             │ (Standard)   │  │ (Active Env) │  │ (Emergence)  │
             └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                    │                 │                 │ (用户手动开启)
                    ▼                 ▼                 ▼
             【原生势能 G_std】 【实测曝光 G_active】 【自激等离子波形】
                               (K_mult 调制)     (Omega/二创非线性爆发)
```

### 2.1 仪表盘指标映射规范
*   **标准参考投影器（`StandardSolver`）**：
    强行锁定 $K_{\text{std}} = 1.0, \Omega = 0.0, \epsilon = 0.0$。测出内容本身在真空标准谐振腔下的原生曝光期望值 **$G_{\text{std}}$（原生势能指数，0-100分）** [5]。
*   **实测信道仿真器（`ActiveSolver`）**：
    运行真实的环境控制参数（$K = 0 \sim 450$），计算出文案在真实特定战场下的实测曝光期望值 **$G_{\text{active}}$（实测曝光指数）** [5]。
*   **自激等离子涌现器（`EmergenceSolver`）**：
    此求解器完全隔离。当前端用户手动开启 `Enable Meme Mutation (二创自激涌现)` 时启动。它读取 `circle_opposition` 和 `remix_openness`，计算出对抗增益 $G_{\text{conf}}$ 和二创熵增 $E_{\text{remix}}$，在图表上渲染出一条**第三轨曲线（自激相变轨迹）**。若关闭，主尺子不计算该逻辑，保持绝对纯净。
*   **环境调制系数（$K_{\text{mult}}$）**：
    量化当前环境将内容原生硬度放大了多少倍（风速），其计算公式为：
    $$ K_{\text{mult}} = \frac{G_{\text{active}}}{G_{\text{std}}} $$
    *   **除零防御保护机制**：为防止极端情况下（如物理折损率 $S=0.0$ 导致内容无法在标准腔中传播）分母为零，在指标合成层强制执行：**若 $G_{\text{std}} < 10^{-5}$，则锁死 $K_{\text{mult}} = 1.0$。**

---

## 三、 连载与系列作品诊断：时序相干级联模型（Sequential Coherent Cascading）

系列连载是**“有记忆的时序系统”**。受众在看第 $n$ 集时，其兴奋度并不从零开始，而是承袭了上一集完结时的能级惯性。

### 3.1 状态连续转移与时序级联方程
第 $n-1$ 章（Chapter $n-1$）的收盘状态向量为 $H_{n-1} = \{C_{\text{final}}^{(n-1)}, R_{\text{final}}^{(n-1)}, \mu_{\text{psych\_final}}^{(n-1)}\}$。
第 $n$ 章的初始冷启动状态 $H_0^{(n)}$ 由以下方程级联计算得到：

$$ C_0^{(n)} = C_{\text{final}}^{(n-1)} \times e^{-\lambda_{\text{decay}} \cdot \Delta T} \times \eta_{\text{retention}} $$
$$ R_0^{(n)\prime} = R_{\text{final}}^{(n-1)} \times e^{-\lambda_{\text{decay}} \cdot \Delta T} \times \kappa_{\text{coherence}} \times \text{Penalty} $$

*   **$\Delta T$**：两章发布的真实时间间隔。间隔越长，记忆与兴奋度随时间耗散越多。
*   **$\kappa_{\text{coherence}}$（系列相干性系数，值域 $[0.1, 1.2]$）**：由大模型（Call 1.2）评估，度量两章在剧情、冲突上的相干保真度。若剧情突变断层则发生相消干涉（$\kappa < 1.0$），粉丝惯性塌缩。
*   **审美疲劳惩罚（The Avatar Effect）**：每一集末，系统通过一阶差分递推基线公式滚动更新审美饱和基线：
    $$ \text{base}_{\text{innov}}^{(n)} = \max\left( S_{\text{innov}}^{(n)}, \ \text{base}_{\text{innov}}^{(n-1)} \times \gamma_{\text{base}} \right) $$
    $$ \text{Penalty} = e^{-\kappa_{\text{fatigue}} \cdot \max(0, \ \text{base}_{\text{innov}}^{(n-1)} - S_{\text{innov}}^{(n)} )} $$
    其中，$S_{\text{innov}}$ 强行硬绑定至 11 因子中不可再分的原子级指标：**`scores.innovation`（创新性）** [5]。基线耗散常数 $\gamma_{\text{base}}$ 设为 `0.95`，疲劳惩罚常数 `κ_fatigue` 锁定为预设配置中的固定常数 **`0.3`**。

### 3.2 物理级“双重门槛”诊断
系统在连载模式下执行双重过滤，精准定位流失点：
*   **第一道门槛（点开率，Hook Potential）**：由 `uniqueness + strangeness` 决定。若评估低于阈值，系统判定该集“点开门槛未通过”，强制将该集的自发发射系数 **`theta_spontaneous`（自发辐射拉新系数）设为 `0.0`**，阻断新流量注入。
*   **第二道门槛（留存率，Retention Ratio）**：在没有自发辐射拉新的情况下，文案仅能依靠上一集遗留下来的粉丝惯性（受激辐射项 $C_{\text{relaxed}}$）继续传播，仿真将在后续集数中模拟并描绘出一条真实的、呈指数消退的粉丝流失坠毁曲线。

---

## 四、 评估层计量规格：3 套 5 分制 BARS 模板与 5 $\rightarrow$ 10 映射

大模型评估层（Call 1）在单次调用中只做纯粹的 1-5 整数匹配，不分析、不写评语，保证最强注意力与极低延迟。在输入 Rust 引擎前，后台通过线性公式自动拉伸映射并执行边界 Clamping 保护，防止非线性数值异常：

$$ S_{\text{raw}} = (S_{\text{LLM}} - 1) \times 2.5 $$
$$ S_{\text{final}} = \max(0.0, \min(10.0, S_{\text{raw}})) $$

### 4.1 BARS 模板划分与强硬排除原则

*   **Template 1：内容与叙事质量量表（1 - 5 分）**
    *   *适用因子*：`practical_value`, `narrative_completeness`, `source_credibility`, `personification`.
    *   *`practical_value` 负向排除原则*：本指标仅测量物理上的可执行、可操作信息（如避坑指南、具体方法、优惠折扣）。情感治愈、美学享受、虚构故事带来的心理慰藉在此处**被严格排除（STRICTLY EXCLUDED）**，若无实际物理效用，必须评为低分。
*   **Template 2：情绪与共鸣度量表（1 - 5 分）**
    *   *适用因子*：`content_emotion_arousal`, `social_currency_attr`.
*   **Template 3：认知位势与创新度量表（1 - 5 分 - 认知正交量表）**
    *   *适用因子*：`uniqueness`, `innovation`, `enhancement`, `strangeness`, `remix_openness`.
    *   *`remix_openness` 模因对齐原则*：本指标仅衡量文本的结构模块化（如是否适合作为填空、复制粘贴的模因模板/Copypasta）。高度具体、封闭的个人叙事写得再好，也无法作为模板被他人直接复制改写，此处**必须评为低分**。

---

## 五、 环境因子的客观注入与 `terrain_passability` 级联状态机

环境参数（$K$ 因子）代表外部战场的实时气象，大模型绝对不参与打分评估。K 值的 5 个子项通过客观渠道闭环注入：
*   **`surge_match` & `current_direction`**：通过 trends API 自动映射。
*   **`population_density` & `connectivity`**：由用户选择的目标平台圈层预设加载。
*   **`raw_suppression`**：通过搜索引擎 API 抓取头屏 Top 10，自动计算**语义余弦相似度均值** [5]。
*   **`A_algo`（算法分发）**：由用户在 UI 上直接通过推流滑块选择（无推流=1.0，热播加持=50.0，大促霸屏=200.0）。
*   **`terrain_passability`（渠道通畅度状态机）**：在 Call 1 评估时大模型输出内容题材安全标签。后端风控库匹配后驱动状态机：**红牌状态（`<2.0`）物理性拦截，不进入动态仿真。C_t_next 强行锁定为 0.0，并在 UI 高亮指出违规敏感句子。**
*   **`K_env`（环境推流增益）**：专司由 Call 1.1 及外部趋势 API 独立算得的环境系数，与内容自身的 `theta_spontaneous`（自发辐射拉新系数）在命名和物理通道上**彻底隔离，绝不重叠** [5]。

---

## 六、 审计核验与随机种子确定性设计（6th Amendment）

为了保证审计证据链（`audit_id`）的完全复现性，系统从源头杜绝任何进程级哈希随机状态：

1.  **审计 ID 主种子映射（SHA-256 截断）**：
    系统接收到唯一审计 ID（`audit_id`）后，对其 UTF-8 字节串进行标准的 **SHA-256 密码学哈希计算**。取哈希结果的**前 8 字节（低 64 位）**转换成 `u64` 整数，作为仿真引擎全局唯一的 `master_seed` [5]。
2.  **蒙特卡洛主种子并行分流算法（Master Seed Wrapping Add）**：
    在多线程并行计算中，第 $i$ 条路径的伪随机数生成器（PRNG）种子，严格使用 Rust 标准库中跨 100% 平台绝对确定的 `wrapping_add` 函数计算：
    $$ \text{seed}_i = \text{master\_seed.wrapping\_add}(i \text{ as u64}) $$
    该运算保证了多次运行该推演时，1000 条路径的演化轨迹和统计概率云图 **bit-to-bit 级别的完全一致** [5]。

---

## 七、 独立后置同化归因通道（Feedback Assimilation）

同化回贴（时效校准）作为**独立的后置归因通道（Posterior Attribution Channel）**，与求解器逻辑在物理上完全隔离，绝不产生双信源冲突，也绝不反向污染物理核心公式：

```
[用户回贴实测 G_obs] ───> [Next.js API 编排层] ───> [计算 K_obs = G_obs / G_std]
                                                         │
                                                         ▼ (仅由该独立通道调用)
[诊断文本生成 (Interpretation Report)] <─── [与标准仿真输出比对（DerivedMetrics）]
```
*   **数据流约束**：用户在 Web 界面输入该文案的实测曝光/阅读量（$G_{\text{obs}}$）。网关调用 `DerivedMetrics`（位于 `crates/state/src/metrics`）计算出真实的 $K_{\text{obs}} = G_{\text{obs}} / G_{\text{std}}$，并通过对比实测与系统预测的残差，输出“后置归因诊断报告” [5]。三个物理核心求解器对该数据流完全不感知，维持了尺子的纯净。

---

## 八、 实施路径与工程规格

整个 Lasinfon 仓库的代码与提示词资产在 v6.3.0 中被解构为以下模块化群落，完美符合《Milk Zen 工程哲学》的防退化要求：

*   **计算核心（`crates/core`）**：作为绝对的**叶子节点**，纯 `no_std` 物理公式。在 Cargo.toml 中绝对不依赖 `state` 或 `DerivedMetrics`。
*   **状态求解（`crates/state`）**：存放 `StandardSolver`、`ActiveSolver`、`EmergenceSolver` 和时序级联的 `CascadeSolver`。
*   **API 编排层（Next.js `/api/diagnose`）**：引入 **SaaS 权益切面与动态降级器**。若免费用户越权请求连载或涌现求解，网关不抛错，自动重定向至 `StandardSolver` 或 `ActiveSolver` 并在 JSON 返回 `DOWNGRADED_TO_STANDARD` 提示，前端 UI 配合渲染升级引导。

---

**Lasinfon v6.3.0** • *Predict the propagation, not the message.*
