---
name: github-ops
description: GitHub 存储库操作、自动化和管理。使用 gh CLI 进行问题分类、PR 管理、CI/CD 操作、发布管理和安全监控。当用户想要管理 GitHub 问题、PR、CI 状态、版本、贡献者、过时项目或除简单 git 命令之外的任何 GitHub 操作任务时使用。origin: ECC
---
# GitHub 运营

管理 GitHub 存储库，重点关注社区健康、CI 可靠性和贡献者体验。

## 何时激活

- Triaging issues (classifying, labeling, responding, deduplicating)
- Managing PRs (review status, CI checks, stale PRs, merge readiness)
- 调试 CI/CD 故障
- 准备发布和变更日志
- 监控 Dependabot 和安全警报
- 管理开源项目的贡献者经验
- User says "check GitHub", "triage issues", "review PRs", "merge", "release", "CI is broken"

## 工具要求

- **gh CLI** 适用于所有 GitHub API 操作
- 通过“gh auth login”配置存储库访问

## 问题分类

按类型和优先级对每个问题进行分类：

**类型：** bug、功能请求、问题、文档、增强、重复、无效、良好优先问题

**Priority:** critical (breaking/security), high (significant impact), medium (nice to have), low (cosmetic)

### 分类工作流程

1. 阅读问题标题、正文和评论
2. Check if it duplicates an existing issue (search by keywords)
3. 通过 `gh issues edit --add-label` 应用适当的标签
4. 对于问题：起草并发布有用的回复5. 对于需要更多信息的错误：询问重现步骤
6. 对于good-first-issue：添加“good-first-issue”标签
7. 对于重复项：评论中包含原始链接，添加“重复”标签```bash
# Search for potential duplicates
gh issue list --search "keyword" --state all --limit 20

# Add labels
gh issue edit <number> --add-label "bug,high-priority"

# Comment on issue
gh issue comment <number> --body "Thanks for reporting. Could you share reproduction steps?"
```
## 公关管理

### 审核清单

1. 检查 CI 状态：`gh pr 检查 <number>`
2. 检查是否可合并：`gh pr view <number> --json mergeable`
3. 检查年龄和最近的活动
4. 标记 PR 超过 5 天且无需审核
5. 对于社区 PR：确保他们经过测试并遵循惯例

### 过时的政策

- 14 天以上没有活动的问题：添加“陈旧”标签，评论要求更新
- 7 天以上没有活动的 PR：评论询问是否仍然活跃
- 30 天后无响应自动关闭过时问题（添加“已关闭过时”标签）```bash
# Find stale issues (no activity in 14+ days)
gh issue list --label "stale" --state open

# Find PRs with no recent activity
gh pr list --json number,title,updatedAt --jq '.[] | select(.updatedAt < "2026-03-01")'
```
## CI/CD 操作

当 CI 失败时：

1. 检查工作流程运行：`gh run view <run-id> --log-failed`
2. 找出失败的步骤
3. 检查这是一个不稳定的测试还是真正的失败
4. 对于真正的故障：找出根本原因并提出修复建议
5. 对于片状测试：记下未来调查的模式```bash
# List recent failed runs
gh run list --status failure --limit 10

# View failed run logs
gh run view <run-id> --log-failed

# Re-run a failed workflow
gh run rerun <run-id> --failed
```
## 发布管理

准备发布时：

1.检查main上所有CI都是绿色的
2. 查看未发布的更改： `gh pr list --state merged --base main`
3. 从 PR 标题生成变更日志
4. 创建版本：`gh release create````bash
# List merged PRs since last release
gh pr list --state merged --base main --search "merged:>2026-03-01"

# Create a release
gh release create v1.2.0 --title "v1.2.0" --generate-notes

# Create a pre-release
gh release create v1.3.0-rc1 --prerelease --title "v1.3.0 Release Candidate 1"
```
## 安全监控```bash
# Check Dependabot alerts
gh api repos/{owner}/{repo}/dependabot/alerts --jq '.[].security_advisory.summary'

# Check secret scanning alerts
gh api repos/{owner}/{repo}/secret-scanning/alerts --jq '.[].state'

# Review and auto-merge safe dependency bumps
gh pr list --label "dependencies" --json number,title
```
- 审查并自动合并安全依赖冲突
- 立即标记任何严重/高严重性警报
- 至少每周检查新的 Dependabot 警报

## 质量门

在完成任何 GitHub 操作任务之前：
- 所有分类问题都有适当的标签
- 没有超过 7 天且未经审查或评论的 PR
- CI 故障已被调查（不仅仅是重新运行）
- 版本包含准确的变更日志
- 安全警报得到确认和跟踪