---
name: git-workflow
description: Git 工作流程模式包括分支策略、提交约定、合并与变基、冲突解决以及适合各种规模团队的协作开发最佳实践。origin: ECC
---
# Git 工作流程模式

Git 版本控制、分支策略和协作开发的最佳实践。

## 何时激活

- 为新项目设置 Git 工作流程
- 决定分支策略（GitFlow、基于主干、GitHub 流）
- 编写提交消息和 PR 描述
- 解决合并冲突
- 管理版本和版本标签
- 让新团队成员参与 Git 实践

## 分支策略

### GitHub Flow（简单，推荐给大多数人）

最适合持续部署和中小型团队。```
main (protected, always deployable)
  │
  ├── feature/user-auth      → PR → merge to main
  ├── feature/payment-flow   → PR → merge to main
  └── fix/login-bug          → PR → merge to main
```
**规则：**
- `main` 总是可部署的
- 从“main”创建功能分支
- 准备好审查时打开 Pull 请求
- 批准并 CI 通过后，合并到 `main`
- 合并后立即部署

### 基于主干的开发（高速团队）

最适合具有强大 CI/CD 和功能标志的团队。```
main (trunk)
  │
  ├── short-lived feature (1-2 days max)
  ├── short-lived feature
  └── short-lived feature
```
**规则：**
- 每个人都致力于“主要”或非常短暂的分支
- 功能标志隐藏未完成的工作
- CI必须在合并之前通过
- 每天部署多次

### GitFlow（复杂，发布周期驱动）

最适合预定版本和企业项目。```
main (production releases)
  │
  └── develop (integration branch)
        │
        ├── feature/user-auth
        ├── feature/payment
        │
        ├── release/1.0.0    → merge to main and develop
        │
        └── hotfix/critical  → merge to main and develop
```
**规则：**
- `main` 仅包含生产就绪代码
- `develop` 是集成分支
- 来自“develop”的功能分支，合并回“develop”
- 从“develop”发布分支，合并到“main”和“develop”
- 来自“main”的修补程序分支，合并到“main”和“develop”

### 何时使用哪个

|战略|团队规模|发布节奏 |最适合 |
|----------|----------|-----------------|----------|
| GitHub 流程 |任何 |连续 | SaaS、网络应用、初创公司 |
|基于主干 | 5+ 经验丰富 |多次/天 |高速团队，功能标志 |
| GitFlow | 10+ |预定|企业、受监管行业|

## 提交消息

### 常规提交格式```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```
### 类型

|类型 |用于 |示例|
|------|---------|---------|
| `壮举` |新功能 | `feat(auth)：添加 OAuth2 登录` |
| `修复` |错误修复 | `fix(api)：处理用户端点中的空响应` |
| `文档` |文档 | `文档（自述文件）：更新安装说明` |
| `风格` |格式化，无需更改代码 | `样式：修复登录组件中的缩进` |
| `重构` |代码重构 | `refactor(db)：将连接池提取到模块` |
| `测试` |添加/更新测试 | `test(auth)：添加用于令牌验证的单元测试` |
| `家务` |维护任务| `chore(deps)：更新依赖项` |
| `性能` |绩效提升| `perf(query)：向用户表添加索引` |
| `ci` | CI/CD 变化 | `ci：添加 PostgreSQL 服务来测试工作流程` |
| `恢复` |恢复之前的提交 | `恢复：恢复“feat(auth)：添加 OAuth2 登录”` |

### 好与坏的例子```
# BAD: Vague, no context
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "WIP"

# GOOD: Clear, specific, explains why
git commit -m "fix(api): retry requests on 503 Service Unavailable

The external API occasionally returns 503 errors during peak hours.
Added exponential backoff retry logic with max 3 attempts.

Closes #123"
```
### 提交消息模板

在仓库根目录中创建 `.gitmessage`：```
# <type>(<scope>): <subject>
# # Types: feat, fix, docs, style, refactor, test, chore, perf, ci, revert
# Scope: api, ui, db, auth, etc.
# Subject: imperative mood, no period, max 50 chars
#
# [optional body] - explain why, not what
# [optional footer] - Breaking changes, closes #issue
```
启用：`git config commit.template .gitmessage`

## 合并与变基

### 合并（保留历史记录）```bash
# Creates a merge commit
git checkout main
git merge feature/user-auth

# Result:
# *   merge commit
# |\
# | * feature commits
# |/
# * main commits
```
**使用时间：**
- 将功能分支合并到“main”中
- 您想保留准确的历史记录
- 多个人在该分支机构工作
- 该分支已被推送，其他人可能已经基于它进行了工作

### Rebase（线性历史）```bash
# Rewrites feature commits onto target branch
git checkout feature/user-auth
git rebase main

