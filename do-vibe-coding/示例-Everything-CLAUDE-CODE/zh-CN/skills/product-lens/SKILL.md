---
name: product-lens
description: 使用此技能在构建之前验证“原因”，运行产品诊断，并在请求成为实施合同之前对产品方向进行压力测试。origin: ECC
---
# 产品镜头 — 构建前三思

该通道负责产品诊断，而不是编写可实施的规范。

如果用户需要持久的 PRD 到 SRS 或功能合同工件，请移交给“产品功能”。

## 何时使用

- 在开始任何功能之前——验证“为什么”
- 每周产品回顾——我们正在构建正确的产品吗？
- 当卡在功能之间进行选择时
- 发布前 — 对用户旅程进行健全性检查
- 在工程规划开始之前将模糊的想法转化为产品简介时

## 它是如何工作的

### 模式1：产品诊断

与 YC 办公时间类似，但自动化。提出棘手的问题：```
1. Who is this for? (specific person, not "developers")
2. What's the pain? (quantify: how often, how bad, what do they do today?)
3. Why now? (what changed that makes this possible/necessary?)
4. What's the 10-star version? (if money/time were unlimited)
5. What's the MVP? (smallest thing that proves the thesis)
6. What's the anti-goal? (what are you explicitly NOT building?)
7. How do you know it's working? (metric, not vibes)
```
输出：包含答案、风险和继续/不继续建议的“产品简介.md”。

如果结果是“是的，构建这个”，那么下一条路线是“产品能力”，而不是更多的创始人剧院。

### 模式2：创始人评审

通过创始人的视角回顾您当前的项目：```
1. Read README, CLAUDE.md, package.json, recent commits
2. Infer: what is this trying to be?
3. Score: product-market fit signals (0-10)
   - Usage growth trajectory
   - Retention indicators (repeat contributors, return users)
   - Revenue signals (pricing page, billing code, Stripe integration)
   - Competitive moat (what's hard to copy?)
4. Identify: the one thing that would 10x this
5. Flag: things you're building that don't matter
```
### 模式 3：用户旅程审计

映射实际的用户体验：```
1. Clone/install the product as a new user
2. Document every friction point (confusing steps, errors, missing docs)
3. Time each step
4. Compare to competitor onboarding
5. Score: time-to-value (how long until the user gets their first win?)
6. Recommend: top 3 fixes for onboarding
```
### 模式 4：功能优先级

当你有 10 个想法并需要选择 2 个时：```
1. List all candidate features
2. Score each on: impact (1-5) × confidence (1-5) ÷ effort (1-5)
3. Rank by ICE score
4. Apply constraints: runway, team size, dependencies
5. Output: prioritized roadmap with rationale
```
## 输出

所有模式都输出可操作的文档，而不是论文。每项建议都有具体的下一步。

## 整合

搭配：
- `/browser-qa` 用于验证用户旅程审核结果
- 用于视觉抛光评估的“/设计系统审核”
- `/canary-watch` 用于启动后监控
- 当产品简介需要成为可实施的能力计划时的“产品能力”