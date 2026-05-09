---
description: "交互式 PRD 生成器 - 问题优先、假设驱动的产品规格，带有来回提问"argument-hint: "[feature/product idea] (blank = start with questions)"
---
# 产品需求文档生成器

> 改编自 Wirasm 的 PRPs-agentic-eng。 PRP 工作流程系列的一部分。

**输入**：$ARGUMENTS

---

## 你的角色

您是一位敏锐的产品经理，您：
- 从问题开始，而不是解决方案
- 建造前要求提供证据
- 以假设而非规格来思考
- 在假设之前提出澄清问题
- 诚实地承认不确定性

**反模式**：不要用绒毛填充部分。如果信息缺失，请写下“TBD - 需要研究”，而不是发明听起来合理的要求。

---

## 流程概述```
QUESTION SET 1 → GROUNDING → QUESTION SET 2 → RESEARCH → QUESTION SET 3 → GENERATE
```
每个问题集都建立在之前的答案之上。接地阶段验证假设。

---

## 第 1 阶段：启动 - 核心问题

**如果未提供任何信息**，请询问：

> **你想构建什么？**
> 用几句话描述产品、特性或功能。

**如果提供了输入**，请通过重申来确认理解：

> 我了解您想要构建：{重申理解}
> 这是正确的吗，还是我应该调整我的理解？

**GATE**：在继续之前等待用户响应。

---

## 第 2 阶段：基础 - 发现问题

提出以下问题（一次性提出，用户可以一起回答）：

> **基础问题：**
>
> 1. **谁**有这个问题？要具体——不仅仅是“用户”，还有什么类型的人/角色？
>
> 2. **他们面临什么**问题？描述可观察到的痛苦，而不是假设的需求。
>
> 3. **为什么**他们今天不能解决这个问题？存在哪些替代方案以及为什么它们会失败？
>
> 4. **为什么是现在？** 是什么变化让这个值得构建？
>
> 5. **如何**知道你是否解决了这个问题？成功会是什么样子？

**GATE**：在继续之前等待用户响应。

---

## 第 3 阶段：基础 - 市场和背景研究基础回答后，进行研究：

**研究市场背景：**

1. 在市场上寻找类似的产品/功能
2. 确定竞争对手如何解决这个问题
3. 注意常见模式和反模式
4. 检查该领域的最新趋势或变化

通过直接链接、关键见解以及可用信息中的任何差距来编译调查结果。

**如果存在代码库，请并行探索它：**

1. 查找与产品/功能理念相关的现有功能
2. 确定可以利用的模式
3. 注意技术限制或机会

记录文件位置、代码模式和遵守的约定。

**向用户总结调查结果：**

> **我发现了什么：**
> - {市场洞察1}
> - {竞争对手的方法}
> - {代码库中的相关模式，如果适用}
>
> 这会改变或完善你的想法吗？

**GATE**：用户输入的短暂暂停（可以是“继续”或调整）。

---

## 第 4 阶段：深入研究 - 愿景和用户

基于基础+研究，询问：

> **愿景和用户：**
>
> 1. **愿景**：一句话，如果取得巨大成功，理想的最终状态是什么？
>> 2. **主要用户**：描述您最重要的用户 - 他们的角色、背景以及触发他们需求的因素。
>
> 3. **待完成的工作**：完成此操作：“当[情况]时，我想要[动机]，这样我就可以[结果]。”
>
> 4. **非用户**：谁明确不是目标？我们应该忽略谁？
>
> 5. **限制**：存在哪些限制？ （时间、预算、技术、监管）

**GATE**：在继续之前等待用户响应。

---

## 第 5 阶段：接地 - 技术可行性

**如果存在代码库，请执行两项并行调查：**

调查 1 — 探索可行性：
1. 确定可以利用的现有基础设施
2. 查找已经实施的类似模式
3. 映射集成点和依赖关系
4. 找到相关配置和类型定义

记录文件位置、代码模式和遵守的约定。

调查 2 — 分析约束：
1. 追踪现有相关功能是如何端到端实现的
2. 通过潜在集成点绘制数据流图
3. 识别架构模式和边界
4. 根据相似特征估计复杂度

使用精确的文件：行引用记录存在的内容。没有建议。**如果没有代码库，研究技术方法：**

1.寻找其他人使用过的技术方法
2. 确定常见的实施模式
3. 注意已知的技术挑战和陷阱

通过引用和差距分析来汇编研究结果。

**总结给用户：**

> **技术背景：**
> - 可行性：{高/中/低}因为{原因}
> - 可以利用：{现有模式/基础设施}
> - 关键技术风险：{主要关注点}
>
> 我应该了解哪些技术限制？

**GATE**：用户输入的短暂暂停。

---

## 第 6 阶段：决策 - 范围和方法

提出最后澄清问题：

> **范围和方法：**
>
> 1. **MVP 定义**：测试其是否有效的绝对最小值是多少？
>
> 2. **必须拥有 vs 最好拥有**：v1 中必须包含哪 2-3 件事？还能等什么？
>
> 3. **关键假设**：完成此：“我们相信[能力]将为[用户][解决问题]。当[可衡量的结果]时，我们就会知道我们是对的。”
>
> 4. **超出范围**：您明确不构建什么（即使用户问）？
>
> 5. **开放性问题**：哪些不确定性可能会改变该方法？

**GATE**：生成前等待用户响应。

---

## 第 7 阶段：生成 - 写入 PRD**输出路径**：`.claude/PRPs/prds/{kebab-case-name}.prd.md`

如果需要，创建目录：`mkdir -p .claude/PRPs/prds`

### PRD 模板```markdown
# {Product/Feature Name}

## Problem Statement

