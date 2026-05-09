---
description: 通过代码库分析和模式提取创建全面的功能实施计划argument-hint: <feature description | path/to/prd.md>
---
> 改编自 Wirasm 的 PRPs-agentic-eng。 PRP 工作流程系列的一部分。

# PRP 计划

创建一个详细的、独立的实施计划，捕获一次性实施功能所需的所有代码库模式、约定和上下文。

**核心理念**：一个伟大的计划包含了实施所需的一切，无需提出进一步的问题。每一个模式、每一个约定、每一个陷阱——捕获一次，贯穿始终。

**黄金法则**：如果您需要在实施过程中搜索代码库，请立即在计划中捕获这些知识。

---

## 阶段 0 — 检测

从“$ARGUMENTS”确定输入类型：

|输入模式 |检测|行动|
|---|---|---|
|以 `.prd.md` 结尾的路径 | PRD | 文件路径解析 PRD，找到下一个待处理阶段 |
|带有“实施阶段”的“.md”路径 | PRD类文档 |解析阶段，查找下一个待处理 |
|任何其他文件的路径 |参考文件|读取文件的上下文，视为自由格式 |
|自由格式文本 |功能描述|直接进入第一阶段 |
|空/空白|没有输入 |询问用户计划什么功能 |

### PRD解析（当输入是PRD时）

1.使用`cat "$PRD_PATH"`读取PRD文件2. 解析**实施阶段**部分
3. 按状态查找阶段：
   - 寻找“待处理”阶段
   - 检查依赖链（一个阶段可能取决于之前的阶段是否“完整”）
   - 选择**下一个符合条件的待定阶段**
4. 从所选相中提取：
   - 阶段名称和描述
   - 验收标准
   - 对先前阶段的依赖
   - 任何范围说明或限制
5. 使用阶段描述作为特征来规划

如果没有剩余待处理阶段，则报告所有阶段均已完成。

---

## 第 1 阶段 — 解析

提取并阐明功能需求。

### 特征理解

从输入（PRD 阶段或自由格式描述）中识别：

- **正在建造什么**（具体可交付成果）
- **为什么**重要（用户价值）
- **谁**使用它（目标用户/系统）
- **哪里**适合（代码库的哪一部分）

### 用户故事

格式为：```
As a [type of user],
I want [capability],
So that [benefit].
```
### 复杂性评估

|水平|指标|典型范围|
|---|---|---|
| **小** |单个文件，孤立的更改，没有新的依赖项 | 1-3 个文件，<100 行 |
| **中** |多个文件、遵循现有模式、次要新概念 | 3-10 个文件，100-500 行 |
| **大** |跨领域关注点、新模式、外部集成 | 10+ 个文件，500+ 行 |
| **XL** |架构变更、新子系统、需要迁移 | 20+ 个文件，考虑拆分 |

### 歧义门

如果其中任何一个不清楚，请在继续之前**停止并询问用户**：

- 核心交付成果含糊不清
- 成功标准未定义
- 有多种有效的解释
- 技术方法存在重大未知数

不要猜测。问。建立在假设之上的计划在实施过程中会失败。

---

## 第二阶段——探索

收集深层代码库情报。直接在代码库中搜索以下每个类别。

### 代码库搜索（8 个类别）

对于每个类别，使用 grep、find 和文件读取进行搜索：

1. **类似实施** — 查找与计划功能相似的现有功能。寻找类似的模式、端点、组件或模块。2. **命名约定** — 确定文件、函数、变量、类和导出在代码库的相关区域中的命名方式。

3. **错误处理** — 了解如何在类似的代码路径中捕获、传播、记录错误并将其返回给用户。

4. **日志记录模式** — 确定记录的内容、级别和格式。

5. **类型定义** — 查找相关类型、接口、模式以及它们的组织方式。

6. **测试模​​式** — 了解如何测试相似的功能。注意测试文件位置、命名、安装/拆卸模式和断言样式。

7. **配置** — 查找相关的配置文件、环境变量和功能标志。

8. **依赖关系** — 识别类似功能使用的包、导入和内部模块。

### 代码库分析（5 条痕迹）

读取相关文件进行追踪：

1. **入口点** — 请求/操作如何进入系统并到达您正在修改的区域？
2. **数据流** — 数据如何通过相关代码路径移动？
3. **状态更改** — 修改了什么状态以及在哪里修改？
4. **合同** — 必须遵守哪些接口、API 或协议？5. **模式** — 使用哪些架构模式（存储库、服务、控制器等）？

