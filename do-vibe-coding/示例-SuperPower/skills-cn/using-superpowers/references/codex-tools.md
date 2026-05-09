# 法典工具映射

技能使用 Claude Code 工具名称。当您在技能中遇到这些问题时，请使用您的平台等效项：

|技能参考|法典等效项 |
|-----------------|------------------|
| `Task`工具（调度子代理）| `spawn_agent`（请参阅[子代理调度需要多代理支持](#subagent-dispatch-requires-multi-agent-support)）|
|多个 `Task` 调用（并行）|多次 `spawn_agent` 通话 |
| Task 返回结果 | `wait_agent` |
| Task 自动完成 | `close_agent` 到空闲插槽 |
| `TodoWrite`（任务跟踪）| `update_plan` |
| `Skill`工具（调用技能）|技能本地加载 - 只需按照说明操作即可 |
| `Read`、`Write`、`Edit`（文件）|使用您的本机文件工具 |
| `Bash`（运行命令）|使用本机 shell 工具 |

## 子代理调度需要多代理支持

添加到您的 Codex 配置 (`~/.codex/config.toml`)：

```toml
[features]
multi_agent = true
```

这使得`spawn_agent`、`wait_agent` 和`close_agent` 能够获得`dispatching-parallel-agents` 和`subagent-driven-development` 等技能。

遗留说明：Codex 在`rust-v0.115.0` 暴露的衍生代理之前构建
正在等待`wait`。当前法典使用 `wait_agent` 作为衍生代理。这
`wait`名称现在属于代码模式`exec/wait`，它恢复了yield exec
细胞`cell_id`；它不是衍生代理结果工具。

## 环境检测

创建工作树或完成分支的技能应该检测它们的
继续之前具有只读 git 命令的环境：

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

- `GIT_DIR != GIT_COMMON` → 已经在链接的工作树中（跳过创建）
- `BRANCH` 空 → 分离 HEAD（无法从沙箱 branch/push/PR）

请参阅`using-git-worktrees` 步骤 0 和`finishing-a-development-branch`
第 1 步了解每种技能如何使用这些信号。

## Codex 应用程序整理

当沙箱阻止 branch/push 操作时（在一个
外部管理的工作树），代理提交所有工作并通知
用户使用应用程序的本机控件：

- **“创建分支”** — 命名分支，然后通过应用程序 UI commit/push/PR
- **“移交到本地”** — 将工作转移到用户的本地结帐处

代理仍然可以运行测试、暂存文件并输出建议的分支
供用户复制的名称、提交消息和 PR 描述。
