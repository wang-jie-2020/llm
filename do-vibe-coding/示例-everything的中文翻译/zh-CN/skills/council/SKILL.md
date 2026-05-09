---
name: council
description: 召集一个四人委员会来讨论模棱两可的决定、权衡以及继续/不继续的决定。当存在多个有效路径并且您在选择之前需要结构化分歧时使用。origin: ECC
---
# 理事会

召集四名顾问来做出不明确的决定：
- 克劳德的语境中的声音
- 怀疑论者副特工
- 实用主义者副代理人
- 批评家副代理人

这是为了**在不明确的情况下做出决策**，而不是代码审查、实施规划或架构设计。

## 何时使用

在以下情况下使用理事会：
- 一个决策有多个可信路径，并且没有明显的赢家
- 你需要明确的权衡
- 用户寻求第二意见、异议或多种观点
- 对话锚定是一个真正的风险
- 进行/不进行的决定将受益于对抗性挑战

示例：
- monorepo 与 polyrepo
- 立即发货与等待波兰
- 功能标志与全面推出
- 简化范围与保持战略广度

## 何时不使用

|而不是理事会|使用 |
| --- | --- |
|验证输出是否正确 | `圣诞老人方法` |
|将功能分解为实施步骤 | `计划者` |
|设计系统架构| `建筑师` |
|检查代码中的错误或安全性 | `code-reviewer` 或 `santa-method` |
|直接的事实问题|直接回答就行 |
|执行任务明显|只做任务|

## 角色

|语音|镜头|
| --- | --- ||建筑师 |正确性、可维护性、长期影响|
|怀疑论者|前提挑战、简化、打破假设 |
|实用主义者|运输速度、用户影响、运营现实 |
|评论家 |边缘情况、下行风险、故障模式 |

这三个外部声音应该作为新的子代理启动，**只有问题和相关背景**，而不是完整的正在进行的对话。这就是反锚定机制。

## 工作流程

### 1.提取真题

将决策简化为一个明确的提示：
- 我们在决定什么？
- 哪些限制因素很重要？
- 什么才算成功？

如果问题含糊不清，请在召开理事会之前提出一个澄清问题。

### 2. 仅收集必要的上下文

如果决策是特定于代码库的：
- 收集相关文件、片段、问题文本或指标
- 保持紧凑
- 仅包含做出决定所需的背景

如果决策是战略性/一般性的：
- 跳过存储库片段，除非它们实质性地改变了答案

### 3. 首先形成架构师职位

在阅读其他声音之前，写下：
- 你的初始位置
- 三个最有力的理由- 您首选路径中的主要风险

首先执行此操作，以便合成不会简单地反映外部声音。

### 4.并行启动三个独立的声音

每个子代理获得：
- 决策问题
- 如果需要的话，紧凑的上下文
- 严格的角色
- 没有不必要的对话历史

提示形状：```text
You are the [ROLE] on a four-voice decision council.

Question:
[decision question]

Context:
[only the relevant snippets or constraints]

Respond with:
1. Position — 1-2 sentences
2. Reasoning — 3 concise bullets
3. Risk — biggest risk in your recommendation
4. Surprise — one thing the other voices may miss

Be direct. No hedging. Keep it under 300 words.
```
角色强调：
- 怀疑论者：挑战框架，质疑假设，提出最简单可信的替代方案
- 实用主义者：针对速度、简单性和实际执行进行优化
- 批评者：表面下行风险、极端情况以及计划可能失败的原因

### 5. 使用偏置护栏进行合成

您既是参与者又是合成者，因此请使用以下规则：
- 不要在没有解释原因的情况下否定外部观点
- 如果外部声音改变了您的建议，请明确说明
- 始终包括最强烈的异议，即使你拒绝它
- 如果两个声音与您的初始位置对齐，请将其视为真实信号
- 在判决前保持原始头寸可见

### 6. 提出一个简洁的结论

使用此输出形状：```markdown
## Council: [short decision title]

**Architect:** [1-2 sentence position]
[1 line on why]

**Skeptic:** [1-2 sentence position]
[1 line on why]

**Pragmatist:** [1-2 sentence position]
[1 line on why]

**Critic:** [1-2 sentence position]
[1 line on why]

### Verdict
- **Consensus:** [where they align]
- **Strongest dissent:** [most important disagreement]
- **Premise check:** [did the Skeptic challenge the question itself?]
- **Recommendation:** [the synthesized path]
```
使其可在手机屏幕上扫描。

## 持久性规则

**不要**将临时注释写入“~/.claude/notes”或此技能的其他影子路径。

如果理事会实质性改变建议：
- 使用“知识操作”将课程存储在正确的持久位置
- 如果结果属于会话内存，则使用“/save-session”
- 如果决策改变了主动执行事实，则直接更新相关的 GitHub / Linear 问题

只有当决定改变了现实时才坚持它。

## 多轮跟进

默认为一轮。

如果用户想要另一轮：
- 保持新问题的焦点
- 仅在必要时才包含先前的判决
- 尽可能保持怀疑论者的干净，以保持反锚定价值

## 反模式

- 使用委员会进行代码审查
- 当任务只是实施工作时使用理事会
- 向子代理提供整个对话记录
- 在最终判决中隐藏分歧
- 无论重要性如何，坚持每一个决定作为笔记

## 相关技能

- `santa-method` — 对抗性验证
- `knowledge-ops` — 正确地持久保存决策增量- “搜索优先”——如果需要，在理事会之前收集外部参考材料
-“架构决策记录”——当决策成为长期系统策略时，将结果正式化

## 示例

问题：```text
Should we ship ECC 2.0 as alpha now, or hold until the control-plane UI is more complete?
```
可能的理事会结构：
- 建筑师致力于结构完整性并避免混乱的表面
- 怀疑论者质疑用户界面是否真的是控制因素
- 实用主义者询问现在可以运送什么而不损害信任
- 批评者重点关注支持负担、期望债务和推出混乱

价值观并不是一致的。价值在于在选择之前让分歧变得清晰。