### 统一发现表

将调查结果编译成单个参考文献：

|类别 |文件：线条|图案|关键片段|
|---|---|---|---|
|命名| `src/services/userService.ts:1-5` |驼峰命名法服务、帕斯卡命名法类型 | `导出类 UserService` |
|错误 | `src/middleware/errorHandler.ts:10-25` |自定义 AppError 类 | `抛出新的 AppError(...)` |
| ... | ... | ... | ... |

---

## 第三阶段——研究

如果该功能涉及外部库、API 或不熟悉的技术：

1. 网上搜索官方文档
2.查找使用示例和最佳实践
3. 识别特定于版本的问题

将每个结果格式化为：```
KEY_INSIGHT: [what you learned]
APPLIES_TO: [which part of the plan this affects]
GOTCHA: [any warnings or version-specific issues]
```
如果该功能仅使用易于理解的内部模式，请跳过此阶段并注意：“无需外部研究 - 功能使用已建立的内部模式。”

---

## 第 4 阶段 — 设计

### 用户体验转型（如果适用）

记录之前/之后的用户体验：

**之前：**```
┌─────────────────────────────┐
│  [Current user experience]  │
│  Show the current flow,     │
│  what the user sees/does    │
└─────────────────────────────┘
```
**后：**```
┌─────────────────────────────┐
│  [New user experience]      │
│  Show the improved flow,    │
│  what changes for the user  │
└─────────────────────────────┘
```
### 交互变化

|接触点|之前 |之后|笔记|
|---|---|---|---|
| ... | ... | ... | ... |

如果该功能纯粹是后端/内部的，没有用户体验更改，请注意：“内部更改 - 没有面向用户的用户体验转换。”

---

## 阶段 5 — 建筑师

### 战略设计

定义实现方法：

- **方法**：高级策略（例如，“按照现有存储库模式添加新的服务层”）
- **考虑的替代方案**：评估了哪些其他方法以及它们被拒绝的原因
- **范围**：将要建造的具体边界
- **不构建**：明确列出超出范围的内容（防止实施过程中范围蔓延）

---

## 第 6 阶段 — 生成

使用下面的模板编写完整的计划文件。保存到 `.claude/PRPs/plans/{kebab-case-feature-name}.plan.md`。

如果目录不存在则创建：```bash
mkdir -p .claude/PRPs/plans
```
### 计划模板````markdown
# Plan: [Feature Name]

## Summary
[2-3 sentence overview]

## User Story
As a [user], I want [capability], so that [benefit].

## Problem → Solution
[Current state] → [Desired state]

## Metadata
- **Complexity**: [Small | Medium | Large | XL]
- **Source PRD**: [path or "N/A"]
- **PRD Phase**: [phase name or "N/A"]
- **Estimated Files**: [count]

---

## UX Design

### Before
[ASCII diagram or "N/A — internal change"]

### After
[ASCII diagram or "N/A — internal change"]

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|

---

## Mandatory Reading

Files that MUST be read before implementing:

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 (critical) | `path/to/file` | 1-50 | Core pattern to follow |
| P1 (important) | `path/to/file` | 10-30 | Related types |
| P2 (reference) | `path/to/file` | all | Similar implementation |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| ... | ... | ... |

---

## Patterns to Mirror

Code patterns discovered in the codebase. Follow these exactly.

### NAMING_CONVENTION
// SOURCE: [file:lines]
[actual code snippet showing the naming pattern]

### ERROR_HANDLING
// SOURCE: [file:lines]
[actual code snippet showing error handling]

### LOGGING_PATTERN
// SOURCE: [file:lines]
[actual code snippet showing logging]

### REPOSITORY_PATTERN
// SOURCE: [file:lines]
[actual code snippet showing data access]

### SERVICE_PATTERN
// SOURCE: [file:lines]
[actual code snippet showing service layer]

### TEST_STRUCTURE
// SOURCE: [file:lines]
[actual code snippet showing test setup]

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `path/to/file.ts` | CREATE | New service for feature |
| `path/to/existing.ts` | UPDATE | Add new method |

## NOT Building

- [Explicit item 1 that is out of scope]
- [Explicit item 2 that is out of scope]

---

## Step-by-Step Tasks

### Task 1: [Name]
- **ACTION**: [What to do]
- **IMPLEMENT**: [Specific code/logic to write]
- **MIRROR**: [Pattern from Patterns to Mirror section to follow]
- **IMPORTS**: [Required imports]
- **GOTCHA**: [Known pitfall to avoid]
- **VALIDATE**: [How to verify this task is correct]

