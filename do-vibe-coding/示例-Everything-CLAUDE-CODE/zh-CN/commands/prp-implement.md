---
description: 通过严格的验证循环执行实施计划argument-hint: <path/to/plan.md>
---
> 改编自 Wirasm 的 PRPs-agentic-eng。 PRP 工作流程系列的一部分。

# PRP 实施

逐步执行计划文件并持续验证。每个更改都会立即得到验证——永远不会累积损坏的状态。

**核心理念**：验证循环尽早发现错误。每次更改后运行检查。立即解决问题。

**黄金法则**：如果验证失败，请在继续之前修复它。切勿累积破损状态。

---

## 阶段 0 — 检测

### 包管理器检测

|文件存在 |包管理器 |跑步者 |
|---|---|---|
| `bun.lockb` |包子| `包子跑` |
| `pnpm-lock.yaml` | PNPM | `pnpm 运行` |
| `yarn.lock` |纱线| `纱线` |
| `package-lock.json` | npm | `npm 运行` |
| `pyproject.toml` 或 `requirements.txt` |紫外线/点| `uv run` 或 `python -m` |
| `Cargo.toml` |货物 | `货物` |
| `go.mod` |去 | `去` |

### 验证脚本

检查“package.json”（或等效项）以获取可用脚本：```bash
# For Node.js projects
cat package.json | grep -A 20 '"scripts"'
```
请注意以下可用命令：类型检查、lint、测试、构建。

---

## 第 1 阶段 — 加载

阅读计划文件：```bash
cat "$ARGUMENTS"
```
从计划中提取这些部分：
- **摘要** — 正在建设什么
- **要镜像的模式** — 要遵循的代码约定
- **要更改的文件** — 要创建或修改的内容
- **分步任务** — 实施顺序
- **验证命令** — 如何验证正确性
- **验收标准** — 完成的定义

如果文件不存在或不是有效的计划：```
Error: Plan file not found or invalid.
Run /prp-plan <feature-description> to create a plan first.
```
**检查点**：计划已加载。已确定的所有部分。提取的任务。

---

## 第二阶段——准备

### Git 状态```bash
git branch --show-current
git status --porcelain
```
### 分支决策

|当前状态 |行动|
|---|---|
|在功能分支上 |使用当前分支 |
|在主要的、干净的工作树上 |创建功能分支：`git checkout -b feat/{plan-name}` |
|在主要的、肮脏的工作树上| **停止** — 要求用户先存储或提交 |
|在该功能的 git 工作树中 |使用工作树|

### 同步远程```bash
git pull --rebase origin $(git branch --show-current) 2>/dev/null || true
```
**检查点**：在正确的分支上。工作树准备就绪。远程同步。

---

## 第 3 阶段 — 执行

按顺序处理计划中的每项任务。

### 每任务循环

对于**分步任务**中的每项任务：

1. **读取 MIRROR 参考** — 打开任务的 MIRROR 字段中引用的模式文件。在编写代码之前先了解约定。

2. **实现** — 严格按照模式编写代码。应用 GOTCHA 警告。使用指定的 IMPORTS。

3. **立即验证** — 每次文件更改后：   ```bash
   # Run type-check (adjust command per project)
   [type-check command from Phase 0]
   ```
如果类型检查失败 → 在移至下一个文件之前修复错误。

4. **跟踪进度** — 日志：`[完成] 任务 N：[任务名称] — 完成`

### 处理偏差

如果实施必须偏离计划：
- 注意**改变了什么**
- 注意**为什么**它改变了
- 继续采用正确的方法
- 这些偏差将记录在报告中

**检查点**：所有任务均已执行。记录偏差。

---

## 第 4 阶段 — 验证

运行计划中的所有验证级别。在继续之前解决每个级别的问题。

### 第 1 级：静态分析```bash
# Type checking — zero errors required
[project type-check command]

# Linting — fix automatically where possible
[project lint command]
[project lint-fix command]
```
如果自动修复后仍然存在 lint 错误，请手动修复。

### 第 2 级：单元测试

为每个新功能编写测试（按照计划的测试策略中指定）。```bash
[project test command for affected area]
```
- 每个功能都需要至少一次测试
- 涵盖计划中列出的边缘情况
- 如果测试失败 → 修复实现（不是测试，除非测试是错误的）

### 第 3 级：构建检查```bash
[project build command]
```
构建必须成功且零错误。

### 第 4 级：集成测试（如果适用）```bash
# Start server, run tests, stop server
[project dev server command] &
SERVER_PID=$!

# Wait for server to be ready (adjust port as needed)
SERVER_READY=0
for i in $(seq 1 30); do
  if curl -sf http://localhost:PORT/health >/dev/null 2>&1; then
    SERVER_READY=1
    break
  fi
  sleep 1
