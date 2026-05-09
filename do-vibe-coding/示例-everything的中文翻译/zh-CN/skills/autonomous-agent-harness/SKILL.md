---
name: autonomous-agent-harness
description: 将 Claude Code 转变为具有持久内存、计划操作、计算机使用和任务队列的完全自主代理系统。通过利用 Claude Code 的本机 cron、调度、MCP 工具和内存来替换独立代理框架（Hermes、AutoGPT）。当用户需要连续自主操作、计划任务或自引导代理循环时使用。origin: ECC
---
# 自主代理线束

仅使用本机功能和 MCP 服务器将 Claude Code 转变为持久的、自我导向的代理系统。

## 同意和安全边界

自主操作必须由用户明确请求并确定范围。请勿创建计划、调度远程代理、写入持久内存、使用计算机控制、外部发布、修改第三方资源或对私人通信进行操作，除非用户已批准该功能和当前设置的目标工作区。

在启用重复或事件驱动的操作之前，首选试运行计划和本地队列文件。将凭证、私有工作区导出、个人数据集和特定于帐户的自动化保留在可重用 ECC 工件之外。

## 何时激活

- 用户想要一个连续运行或按计划运行的代理
- 设置定期触发的自动化工作流程
- 构建一个可以记住跨会话上下文的个人人工智能助理
- 用户说“每天运行这个”，“定期检查这个”，“继续监控”
- 想要复制 Hermes、AutoGPT 或类似自主代理框架的功能
- 需要使用计算机并结合计划执行＃＃ 建筑学```
┌──────────────────────────────────────────────────────────────┐
│                    Claude Code Runtime                        │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  Crons   │  │ Dispatch │  │ Memory   │  │ Computer    │ │
│  │ Schedule │  │ Remote   │  │ Store    │  │ Use         │ │
│  │ Tasks    │  │ Agents   │  │          │  │             │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │
│       │              │             │                │        │
│       ▼              ▼             ▼                ▼        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              ECC Skill + Agent Layer                  │    │
│  │                                                      │    │
│  │  skills/     agents/     commands/     hooks/        │    │
│  └──────────────────────────────────────────────────────┘    │
│       │              │             │                │        │
│       ▼              ▼             ▼                ▼        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              MCP Server Layer                        │    │
│  │                                                      │    │
│  │  memory    github    exa    supabase    browser-use  │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```
## 核心组件

### 1. 持久内存

使用通过 MCP 内存服务器增强的 Claude Code 内置内存系统来存储结构化数据。

**内置内存** (`~/.claude/projects/*/memory/`):
- 用户偏好、反馈、项目背景
- 存储为带有 frontmatter 的 markdown 文件
- 在会话开始时自动加载

**MCP内存服务器**（结构化知识图）：
- 实体、关系、观察
- 可查询的图结构
- 跨会话持久性

**记忆模式：**```
# Short-term: current session context
Use TodoWrite for in-session task tracking

# Medium-term: project memory files
Write to ~/.claude/projects/*/memory/ for cross-session recall

# Long-term: MCP knowledge graph
Use mcp__memory__create_entities for permanent structured data
Use mcp__memory__create_relations for relationship mapping
Use mcp__memory__add_observations for new facts about known entities
```
### 2. 计划操作（Cron）

使用 Claude Code 的计划任务来创建重复代理操作。

**设置 cron：**```
# Via MCP tool
mcp__scheduled-tasks__create_scheduled_task({
  name: "daily-pr-review",
  schedule: "0 9 * * 1-5",  # 9 AM weekdays
  prompt: "Review all open PRs in affaan-m/everything-claude-code. For each: check CI status, review changes, flag issues. Post summary to memory.",
  project_dir: "/path/to/repo"
})

# Via claude -p (programmatic mode)
echo "Review open PRs and summarize" | claude -p --project /path/to/repo
```
**有用的 cron 模式：**

|图案|日程 |使用案例|
|---------|----------|----------|
|每日站立| `0 9 * * 1-5` |查看 PR、问题、部署状态 |
|每周回顾 | `0 10 * * 1` |代码质量指标、测试覆盖率 |
|每小时监控| `0 * * * *` |生产健康状况、错误率检查 |
|每晚构建 | `0 2 * * *` |运行完整的测试套件、安全扫描 |
|会前| `*/30 * * * *` |为即将举行的会议准备背景|

### 3. 调度/远程代理

远程触发 Claude Code 代理以实现事件驱动的工作流程。

