---
name: token-budget-advisor
description: >-  Offers the user an informed choice about how much response depth to
  consume before answering. Use this skill when the user explicitly
  wants to control response length, depth, or token budget.
  TRIGGER when: "token budget", "token count", "token usage", "token limit",
  "response length", "answer depth", "short version", "brief answer",
  "detailed answer", "exhaustive answer", "respuesta corta vs larga",
  "cuántos tokens", "ahorrar tokens", "responde al 50%", "dame la versión
  corta", "quiero controlar cuánto usas", or clear variants where the
  user is explicitly asking to control answer size or depth.
  DO NOT TRIGGER when: user has already specified a level in the current
  session (maintain it), the request is clearly a one-word answer, or
  "token" refers to auth/session/payment tokens rather than response size.
origin: community
---
# 代币预算顾问（待定）

拦截响应流，以便在 Claude 回答之前**为用户提供响应深度的选择。

## 何时使用

- 用户想要控制响应的长度或详细程度
- 用户提及代币、预算、深度或响应长度
- 用户说“简短版本”、“tldr”、“简短”、“al 25%”、“详尽”等。
- 任何时候用户想要预先选择深度/细节级别

**当以下情况时不触发**：用户已经在本次会话中设置了一个级别（默默地维护它），或者答案只是一行。

## 它是如何工作的

### 步骤 1 — 估计输入标记

使用存储库的规范上下文预算启发法在心里估计提示的标记计数。

使用与 [context-budget](../context-budget/SKILL.md) 相同的校准指南：

- 散文：`文字×1.3`
- 代码较多或混合/代码块：`chars / 4`

对于混合内容，请使用主要内容类型并保持估计启发式。

### 步骤 2 — 按复杂性估计响应大小

对提示进行分类，然后应用乘数范围以获得完整的响应窗口：

|复杂性 |乘数范围|提示示例 ||--------------|------------------|------------------------------------------------------------------|
|简单| 3× – 8× | “X 是什么？”，是/否，单一事实 |
|中等| 8× – 20× | “X是如何运作的？”                                  |
|中高| 10× – 25× |带有上下文的代码请求 |
|复杂| 15× – 40× |多部分分析、比较、架构 |
|创意| 10× – 30× |故事、散文、叙事写作 |

响应窗口 = `input_tokens × mult_min` 到 `input_tokens × mult_max` （但不要超出模型配置的输出令牌限制）。

### 步骤 3 — 显示深度选项

**在**回答之前，使用实际估计的数字呈现此块：```
Analyzing your prompt...

Input: ~[N] tokens  |  Type: [type]  |  Complexity: [level]  |  Language: [lang]

Choose your depth level:

[1] Essential   (25%)  ->  ~[tokens]   Direct answer only, no preamble
[2] Moderate    (50%)  ->  ~[tokens]   Answer + context + 1 example
[3] Detailed    (75%)  ->  ~[tokens]   Full answer with alternatives
[4] Exhaustive (100%)  ->  ~[tokens]   Everything, no limits

Which level? (1-4 or say "25% depth", "50% depth", "75% depth", "100% depth")

Precision: heuristic estimate ~85-90% accuracy (±15%).
```
级别令牌估计（在响应窗口内）：
- 25% → `最小值 + (最大值 - 最小值) × 0.25`
- 50% → `最小值 + (最大值 - 最小值) × 0.50`
- 75% → `最小值 + (最大值 - 最小值) × 0.75`
- 100% → `最大`

### 第 4 步 — 按所选级别进行响应

|水平|目标长度|包括|省略|
|------------------|--------------------------------|----------------------------------------------------------------|----------------------------------------------------|
| 25% 必需 |最多 2-4 句话 |直接回答，关键结论|上下文、示例、细微差别、替代方案 |
| 50% 中等 | 1-3 段 |答案 + 必要的上下文 + 1 个示例 |深入分析、边缘案例、参考资料 |
| 75% 详细 |结构化响应 |多个示例、优点/缺点、替代方案 |极端边缘情况，详尽参考|
| 100% 详尽 |无限制 |一切——全面分析、所有代码、所有观点 |什么都没有|

## 快捷方式 — 跳过问题如果用户已经发出了某个级别的信号，请立即按该级别进行响应，而无需询问：

|他们怎么说 |水平|
|----------------------------------------------------------------|--------|
| “1”/“25% 深度”/“简短版本”/“简短答案”/“tldr” | 25% |
| “2”/“50% 深度”/“中等深度”/“平衡答案”| 50% |
| “3”/“75%深度”/“详细答案”/“彻底答案” | 75% |
| “4”/“100%深度”/“详尽的答案”/“全面深入”| 100% |

如果用户在会话早期设置了一个级别，**默默地维护它**以便后续响应，除非他们更改它。

## 精度注释

该技能使用启发式估计——没有真正的标记器。准确度~85-90%，方差±15%。始终显示免责声明。

## 示例

### 触发器

- “先给我简短的版本。”
- “你的答案将使用多少个代币？”
- “在 50% 深度响应。”
- “我想要详尽的答案，而不是摘要。”
- “Dame la version corta y luego la detallada”。

### 不触发

- “什么是 JWT 令牌？”
- “结账流程使用支付令牌。”
- “这正常吗？”
- “完成重构。”- 用户选择会话深度后的后续问题

## 来源

来自 [TBA — Claude Code 的代币预算顾问](https://github.com/Xabilimon1/Token-Budget-Advisor-Claude-Code-) 的独立技能。
原始项目还附带了一个 Python 估计器脚本，但该存储库使该技能保持独立且仅限启发式。