# Result:
# * feature commits (rewritten)
# * main commits
```
**使用时间：**
- 使用最新的“main”更新本地功能分支
- 你想要一个线性的、干净的历史
- 该分支仅限本地（不推送）
- 你是唯一在分行工作的人

### 变基工作流程```bash
# Update feature branch with latest main (before PR)
git checkout feature/user-auth
git fetch origin
git rebase origin/main

# Fix any conflicts
# Tests should still pass

# Force push (only if you're the only contributor)
git push --force-with-lease origin feature/user-auth
```
### 何时不需要变基```
# NEVER rebase branches that:
- Have been pushed to a shared repository
- Other people have based work on
- Are protected branches (main, develop)
- Are already merged

# Why: Rebase rewrites history, breaking others' work
```
## 拉取请求工作流程

### PR 标题格式```
<type>(<scope>): <description>

Examples:
feat(auth): add SSO support for enterprise users
fix(api): resolve race condition in order processing
docs(api): add OpenAPI specification for v2 endpoints
```
### PR 描述模板```markdown
## What

Brief description of what this PR does.

## Why

Explain the motivation and context.

## How

Key implementation details worth highlighting.

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)

Before/after screenshots for UI changes.

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Tests pass locally
- [ ] Related issues linked

Closes #123
```
### 代码审查清单

**对于审稿人：**

- [ ] 代码是否解决了所述问题？
- [ ] 是否有未处理的边缘情况？
- [ ] 代码是否可读且可维护？
- [ ] 是否有足够的测试？
- [ ] 是否存在安全问题？
- [ ] 提交历史记录是否干净（如果需要则压缩）？

**对于作者：**

- [ ] 请求审核前已完成自审
- [ ] CI 通过（测试、lint、类型检查）
- [ ] PR 大小合理（<500 行理想）
- [ ] 与单个功能/修复相关
- [ ] 描述清楚地解释了更改

## 冲突解决

### 识别冲突```bash
# Check for conflicts before merge
git checkout main
git merge feature/user-auth --no-commit --no-ff

# If conflicts, Git will show:
# CONFLICT (content): Merge conflict in src/auth/login.ts
# Automatic merge failed; fix conflicts and then commit the result.
```
### 解决冲突```bash
# See conflicted files
git status

# View conflict markers in file
# <<<<<<< HEAD
# content from main
# =======
# content from feature branch
# >>>>>>> feature/user-auth

# Option 1: Manual resolution
# Edit file, remove markers, keep correct content

# Option 2: Use merge tool
git mergetool

# Option 3: Accept one side
git checkout --ours src/auth/login.ts    # Keep main version
git checkout --theirs src/auth/login.ts  # Keep feature version

# After resolving, stage and commit
git add src/auth/login.ts
git commit
```
### 冲突预防策略```bash
# 1. Keep feature branches small and short-lived
# 2. Rebase frequently onto main
git checkout feature/user-auth
git fetch origin
git rebase origin/main

# 3. Communicate with team about touching shared files
# 4. Use feature flags instead of long-lived branches
# 5. Review and merge PRs promptly
```
## 分行管理

### 命名约定```
# Feature branches
feature/user-authentication
feature/JIRA-123-payment-integration

# Bug fixes
fix/login-redirect-loop
fix/456-null-pointer-exception

# Hotfixes (production issues)
hotfix/critical-security-patch
hotfix/database-connection-leak

# Releases
release/1.2.0
release/2024-01-hotfix

# Experiments/POCs
experiment/new-caching-strategy
poc/graphql-migration
```
### 分支清理```bash
# Delete local branches that are merged
git branch --merged main | grep -v "^\*\|main" | xargs -n 1 git branch -d

# Delete remote-tracking references for deleted remote branches
git fetch -p

# Delete local branch
git branch -d feature/user-auth  # Safe delete (only if merged)
git branch -D feature/user-auth  # Force delete

# Delete remote branch
git push origin --delete feature/user-auth
```
### 存储工作流程```bash
# Save work in progress
git stash push -m "WIP: user authentication"

# List stashes
git stash list

# Apply most recent stash
git stash pop

# Apply specific stash
git stash apply stash@{2}

# Drop stash
git stash drop stash@{0}
```
## 发布管理

### 语义版本控制```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes
MINOR: New features, backward compatible
PATCH: Bug fixes, backward compatible

Examples:
1.0.0 → 1.0.1 (patch: bug fix)
1.0.1 → 1.1.0 (minor: new feature)
1.1.0 → 2.0.0 (major: breaking change)
```
### 创建版本```bash
# Create annotated tag
git tag -a v1.2.0 -m "Release v1.2.0