**调度模式：**```bash
# Trigger from CI/CD
curl -X POST "https://api.anthropic.com/dispatch" \
  -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
  -d '{"prompt": "Build failed on main. Diagnose and fix.", "project": "/repo"}'

# Trigger from webhook
# GitHub webhook → dispatch → Claude agent → fix → PR

# Trigger from another agent
claude -p "Analyze the output of the security scan and create issues for findings"
```
### 4. 计算机使用

利用 Claude 的计算机使用 MCP 进行物理世界交互。

**能力：**
- 浏览器自动化（导航、单击、填写表格、屏幕截图）
- 桌面控制（打开应用程序、键入、鼠标控制）
- CLI 之外的文件系统操作

**线束内的用例：**
- Web UI 的自动化测试
- 表格填写和数据输入
- 基于屏幕截图的监控
- 多应用程序工作流程

### 5.任务队列

管理在会话边界内存活的持久任务队列。

**执行：**```
# Task persistence via memory
Write task queue to ~/.claude/projects/*/memory/task-queue.md

# Task format
---
name: task-queue
type: project
description: Persistent task queue for autonomous operation
---

## Active Tasks
- [ ] PR #123: Review and approve if CI green
- [ ] Monitor deploy: check /health every 30 min for 2 hours
- [ ] Research: Find 5 leads in AI tooling space

## Completed
- [x] Daily standup: reviewed 3 PRs, 2 issues
```
## 取代赫尔墨斯

| Hermes 组件 | ECC 等效 |如何|
|------------------|-------------|-----|
|网关/路由器 |克劳德代码调度 + crons |计划任务触发代理会话 |
|内存系统|克劳德内存+MCP内存服务器|内置持久化+知识图谱|
|工具注册表| MCP 服务器 |动态加载工具提供者|
|编排| ECC技能+代理商|技能定义直接代理行为|
|电脑使用 |计算机使用MCP |本机浏览器和桌面控制|
|上下文管理器|会话管理+内存| ECC 2.0 会话生命周期 |
|任务队列 |内存持久任务列表| TodoWrite + 内存文件 |

## 设置指南

### 第 1 步：配置 MCP 服务器

确保这些位于“~/.claude.json”中：```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic/memory-mcp-server"]
    },
    "scheduled-tasks": {
      "command": "npx",
      "args": ["-y", "@anthropic/scheduled-tasks-mcp-server"]
    },
    "computer-use": {
      "command": "npx",
      "args": ["-y", "@anthropic/computer-use-mcp-server"]
    }
  }
}
```
### 第 2 步：创建基本 Cron```bash
# Daily morning briefing
claude -p "Create a scheduled task: every weekday at 9am, review my GitHub notifications, open PRs, and calendar. Write a morning briefing to memory."

# Continuous learning
claude -p "Create a scheduled task: every Sunday at 8pm, extract patterns from this week's sessions and update the learned skills."
```
### 步骤 3：初始化内存图```bash
# Bootstrap your identity and context
claude -p "Create memory entities for: me (user profile), my projects, my key contacts. Add observations about current priorities."
```
### 步骤 4：启用计算机使用（可选）

授予计算机使用的 MCP 浏览器和桌面控制所需的权限。

## 工作流程示例

### 自主公关审核员```
Cron: every 30 min during work hours
1. Check for new PRs on watched repos
2. For each new PR:
   - Pull branch locally
   - Run tests
   - Review changes with code-reviewer agent
   - Post review comments via GitHub MCP
3. Update memory with review status
```
### 个人研究代理```
Cron: daily at 6 AM
1. Check saved search queries in memory
2. Run Exa searches for each query
3. Summarize new findings
4. Compare against yesterday's results
5. Write digest to memory
6. Flag high-priority items for morning review
```
### 会议准备代理```
Trigger: 30 min before each calendar event
1. Read calendar event details
2. Search memory for context on attendees
3. Pull recent email/Slack threads with attendees
4. Prepare talking points and agenda suggestions
5. Write prep doc to memory
```
## 约束条件

- Cron 任务在隔离会话中运行 - 它们不与交互式会话共享上下文，除非通过内存。
- 计算机使用需要明确的许可授予。不要假设有访问权限。
- 远程调度可能有速率限制。以适当的间隔设计 cron。
- 内存文件应保持简洁。归档旧数据而不是让文件无限增长。
- 始终验证计划任务是否成功完成。将错误处理添加到 cron 提示。