---
description: "从当前分支创建具有未推送提交的 GitHub PR — 发现模板、分析更改、推送"argument-hint: "[base-branch] (default: main)"
---
# 创建拉取请求

> 改编自 Wirasm 的 PRPs-agentic-eng。 PRP 工作流程系列的一部分。

**输入**：`$ARGUMENTS` — 可选，可以包含基本分支名称和/或标志（例如，`--draft`）。

**解析`$ARGUMENTS`**：
- 提取任何可识别的标志（`--draft`）
- 将剩余的非标志文本视为基本分支名称
- 如果未指定，则默认基本分支为“main”

---

## 第 1 阶段 — 验证

检查前提条件：```bash
git branch --show-current
git status --short
git log origin/<base>..HEAD --oneline
```
|检查 |状况 |失败时采取的行动 |
|---|---|---|
|不在基础分支上 |当前分支 ≠ 基础分支 | Stop：“先切换到一个功能分支。” |
|清理工作目录 |没有未提交的更改 |警告：“您有未提交的更改。首先提交或存储。使用 `/prp-commit` 进行提交。” |
|已提前承诺 | `git log origin/<base>..HEAD` 不为空 |停止：“在 `<base>` 之前没有提交。没有任何 PR。” |
|没有现有的 PR | `gh pr list --head <branch> --json number` 为空 |停止：“PR 已存在：#<number>。使用 `gh pr view <number> --web` 将其打开。” |

如果所有检查均通过，则继续。

---

## 第 2 阶段 — 发现

### 公关模板

按顺序搜索 PR 模板：

1. `.github/PULL_REQUEST_TEMPLATE/` 目录 — 如果存在，列出文件并让用户选择（或使用 `default.md`）
2. `.github/PULL_REQUEST_TEMPLATE.md`
3. `.github/pull_request_template.md`
4. `文档/pull_request_template.md`

如果找到，请阅读它并将其结构用于 PR 正文。

### 提交分析```bash
git log origin/<base>..HEAD --format="%h %s" --reverse
```
分析提交以确定：
- **PR 标题**：使用带有类型前缀的常规提交格式 — `feat: ...`、`fix: ...` 等。
  - 如果有多种类型，请使用占主导地位的类型
  - 如果单个提交，则按原样使用其消息
- **更改摘要**：按类型/区域对提交进行分组

### 文件分析```bash
git diff origin/<base>..HEAD --stat
git diff origin/<base>..HEAD --name-only
```
对更改的文件进行分类：源、测试、文档、配置、迁移。

### PRP 制品

检查相关 PRP 工件：
- `.claude/PRPs/reports/` — 实施报告
- `.claude/PRPs/plans/` — 已执行的计划
- `.claude/PRPs/prds/` — 相关 PRD

如果存在，请在 PR 正文中引用这些内容。

---

## 第三阶段——推送```bash
git push -u origin HEAD
```
如果由于发散而推送失败：```bash
git fetch origin
git rebase origin/<base>
git push -u origin HEAD
```
如果发生变基冲突，请停止并通知用户。

---

## 第 4 阶段 — 创建

### 带模板

如果在第 2 阶段找到 PR 模板，请使用提交和文件分析填写每个部分。保留所有模板部分 - 如果不适用，则将部分保留为“N/A”，而不是删除它们。

### 没有模板

使用此默认格式：```markdown
## Summary

<1-2 sentence description of what this PR does and why>

## Changes

<bulleted list of changes grouped by area>

## Files Changed

<table or list of changed files with change type: Added/Modified/Deleted>

## Testing

<description of how changes were tested, or "Needs testing">

## Related Issues

<linked issues with Closes/Fixes/Relates to #N, or "None">
```
### 创建 PR```bash
gh pr create \
  --title "<PR title>" \
  --base <base-branch> \
  --body "<PR body>"
  # Add --draft if the --draft flag was parsed from $ARGUMENTS
```
---

## 第 5 阶段 — 验证```bash
gh pr view --json number,url,title,state,baseRefName,headRefName,additions,deletions,changedFiles
gh pr checks --json name,status,conclusion 2>/dev/null || true
```
---

## 阶段 6 — 输出

向用户报告：```
PR #<number>: <title>
URL: <url>
Branch: <head> → <base>
Changes: +<additions> -<deletions> across <changedFiles> files

CI Checks: <status summary or "pending" or "none configured">

Artifacts referenced:
  - <any PRP reports/plans linked in PR body>

Next steps:
  - gh pr view <number> --web   → open in browser
  - /code-review <number>       → review the PR
  - gh pr merge <number>        → merge when ready
```
---

## 边缘情况

- **没有 `gh` CLI**：停止：“需要 GitHub CLI (`gh`)。安装：<https://cli.github.com/>”
- **未经过身份验证**：停止：“首先运行`gh auth login`。”
- **需要强制推送**：如果远程已发生分歧并且已完成变基，请使用“git push --force-with-lease”（切勿使用“--force”）。
- **多个 PR 模板**：如果 `.github/PULL_REQUEST_TEMPLATE/` 有多个文件，列出它们并要求用户选择。
- **大型 PR（>20 个文件）**：警告 PR 大小。如果更改在逻辑上是可分离的，则建议拆分。