### Task 2: [Name]
- **ACTION**: ...
- **IMPLEMENT**: ...
- **MIRROR**: ...
- **IMPORTS**: ...
- **GOTCHA**: ...
- **VALIDATE**: ...

[Continue for all tasks...]

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| ... | ... | ... | ... |

### Edge Cases Checklist
- [ ] Empty input
- [ ] Maximum size input
- [ ] Invalid types
- [ ] Concurrent access
- [ ] Network failure (if applicable)
- [ ] Permission denied

---

## Validation Commands

### Static Analysis
```bash
# 运行类型检查器
[项目特定类型检查命令]```
EXPECT: Zero type errors

### Unit Tests
```bash
# 对受影响区域进行测试
[项目特定测试命令]```
EXPECT: All tests pass

### Full Test Suite
```bash
# 运行完整的测试套件
[项目特定完整测试命令]```
EXPECT: No regressions

### Database Validation (if applicable)
```bash
# 验证架构/迁移
[项目特定的数据库命令]```
EXPECT: Schema up to date

### Browser Validation (if applicable)
```bash
# 启动开发服务器并验证
[项目特定的开发服务器命令]```
EXPECT: Feature works as designed

### Manual Validation
- [ ] [Step-by-step manual verification checklist]

---

## Acceptance Criteria
- [ ] All tasks completed
- [ ] All validation commands pass
- [ ] Tests written and passing
- [ ] No type errors
- [ ] No lint errors
- [ ] Matches UX design (if applicable)

## Completion Checklist
- [ ] Code follows discovered patterns
- [ ] Error handling matches codebase style
- [ ] Logging follows codebase conventions
- [ ] Tests follow test patterns
- [ ] No hardcoded values
- [ ] Documentation updated (if needed)
- [ ] No unnecessary scope additions
- [ ] Self-contained — no questions needed during implementation

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| ... | ... | ... | ... |

## Notes
[Any additional context, decisions, or observations]
```
---

## 输出

### 保存计划

将生成的计划写入：```
.claude/PRPs/plans/{kebab-case-feature-name}.plan.md
```
### 更新 PRD（如果输入是 PRD）

如果该计划是从 PRD 阶段生成的：
1. 将阶段状态从“pending”更新为“in-progress”
2.添加计划文件路径作为阶段参考

### 向用户报告```
## Plan Created

- **File**: .claude/PRPs/plans/{kebab-case-feature-name}.plan.md
- **Source PRD**: [path or "N/A"]
- **Phase**: [phase name or "standalone"]
- **Complexity**: [level]
- **Scope**: [N files, M tasks]
- **Key Patterns**: [top 3 discovered patterns]
- **External Research**: [topics researched or "none needed"]
- **Risks**: [top risk or "none identified"]
- **Confidence Score**: [1-10] — likelihood of single-pass implementation

> Next step: Run `/prp-implement .claude/PRPs/plans/{name}.plan.md` to execute this plan.
```
---

## 验证

在最终确定之前，请对照以下清单验证计划：

### 上下文完整性
- [ ] 发现并记录的所有相关文件
- [ ] 示例中的命名约定
- [ ] 记录错误处理模式
- [ ] 确定测试模式
- [ ] 列出依赖项

### 实施准备情况
- [ ] 每个任务都有 ACTION、IMPLMENT、MIRROR 和 VALIDATE
- [ ] 没有任务需要额外的代码库搜索
- [ ] 指定导入路径
- [ ] 记录适用的问题

### 模式忠诚
- [ ] 代码片段是实际的代码库示例（不是发明的）
- [ ] SOURCE 引用指向真实文件和行号
- [ ] 模式涵盖命名、错误、日志记录、数据访问和测试
- [ ] 新代码将与现有代码无法区分

### 验证覆盖率
- [ ] 指定静态分析命令
- [ ] 指定测试命令
- [ ] 包含构建验证

### 用户体验清晰度
- [ ] 记录状态之前/之后（或标记为 N/A）
- [ ] 列出交互更改
- [ ] 确定用户体验的边缘情况

### 无先验知识测试不熟悉此代码库的开发人员应该能够仅使用此计划来实现该功能，而无需搜索代码库或提出问题。如果没有，请添加缺少的上下文。

---

## 后续步骤

- 运行“/prp-implement <plan-path>”来执行该计划
- 运行“/plan”以快速进行对话规划，而无需任何工件
- 如果范围不清楚，请先运行“/prp-prd”来创建 PRD````
