# Copilot CLI 工具映射

技能使用 Claude Code 工具名称。当您在技能中遇到这些问题时，请使用您的平台等效项：

|技能参考|副驾驶 CLI 等效项 |
|-----------------|----------------------|
| `Read`（文件读取）| `view` |
| `Write`（文件创建）| `create` |
| `Edit`（文件编辑）| `edit` |
| `Bash`（运行命令）| `bash` |
| `Grep`（搜索文件内容）| `grep` |
| `Glob`（按名称搜索文件）| `glob` |
| `Skill`工具（调用技能）| `skill` |
| `WebFetch` | `web_fetch` |
| `Task`工具（调度子代理）| `task` 与 `agent_type: "general-purpose"` 或 `"explore"` |
|多个 `Task` 调用（并行）|多次 `task` 通话 |
| Task status/output | `read_agent`、`list_agents` |
| `TodoWrite`（任务跟踪）| `sql` 带有内置 `todos` 表 |
| `WebSearch` |没有等效项 — 使用`web_fetch` 和搜索引擎 URL |
| `EnterPlanMode` / `ExitPlanMode` |没有同等内容 - 留在主会议 |

## 异步 shell 会话

Copilot CLI 支持持久异步 shell 会话，该会话没有直接的 Claude Code 等效项：

|工具|目的|
|------|---------|
| `bash` 与 `async: true` |在后台启动长时间运行的命令 |
| `write_bash` |将输入发送到正在运行的异步会话 |
| `read_bash` | Read 异步会话的输出 |
| `stop_bash` |终止异步会话 |
| `list_bash` |列出所有活动的 shell 会话 |

## 其他 Copilot CLI 工具

|工具|目的|
|------|---------|
| `store_memory` |为未来的会话保留有关代码库的事实 |
| `report_intent` |根据当前意图更新 UI 状态行 |
| `sql` |查询会话的 SQLite 数据库（todos、元数据） |
| `fetch_copilot_cli_documentation` |查找 Copilot CLI 文档 |
| GitHub MCP 工具 (`github-mcp-server-*`) |本机 GitHub API 访问（问题、PR、代码搜索）|