Features:
- Add user authentication
- Implement password reset

Fixes:
- Resolve login redirect issue

Breaking Changes:
- None"

# Push tag to remote
git push origin v1.2.0

# List tags
git tag -l

# Delete tag
git tag -d v1.2.0
git push origin --delete v1.2.0
```
### 变更日志生成```bash
# Generate changelog from commits
git log v1.1.0..v1.2.0 --oneline --no-merges

# Or use conventional-changelog
npx conventional-changelog -i CHANGELOG.md -s
```
## Git 配置

### 基本配置```bash
# User identity
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Default branch name
git config --global init.defaultBranch main

# Pull behavior (rebase instead of merge)
git config --global pull.rebase true

# Push behavior (push current branch only)
git config --global push.default current

# Auto-correct typos
git config --global help.autocorrect 1

# Better diff algorithm
git config --global diff.algorithm histogram

# Color output
git config --global color.ui auto
```
### 有用的别名```bash
# Add to ~/.gitconfig
[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --oneline --graph --all
    amend = commit --amend --no-edit
    wip = commit -m "WIP"
    undo = reset --soft HEAD~1
    contributors = shortlog -sn
```
### Gitignore 模式```gitignore
# Dependencies
node_modules/
vendor/

# Build outputs
dist/
build/
*.o
*.exe

# Environment files
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Test coverage
coverage/

# Cache
.cache/
*.tsbuildinfo
```
## 常见工作流程

### 开始新功能```bash
# 1. Update main branch
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/user-auth

# 3. Make changes and commit
git add .
git commit -m "feat(auth): implement OAuth2 login"

# 4. Push to remote
git push -u origin feature/user-auth

# 5. Create Pull Request on GitHub/GitLab
```
### 使用新更改更新 PR```bash
# 1. Make additional changes
git add .
git commit -m "feat(auth): add error handling"

# 2. Push updates
git push origin feature/user-auth
```
### 将 Fork 与上游同步```bash
# 1. Add upstream remote (once)
git remote add upstream https://github.com/original/repo.git

# 2. Fetch upstream
git fetch upstream

# 3. Merge upstream/main into your main
git checkout main
git merge upstream/main

# 4. Push to your fork
git push origin main
```
### 纠正错误```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Undo last commit pushed to remote
git revert HEAD
git push origin main

# Undo specific file changes
git checkout HEAD -- path/to/file

# Fix last commit message
git commit --amend -m "New message"

# Add forgotten file to last commit
git add forgotten-file
git commit --amend --no-edit
```
## Git 钩子

### 预提交挂钩```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run linting
npm run lint || exit 1

# Run tests
npm test || exit 1

# Check for secrets
if git diff --cached | grep -E '(password|api_key|secret)'; then
    echo "Possible secret detected. Commit aborted."
    exit 1
fi
```
### 预推钩```bash
#!/bin/bash
# .git/hooks/pre-push

# Run full test suite
npm run test:all || exit 1

# Check for console.log statements
if git diff origin/main | grep -E 'console\.log'; then
    echo "Remove console.log statements before pushing."
    exit 1
fi
```
## 反模式```
# BAD: Committing directly to main
git checkout main
git commit -m "fix bug"

# GOOD: Use feature branches and PRs

# BAD: Committing secrets
git add .env  # Contains API keys

# GOOD: Add to .gitignore, use environment variables

# BAD: Giant PRs (1000+ lines)
# GOOD: Break into smaller, focused PRs

# BAD: "Update" commit messages
git commit -m "update"
git commit -m "fix"

# GOOD: Descriptive messages
git commit -m "fix(auth): resolve redirect loop after login"

# BAD: Rewriting public history
git push --force origin main

# GOOD: Use revert for public branches
git revert HEAD

# BAD: Long-lived feature branches (weeks/months)
# GOOD: Keep branches short (days), rebase frequently

# BAD: Committing generated files
git add dist/
git add node_modules/

# GOOD: Add to .gitignore
```
## 快速参考

|任务|命令|
|------|---------|
| Create branch | `git checkout -b 功能/名称` |
| Switch branch | `git checkout 分支名称` |
| Delete branch | `git 分支 -d 分支名称` |
| Merge branch | `git merge 分支名称` |
| Rebase branch | `git rebase main` |
| View history | `git log --oneline --graph` |
| View changes | `git diff` |
| Stage changes | `git add .` 或 `git add -p` |
| Commit | `git commit -m "消息"` |
|推| `git Push 原点分支名称` |
|拉| `git pull origin 分支名称` |
|藏匿| `git stash push -m "消息"` |
| Undo last commit | `git reset --soft HEAD~1` |
| Revert commit | `git revert HEAD` |