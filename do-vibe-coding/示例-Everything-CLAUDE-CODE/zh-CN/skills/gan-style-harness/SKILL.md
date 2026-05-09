---
name: gan-style-harness
description: "受 GAN 启发的生成器评估器代理工具，用于自主构建高质量的应用程序。基于 Anthropic 2026 年 3 月的安全带设计论文。"origin: ECC-community
tools: Read, Write, Edit, Bash, Grep, Glob, Task
---
# GAN 风格的驾驭技巧

> 灵感来自 [Anthropic 用于长时间运行应用程序开发的 Harness Design](https://www.anthropic.com/engineering/harness-design-long-running-apps)（2026 年 3 月 24 日）

多代理工具将**生成**与**评估**分开，创建一个对抗性反馈循环，使质量远远超出单个代理所能达到的水平。

## 核心洞察

> 当被要求评估自己的工作时，代理人是病态的乐观主义者——他们赞扬平庸的产出，并说服自己放弃合法的问题。但是，设计一个**独立的评估器**来进行无情的严格远比教导生成器进行自我批评要容易处理。

这与 GAN（生成对抗网络）具有相同的动态：生成器生成，评估器批评，反馈驱动下一次迭代。

## 何时使用

- 通过一行提示构建完整的应用程序
- 需要高视觉质量的前端设计任务
- 需要工作功能而不仅仅是代码的全栈项目
- 任何“人工智能倾斜”美学不可接受的任务
- 您想要投资 50-200 美元以获得生产质量产出的项目

## 何时不使用- 快速单文件修复（使用标准“claude -p”）
- 预算紧张的任务（<10 美元）
- 简单重构（使用 de-sloppify 模式代替）
- 已经通过测试明确指定的任务（使用 TDD 工作流程）

## 架构```
                    ┌─────────────┐
                    │   PLANNER   │
                    │  (Opus 4.6) │
                    └──────┬──────┘
                           │ Product Spec
                           │ (features, sprints, design direction)
                           ▼
              ┌────────────────────────┐
              │                        │
              │   GENERATOR-EVALUATOR  │
              │      FEEDBACK LOOP     │
              │                        │
              │  ┌──────────┐          │
              │  │GENERATOR │--build-->│──┐
              │  │(Opus 4.6)│          │  │
              │  └────▲─────┘          │  │
              │       │                │  │ live app
              │    feedback             │  │
              │       │                │  │
              │  ┌────┴─────┐          │  │
              │  │EVALUATOR │<-test----│──┘
              │  │(Opus 4.6)│          │
              │  │+Playwright│         │
              │  └──────────┘          │
              │                        │
              │   5-15 iterations      │
              └────────────────────────┘
```
## 三位特工

### 1. 规划代理

**角色：** 产品经理 — 将简短的提示扩展为完整的产品规格。

**关键行为：**
- 采用一行提示并生成 16 个功能的多冲刺规范
- 定义用户故事、技术要求和视觉设计方向
- 故意**雄心勃勃** - 保守的计划会导致平庸的结果
- 产生评估者稍后将使用的评估标准

**型号：** Opus 4.6（需要深度推理以扩展规格）

### 2. 生成器代理

**角色：** 开发人员 — 根据规范实现功能。

**关键行为：**
- 适用于结构化冲刺（或较新型号的连续模式）
- 在编写代码之前与评估者协商“冲刺合同”
- 使用全栈工具：React、FastAPI/Express、数据库、CSS
- 管理 git 以进行迭代之间的版本控制
- 阅读评估者反馈并将其合并到下一次迭代中

**型号：** Opus 4.6（需要较强的编码能力）

### 3.评估代理

**角色：** QA 工程师 — 测试实时运行的应用程序，而不仅仅是代码。

**关键行为：**
- 使用 **Playwright MCP** 与实时应用程序交互- 点击功能、填写表格、测试 API 端点
- 根据四个标准的分数（可配置）：
  1. **设计质量** — 感觉是一个连贯的整体吗？
  2. **原创性** — 自定义决策与模板/AI 模式？
  3. **工艺**——排版、间距、动画、微交互？
  4. **功能** — 所有功能都真的有效吗？
- 返回包含分数和具体问题的结构化反馈
- 被设计为**无情的严格**——从不赞扬平庸的工作

**型号：** Opus 4.6（需要强大的判断力+工具使用）

## 评价标准

默认四个标准，每个评分1-10：```markdown
## Evaluation Rubric

### Design Quality (weight: 0.3)
- 1-3: Generic, template-like, "AI slop" aesthetics
- 4-6: Competent but unremarkable, follows conventions
- 7-8: Distinctive, cohesive visual identity
- 9-10: Could pass for a professional designer's work

### Originality (weight: 0.2)
- 1-3: Default colors, stock layouts, no personality
- 4-6: Some custom choices, mostly standard patterns
- 7-8: Clear creative vision, unique approach
- 9-10: Surprising, delightful, genuinely novel

### Craft (weight: 0.3)
- 1-3: Broken layouts, missing states, no animations
- 4-6: Works but feels rough, inconsistent spacing
- 7-8: Polished, smooth transitions, responsive
- 9-10: Pixel-perfect, delightful micro-interactions

### Functionality (weight: 0.2)
- 1-3: Core features broken or missing
- 4-6: Happy path works, edge cases fail
- 7-8: All features work, good error handling
- 9-10: Bulletproof, handles every edge case
```
### 评分

- **加权分数** = (criterion_score * 权重) 之和
- **通过阈值** = 7.0（可配置）
- **最大迭代** = 15（可配置，通常 5-15 就足够了）

## 用法

### 通过命令```bash
# Full three-agent harness
/project:gan-build "Build a project management app with Kanban boards, team collaboration, and dark mode"

# With custom config
/project:gan-build "Build a recipe sharing platform" --max-iterations 10 --pass-threshold 7.5

# Frontend design mode (generator + evaluator only, no planner)
/project:gan-design "Create a landing page for a crypto portfolio tracker"
```
### 通过 Shell 脚本```bash
# Basic usage
./scripts/gan-harness.sh "Build a music streaming dashboard"

# With options
GAN_MAX_ITERATIONS=10 \
GAN_PASS_THRESHOLD=7.5 \
GAN_EVAL_CRITERIA="functionality,performance,security" \
./scripts/gan-harness.sh "Build a REST API for task management"
```
### 通过克劳德代码（手动）```bash
# Step 1: Plan
claude -p --model opus "You are a Product Planner. Read PLANNER_PROMPT.md. Expand this brief into a full product spec: 'Build a Kanban board app'. Write spec to spec.md"

# Step 2: Generate (iteration 1)
claude -p --model opus "You are a Generator. Read spec.md. Implement Sprint 1. Start the dev server on port 3000."

# Step 3: Evaluate (iteration 1)
claude -p --model opus --allowedTools "Read,Bash,mcp__playwright__*" "You are an Evaluator. Read EVALUATOR_PROMPT.md. Test the live app at http://localhost:3000. Score against the rubric. Write feedback to feedback-001.md"

# Step 4: Generate (iteration 2 — reads feedback)
claude -p --model opus "You are a Generator. Read spec.md and feedback-001.md. Address all issues. Improve the scores."

# Repeat steps 3-4 until pass threshold met
```
## 模型功能的演变

随着模型的改进，线束应该简化。按照 Anthropic 的演变：

### 第 1 阶段 — 较弱模型（十四行诗级）
- 需要完整的冲刺分解
- 冲刺之间的上下文重置（避免上下文焦虑）
- 最少 2 个代理：初始化程序 + 编码代理
- 重型脚手架弥补了模型的限制

### 第 2 阶段 — 有能力的模型（Opus 4.5 级）
- 完整的 3 代理工具：规划器 + 生成器 + 评估器
- 在每个实施阶段之前冲刺合同
- 复杂应用程序的 10 次冲刺分解
- 上下文重置仍然有用但不太重要

### 第 3 阶段 — 前沿模型（Opus 4.6 级）
- 简化的线束：单一规划通道，连续生成
- 评估减少到单端通过（模型更智能）
- 无需冲刺结构
- 自动压缩处理上下文增长

> **关键原则：** 每个线束组件都会对模型无法单独完成的任务进行编码。当模型改进时，重新测试这些假设。去掉不再需要的东西。

## 配置

### 环境变量

|变量|默认 |描述 |
|----------|---------|-------------|| `GAN_MAX_ITERATIONS` | `15` |最大生成器-评估器周期 |
| `GAN_PASS_THRESHOLD` | `7.0` |加权分数通过 (1-10) |
| `GAN_PLANNER_MODEL` | `作品` |策划代理模特 |
| `GAN_GENERATOR_MODEL` | `作品` |发电机代理模型 |
| `GAN_EVALUATOR_MODEL` | `作品` |评估代理模型 |
| `GAN_EVAL_CRITERIA` | `设计、创意、工艺、功能` |逗号分隔的条件 |
| `GAN_DEV_SERVER_PORT` | `3000` |实时应用程序的端口 |
| `GAN_DEV_SERVER_CMD` | `npm 运行开发` |启动开发服务器的命令 |
| `GAN_PROJECT_DIR` | `.` |项目工作目录 |
| `GAN_SKIP_PLANNER` | `假` |跳过planner，直接使用spec |
| `GAN_EVAL_MODE` | `剧作家` | “剧作家”、“屏幕截图”或“仅代码” |

### 评估模式

|模式|工具|最适合 |
|------|--------|----------|
| `剧作家` |浏览器MCP+实时互动|带 UI 的全栈应用程序 |
| `屏幕截图` |截图+视觉分析|静态网站，仅设计 |
| `仅代码` |测试 + linting + 构建 | API、库、CLI 工具 |

## 反模式1. **评估者过于宽松** - 如果评估者在迭代 1 中通过了所有内容，则说明您的评分标准过于慷慨。收紧评分标准并对常见人工智能模式添加明确的惩罚。

2. **生成器忽略反馈** — 确保反馈作为文件传递，而不是内联传递。生成器应在每次迭代开始时读取“feedback-NNN.md”。

3. **无限循环** — 始终设置`GAN_MAX_ITERATIONS`。如果生成器在 3 次迭代后仍无法提高分数稳定水平，则停止并标记以供人工审核。

4. **评估者表面测试** — 评估者必须使用 Playwright 与实时应用程序**交互**，而不仅仅是对其进行屏幕截图。单击按钮、填写表格、测试错误状态。

5. **评估者称赞自己的修复** — 切勿让评估者提出修复建议，然后评估这些修复。评估者只进行批评；发电机修复。

6. **上下文耗尽** — 对于长时间会话，请使用 Claude Agent SDK 的自动压缩或在主要阶段之间重置上下文。

## 结果：预期结果

根据 Anthropic 公布的结果：

|公制|独奏经纪人 | GAN 线束 |改进|
|--------|---------|-------------|------------||时间 | 20 分钟 | 4-6 小时 |长 12-18 倍 |
|成本| 9 美元 | 125-200 美元 | 14-22 倍以上 |
|品质 |几乎没有功能|生产就绪 |相变|
|核心特点|破碎|一切正常|不适用 |
|设计|通用AI slop |独特、精致|不适用 |

**权衡是显而易见的：**约 20 倍的时间和成本才能实现输出质量的质的飞跃。这适用于质量至关重要的项目。

## 参考文献

- [Anthropic：长时间运行应用程序的利用设计](https://www.anthropic.com/engineering/harness-design-long-running-apps) — 原始论文，作者：Prithvi Rajasekaran
- [Epsilla：GAN 风格的代理循环](https://www.epsilla.com/blogs/anthropic-harness-engineering-multi-agent-gan-architecture) — 架构解构
- [Martin Fowler：线束工程](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html) — 更广泛的行业背景
- [OpenAI: Harness Engineering](https://openai.com/index/harness-engineering/) — OpenAI 的并行工作