done

if [ "$SERVER_READY" -ne 1 ]; then
  kill "$SERVER_PID" 2>/dev/null || true
  echo "ERROR: Server failed to start within 30s" >&2
  exit 1
fi

[integration test command]
TEST_EXIT=$?

kill "$SERVER_PID" 2>/dev/null || true
wait "$SERVER_PID" 2>/dev/null || true

exit "$TEST_EXIT"
```
### 第 5 级：边缘情况测试

从计划的测试策略清单中运行边缘案例。

**检查点**：所有 5 个验证级别均通过。零错误。

---

## 第 5 阶段 — 报告

### 创建实施报告```bash
mkdir -p .claude/PRPs/reports
```
将报告写入 `.claude/PRPs/reports/{plan-name}-report.md`：```markdown
# Implementation Report: [Feature Name]

## Summary
[What was implemented]

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | [from plan] | [actual] |
| Confidence | [from plan] | [actual] |
| Files Changed | [from plan] | [actual count] |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | [task name] | [done] Complete | |
| 2 | [task name] | [done] Complete | Deviated — [reason] |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis | [done] Pass | |
| Unit Tests | [done] Pass | N tests written |
| Build | [done] Pass | |
| Integration | [done] Pass | or N/A |
| Edge Cases | [done] Pass | |

## Files Changed

| File | Action | Lines |
|---|---|---|
| `path/to/file` | CREATED | +N |
| `path/to/file` | UPDATED | +N / -M |

## Deviations from Plan
[List any deviations with WHAT and WHY, or "None"]

## Issues Encountered
[List any problems and how they were resolved, or "None"]

## Tests Written

| Test File | Tests | Coverage |
|---|---|---|
| `path/to/test` | N tests | [area covered] |

## Next Steps
- [ ] Code review via `/code-review`
- [ ] Create PR via `/prp-pr`
```
### 更新 PRD（如果适用）

如果此实现用于 PRD 阶段：
1. 将阶段状态从“进行中”更新为“完成”
2.添加报告路径作为参考

### 存档计划```bash
mkdir -p .claude/PRPs/plans/completed
mv "$ARGUMENTS" .claude/PRPs/plans/completed/
```
**检查点**：已创建报告。珠三角已更新。计划已存档。

---

## 阶段 6 — 输出

向用户报告：```
## Implementation Complete

- **Plan**: [plan file path] → archived to completed/
- **Branch**: [current branch name]
- **Status**: [done] All tasks complete

### Validation Summary

| Check | Status |
|---|---|
| Type Check | [done] |
| Lint | [done] |
| Tests | [done] (N written) |
| Build | [done] |
| Integration | [done] or N/A |

### Files Changed
- [N] files created, [M] files updated

### Deviations
[Summary or "None — implemented exactly as planned"]

### Artifacts
- Report: `.claude/PRPs/reports/{name}-report.md`
- Archived Plan: `.claude/PRPs/plans/completed/{name}.plan.md`

### PRD Progress (if applicable)
| Phase | Status |
|---|---|
| Phase 1 | [done] Complete |
| Phase 2 | [next] |
| ... | ... |

> Next step: Run `/prp-pr` to create a pull request, or `/code-review` to review changes first.
```
---

## 处理失败

### 类型检查失败
1.仔细阅读错误信息
2.修复源文件中的类型错误
3. 重新运行类型检查
4. 仅在清洁后继续

### 测试失败
1. 确定bug是在实现中还是在测试中
2. 修复根本原因（通常是实现）
3. 重新运行测试
4. 仅当绿色时才继续

### Lint 失败
1.首先运行自动修复
2. 如果仍然存在错误，请手动修复
3. 重新运行 lint
4. 仅在清洁后继续

### 构建失败
1. 通常是类型或导入问题 - 检查错误消息
2.修复有问题的文件
3. 重新运行构建
4. 成功后才继续

### 集成测试失败
1.检查服务器是否正确启动
2. 验证端点/路由是否存在
3. 检查请求格式是否符合预期
4.修复并重新运行

---

## 成功标准

- **TASKS_COMPLETE**：执行计划中的所有任务
- **TYPES_PASS**：零类型错误
- **LINT_PASS**：零棉绒错误
- **TESTS_PASS**：所有测试都绿色，写入新测试
- **BUILD_PASS**：构建成功
- **REPORT_CREATED**：已保存实施报告
- **PLAN_ARCHIVED**：计划移至“已完成/”

---

## 后续步骤

- 在提交之前运行“/code-review”来检查更改- 运行“/prp-commit”以提交描述性消息
- 运行“/prp-pr”来创建拉取请求
- 如果 PRD 有更多阶段，请运行“/prp-plan <next-phase>”