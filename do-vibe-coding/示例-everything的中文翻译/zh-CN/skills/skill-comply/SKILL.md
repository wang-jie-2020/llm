---
name: skill-comply
description: 可视化技能、规则和代理定义是否得到实际遵循 - 自动生成 3 个提示严格级别的场景、运行代理、对行为序列进行分类，并通过完整的工具调用时间线报告合规率origin: ECC
tools: Read, Bash
---
# Skill-Comply：自动合规性测量

通过以下方式衡量编码代理是否真正遵循技能、规则或代理定义：
1. 从任何 .md 文件自动生成预期的行为序列（规范）
2. 自动生成提示严格性递减的场景（支持→中立→竞争）
3. 运行“claude -p”并通过stream-json捕获工具调用痕迹
4. 使用 LLM（不是正则表达式）根据规范步骤对工具调用进行分类
5. 确定性地检查时间顺序
6. 生成包含规范、提示和时间表的独立报告

## 支持的目标

- **技能** (`skills/*/SKILL.md`)：工作流程技能，例如搜索优先、TDD 指南
- **Rules** (`rules/common/*.md`)：强制性规则，例如testing.md、security.md、git-workflow.md
- **代理定义** (`agents/*.md`)：是否在预期时调用代理（尚不支持内部工作流程验证）

## 何时激活

- 用户运行“/skill-comply <路径>”
- 用户询问“实际上是否遵守了这条规则？”
- 添加新规则/技能后，验证代理合规性
- 定期作为质量维护的一部分

## 用法```bash
# Full run
uv run python -m scripts.run ~/.claude/rules/common/testing.md

# Dry run (no cost, spec + scenarios only)
uv run python -m scripts.run --dry-run ~/.claude/skills/search-first/SKILL.md

# Custom models
uv run python -m scripts.run --gen-model haiku --model sonnet <path>
```
## 关键概念：迅速独立

衡量是否遵循技能/规则，即使提示未明确支持它。

## 报告内容

报告是独立的，包括：
1. 预期的行为序列（自动生成的规范）
2.场景提示（每个严格级别都问什么）
3. 每个场景的合规性分数
4.带有LLM分类标签的工具调用时间表

### 高级（可选）

对于熟悉 Hook 的用户，报告还包括针对合规性较低的步骤的 Hook 升级建议。这是信息性的——主要价值是合规性可见性本身。