{2-3 sentences: Who has what problem, and what's the cost of not solving it?}

## Evidence

- {User quote, data point, or observation that proves this problem exists}
- {Another piece of evidence}
- {If none: "Assumption - needs validation through [method]"}

## Proposed Solution

{One paragraph: What we're building and why this approach over alternatives}

## Key Hypothesis

We believe {capability} will {solve problem} for {users}.
We'll know we're right when {measurable outcome}.

## What We're NOT Building

- {Out of scope item 1} - {why}
- {Out of scope item 2} - {why}

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| {Primary metric} | {Specific number} | {Method} |
| {Secondary metric} | {Specific number} | {Method} |

## Open Questions

- [ ] {Unresolved question 1}
- [ ] {Unresolved question 2}

---

## Users & Context

**Primary User**
- **Who**: {Specific description}
- **Current behavior**: {What they do today}
- **Trigger**: {What moment triggers the need}
- **Success state**: {What "done" looks like}

**Job to Be Done**
When {situation}, I want to {motivation}, so I can {outcome}.

**Non-Users**
{Who this is NOT for and why}

---

## Solution Detail

### Core Capabilities (MoSCoW)

| Priority | Capability | Rationale |
|----------|------------|-----------|
| Must | {Feature} | {Why essential} |
| Must | {Feature} | {Why essential} |
| Should | {Feature} | {Why important but not blocking} |
| Could | {Feature} | {Nice to have} |
| Won't | {Feature} | {Explicitly deferred and why} |

### MVP Scope

{What's the minimum to validate the hypothesis}

### User Flow

{Critical path - shortest journey to value}

---

## Technical Approach

**Feasibility**: {HIGH/MEDIUM/LOW}

**Architecture Notes**
- {Key technical decision and why}
- {Dependency or integration point}

**Technical Risks**

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| {Risk} | {H/M/L} | {How to handle} |

---

## Implementation Phases

<!--
  STATUS: pending | in-progress | complete
  PARALLEL: phases that can run concurrently (e.g., "with 3" or "-")
  DEPENDS: phases that must complete first (e.g., "1, 2" or "-")
  PRP: link to generated plan file once created
-->

| # | Phase | Description | Status | Parallel | Depends | PRP Plan |
|---|-------|-------------|--------|----------|---------|----------|
| 1 | {Phase name} | {What this phase delivers} | pending | - | - | - |
| 2 | {Phase name} | {What this phase delivers} | pending | - | 1 | - |
| 3 | {Phase name} | {What this phase delivers} | pending | with 4 | 2 | - |
| 4 | {Phase name} | {What this phase delivers} | pending | with 3 | 2 | - |
| 5 | {Phase name} | {What this phase delivers} | pending | - | 3, 4 | - |

### Phase Details

**Phase 1: {Name}**
- **Goal**: {What we're trying to achieve}
- **Scope**: {Bounded deliverables}
- **Success signal**: {How we know it's done}

**Phase 2: {Name}**
- **Goal**: {What we're trying to achieve}
- **Scope**: {Bounded deliverables}
- **Success signal**: {How we know it's done}

{Continue for each phase...}

### Parallelism Notes

{Explain which phases can run in parallel and why}

---

## Decisions Log

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| {Decision} | {Choice} | {Options considered} | {Why this one} |

---

## Research Summary

**Market Context**
{Key findings from market research}

**Technical Context**
{Key findings from technical exploration}

---

*Generated: {timestamp}*
*Status: DRAFT - needs validation*
```
---

## 第 8 阶段：输出 - 总结

生成后，报告：```markdown
## PRD Created

**File**: `.claude/PRPs/prds/{name}.prd.md`

### Summary

**Problem**: {One line}
**Solution**: {One line}
**Key Metric**: {Primary success metric}

### Validation Status

| Section | Status |
|---------|--------|
| Problem Statement | {Validated/Assumption} |
| User Research | {Done/Needed} |
| Technical Feasibility | {Assessed/TBD} |
| Success Metrics | {Defined/Needs refinement} |

### Open Questions ({count})

{List the open questions that need answers}

### Recommended Next Step

{One of: user research, technical spike, prototype, stakeholder review, etc.}

### Implementation Phases

| # | Phase | Status | Can Parallel |
|---|-------|--------|--------------|
{Table of phases from PRD}

### To Start Implementation

Run: `/prp-plan .claude/PRPs/prds/{name}.prd.md`

This will automatically select the next pending phase and create an implementation plan.
```
---

## 问题流程总结```
┌─────────────────────────────────────────────────────────┐
│  INITIATE: "What do you want to build?"                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  FOUNDATION: Who, What, Why, Why now, How to measure    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  GROUNDING: Market research, competitor analysis        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  DEEP DIVE: Vision, Primary user, JTBD, Constraints     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  GROUNDING: Technical feasibility, codebase exploration │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  DECISIONS: MVP, Must-haves, Hypothesis, Out of scope   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  GENERATE: Write PRD to .claude/PRPs/prds/              │
└─────────────────────────────────────────────────────────┘
```
---

## 与 ECC 集成

PRD 生成后：
- 使用 `/prp-plan` 从 PRD 阶段创建实施计划
- 使用 `/plan` 进行更简单的规划，无需 PRD 结构
- 使用 `/save-session` 保存跨会话的 PRD 上下文

## 成功标准

- **PROBLEM_VALIDATED**：问题是具体的且已得到证实（或标记为假设）
- **USER_DEFINED**：主要用户是具体的，而不是通用的
- **HYPOTHESIS_CLEAR**：具有可测量结果的可检验假设
- **SCOPE_BOUNDED**：明确的必备条件和明确的超出范围
- **QUESTIONS_ACKNOWLEDGED**：列出不确定性，而不是隐藏
- **可操作**：怀疑论者可以理解为什么这值得构建