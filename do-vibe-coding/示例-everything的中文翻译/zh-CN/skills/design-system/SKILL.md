---
name: design-system
description: 使用此技能来生成或审核设计系统、检查视觉一致性并审查涉及样式的 PR。origin: ECC
---
# 设计系统 — 生成和审核视觉系统

## 何时使用

- 启动一个需要设计系统的新项目
- 审核现有代码库的视觉一致性
- 重新设计之前——了解你拥有什么
- 当用户界面看起来“关闭”但您无法查明原因时
- 审查涉及造型的 PR

## 它是如何工作的

### 模式 1：生成设计系统

分析您的代码库并生成一个有凝聚力的设计系统：```
1. Scan CSS/Tailwind/styled-components for existing patterns
2. Extract: colors, typography, spacing, border-radius, shadows, breakpoints
3. Research 3 competitor sites for inspiration (via browser MCP)
4. Propose a design token set (JSON + CSS custom properties)
5. Generate DESIGN.md with rationale for each decision
6. Create an interactive HTML preview page (self-contained, no deps)
```
输出：`DESIGN.md` + `design-tokens.json` + `design-preview.html`

### 模式 2：目视审核

从 10 个维度对您的 UI 进行评分（每个维度 0-10）：```
1. Color consistency — are you using your palette or random hex values?
2. Typography hierarchy — clear h1 > h2 > h3 > body > caption?
3. Spacing rhythm — consistent scale (4px/8px/16px) or arbitrary?
4. Component consistency — do similar elements look similar?
5. Responsive behavior — fluid or broken at breakpoints?
6. Dark mode — complete or half-done?
7. Animation — purposeful or gratuitous?
8. Accessibility — contrast ratios, focus states, touch targets
9. Information density — cluttered or clean?
10. Polish — hover states, transitions, loading states, empty states
```
每个维度都有一个分数、具体示例以及精确的 file:line 修复。

### 模式3：AI 溢出检测

识别人工智能生成的通用设计模式：```
- Gratuitous gradients on everything
- Purple-to-blue defaults
- "Glass morphism" cards with no purpose
- Rounded corners on things that shouldn't be rounded
- Excessive animations on scroll
- Generic hero with centered text over stock gradient
- Sans-serif font stack with no personality
```
## 示例

**为 SaaS 应用程序生成：**```
/design-system generate --style minimal --palette earth-tones
```
**审核现有用户界面：**```
/design-system audit --url http://localhost:3000 --pages / /pricing /docs
```
**检查 AI 溢出：**```
/design-system slop-check
```
