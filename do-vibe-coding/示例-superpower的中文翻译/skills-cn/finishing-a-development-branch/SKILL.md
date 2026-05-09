---
name: finishing-a-development-branch
description: 当实现完成、所有测试都通过并且您需要决定如何集成工作时使用 - 通过提供合并、PR 或清理的结构化选项来指导开发工作的完成
---

# 完成开发分支

## 概述

通过提供清晰的选项和处理选定的工作流程来指导开发工作的完成。

**核心原则：** 验证测试→检测环境→呈现选项→执行选择→清理。

**开始时宣布：**“我正在使用完成开发分支技能来完成这项工作。”

## 过程

### 第 1 步：验证测试

**在提供选项之前，请验证测试是否通过：**

```bash
# Run project's test suite
npm test / cargo test / pytest / go test ./...
```

**如果测试失败：**
```
Tests failing (<N> failures). Must fix before completing:

[Show failures]

Cannot proceed with merge/PR until tests pass.
```

停止。不要继续执行步骤 2。

**如果测试通过：** 继续执行步骤 2。

### 第2步：检测环境

**在呈现选项之前确定工作区状态：**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

这决定了显示哪个菜单以及清理工作如何进行：

|状态|菜单|清理 |
|-------|------|---------|
| `GIT_DIR == GIT_COMMON`（普通回购）|标准 4 选项 |没有需要清理的工作树 |
| `GIT_DIR != GIT_COMMON`，命名分支 |标准 4 选项 |基于出处（参见步骤 6）|
| `GIT_DIR != GIT_COMMON`，独立的头 |减少 3 个选项（无合并）|无需清理（外部管理）|

### 第三步：确定基础分支

```bash
# Try common base branches
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

或者问：“这个分支从主分支中分离出来 - 这是正确的吗？”

### 第四步：提出选项

**普通仓库和命名分支工作树 — 准确呈现这 4 个选项：**

```
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?
```

**分离 HEAD — 准确呈现这 3 个选项：**

```
Implementation complete. You're on a detached HEAD (externally managed workspace).

1. Push as new branch and create a Pull Request
2. Keep as-is (I'll handle it later)
3. Discard this work

Which option?
```

**不要添加解释** - 保持选项简洁。

### 第五步：执行选择

#### 选项 1：本地合并

```bash
# Get main repo root for CWD safety
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

# Merge first — verify success before removing anything
git checkout <base-branch>
git pull
git merge <feature-branch>

# Verify tests on merged result
<test command>

# Only after merge succeeds: cleanup worktree (Step 6), then delete branch
```

然后：清理工作树（步骤6），然后删除分支：

```bash
git branch -d <feature-branch>
```

#### 选项 2：推送并创建 PR

```bash
# Push branch
git push -u origin <feature-branch>

# Create PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets of what changed>

## Test Plan
- [ ] <verification steps>
EOF
)"
```

**不要清理工作树** - 用户需要它活着才能迭代 PR 反馈。

#### 选项 3：保持原样

报告：“保留分支<name>。工作树保留在<path>。”

**不要清理工作树。**

#### 选项 4：丢弃

**先确认：**
```
This will permanently delete:
- Branch <name>
- All commits: <commit-list>
- Worktree at <path>

Type 'discard' to confirm.
```

等待具体确认。

如果确认：
```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

然后：清理工作树（第6步），然后强制删除分支：
```bash
git branch -D <feature-branch>
```

### 第 6 步：清理工作区

**仅针对选项 1 和 4 运行。**选项 2 和 3 始终保留工作树。

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

**如果 `GIT_DIR == GIT_COMMON`:** 正常仓库，没有要清理的工作树。完毕。

**如果工作树路径位于 `.worktrees/`、`worktrees/` 或 `~/.config/superpowers/worktrees/` 下：** Superpower 创建了此工作树 — 我们拥有清理工作。

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git worktree remove "$WORKTREE_PATH"
git worktree prune  # Self-healing: clean up any stale registrations
```

**否则：** 主机环境（线束）拥有此工作区。不要将其移除。如果您的平台提供工作区退出工具，请使用它。否则，请将工作区保留在原处。

## 快速参考

|选项 |合并|推|保留工作树 |清理分行|
|--------|-------|------|---------------|----------------|
| 1.本地合并|是的 | - | - |是的 |
| 2.创建公关| - |是的 |是的 | - |
| 3. 保持原样| - | - |是的 | - |
| 4. 丢弃| - | - | - |是（强制）|

## 常见错误

**跳过测试验证**
- **问题：** 合并损坏的代码，创建失败的 PR
- **修复：** 在提供选项之前始终验证测试

**开放式问题**
- **问题：**“接下来我应该做什么？”含糊不清
- **修复：** 准确呈现 4 个结构化选项（或 3 个用于分离 HEAD）

**清理选项 2 的工作树**
- **问题：** 删除 PR 迭代的工作树用户需求
- **修复：** 仅清理选项 1 和 4

**删除工作树之前删除分支**
- **问题：** `git branch -d` 失败，因为工作树仍然引用分支
- **修复：** 先合并，删除工作树，然后删除分支

**运行 git worktree 从工作树内部删除**
- **问题：** 当 CWD 位于被删除的工作树内时，命令会无提示地失败
- **修复：**始终在`git worktree remove`之前`cd`到主存储库根目录

**清理线束拥有的工作树**
- **问题：** 删除线束创建的工作树会导致幻象状态
- **修复：** 仅清理 `.worktrees/`、`worktrees/` 或 `~/.config/superpowers/worktrees/` 下的工作树

**没有确认丢弃**
- **问题：** 意外删除工作
- **修复：** 需要输入“丢弃”确认

## 危险信号

**绝不：**
- 继续失败的测试
- 合并而不验证结果测试
- 删除作品而不确认
- 没有明确请求的强制推送
- 在确认合并成功之前删除工作树
- 清理不是您创建的工作树（出处检查）
- 从工作树内部运行`git worktree remove`

**总是：**
- 在提供选项之前验证测试
- 在呈现菜单之前检测环境
- 恰好提供 4 个选项（或 3 个用于分离 HEAD）
- 获取选项 4 的键入确认信息
- 仅清理选项 1 和 4 的工作树
- 在删除工作树之前 `cd` 到主存储库根目录
- 删除后运行`git worktree prune`
