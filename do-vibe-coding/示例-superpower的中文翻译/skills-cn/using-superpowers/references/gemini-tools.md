# Gemini CLI 工具映射

技能使用 Claude Code 工具名称。当您在技能中遇到这些问题时，请使用您的平台等效项：

|技能参考| Gemini CLI 等效项 |
|-----------------|----------------------|
| `Read`（文件读取）| `read_file` |
| `Write`（文件创建）| `write_file` |
| `Edit`（文件编辑）| `replace` |
| `Bash`（运行命令）| `run_shell_command` |
| `Grep`（搜索文件内容）| `grep_search` |
| `Glob`（按名称搜索文件）| `glob` |
| `TodoWrite`（任务跟踪）| `write_todos` |
| `Skill`工具（调用技能）| `activate_skill` |
| `WebSearch` | `google_web_search` |
| `WebFetch` | `web_fetch` |
| `Task`工具（调度子代理）| `@agent-name`（请参阅[子代理支持](#subagent-support)）|

## 子代理支持

Gemini CLI 通过 `@` 语法原生支持子代理。使用内置的 `@generalist` 代理来分派任何任务 - 它可以访问所有工具并遵循您提供的提示。

当技能要求分派指定代理类型时，请使用 `@generalist` 以及技能提示模板中的完整提示：

|技能指导| Gemini CLI 等效项 |
|-------------------|----------------------|
| `Task tool (superpowers:implementer)` | `@generalist` 与填充的 `implementer-prompt.md` 模板 |
| `Task tool (superpowers:spec-reviewer)` | `@generalist` 与填充的 `spec-reviewer-prompt.md` 模板 |
| `Task tool (superpowers:code-reviewer)` | `@code-reviewer`（捆绑代理）或`@generalist` 并填写审核提示 |
| `Task tool (superpowers:code-quality-reviewer)` | `@generalist` 与填充的 `code-quality-reviewer-prompt.md` 模板 |
| `Task tool (general-purpose)` 带内嵌提示 | `@generalist` 以及您的内嵌提示 |

### 及时填写

技能提供带有占位符的提示模板，例如 `{WHAT_WAS_IMPLEMENTED}` 或 `[FULL TEXT of task]`。填写所有占位符并将完整提示作为消息传递给`@generalist`。提示模板本身包含代理的角色、审核标准和预期输出格式 - `@generalist` 将遵循它。

### 并行调度

Gemini CLI 支持并行子代理调度。当技能要求您并行分派多个独立的子代理任务时，请在同一提示中一起请求所有这些 `@generalist` 或命名子代理任务。保持相关任务的顺序，但不要仅仅为了保留更简单的历史记录而序列化独立的子代理任务。

## 其他 Gemini CLI 工具

这些工具在 Gemini CLI 中可用，但没有等效的 Claude Code：

|工具|目的|
|------|---------|
| `list_directory` |列出文件和子目录 |
| `save_memory` |跨会话将事实保留到 GEMINI.md |
| `ask_user` |请求用户结构化输入 |
| `tracker_create_task` |丰富的任务管理（创建、更新、列表、可视化）|
| `enter_plan_mode` / `exit_plan_mode` |进行更改之前切换到只读研究模式 |
