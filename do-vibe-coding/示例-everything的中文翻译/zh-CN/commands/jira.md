---
description: 检索 Jira 票证、分析需求、更新状态或添加评论。使用 jira 集成技能和 MCP 或 REST API。---
# 吉拉命令

直接从您的工作流程中与 Jira 票证进行交互 — 获取票证、分析需求、添加评论和转换状态。

＃＃ 用法```
/jira get <TICKET-KEY>          # Fetch and analyze a ticket
/jira comment <TICKET-KEY>      # Add a progress comment
/jira transition <TICKET-KEY>   # Change ticket status
/jira search <JQL>              # Search issues with JQL
```
## 该命令的作用

1. **获取和分析** — 获取 Jira 票证并提取需求、验收标准、测试场景和依赖项
2. **评论** — 向工单添加结构化进度更新
3. **转换** — 在工作流程状态之间移动工单（待办事项 → 进行中 → 完成）
4. **搜索** — 使用 JQL 查询查找问题

## 它是如何工作的

### `/jira 获取 <TICKET-KEY>`

1. 从 Jira 获取票证（通过 MCP `jira_get_issue` 或 REST API）
2. 提取所有字段：摘要、描述、验收标准、优先级、标签、链接问题
3. 可选择获取附加上下文的评论
4. 进行结构化分析：```
Ticket: PROJ-1234
Summary: [title]
Status: [status]
Priority: [priority]
Type: [Story/Bug/Task]

Requirements:
1. [extracted requirement]
2. [extracted requirement]

Acceptance Criteria:
- [ ] [criterion from ticket]

Test Scenarios:
- Happy Path: [description]
- Error Case: [description]
- Edge Case: [description]

Dependencies:
- [linked issues, APIs, services]

Recommended Next Steps:
- /plan to create implementation plan
- `tdd-workflow` skill to implement with tests first
```
### `/jira 评论 <TICKET-KEY>`

1. 总结当前会话进度（构建、测试、提交的内容）
2.格式化为结构化评论
3. 发布到 Jira 工单

### `/jira 转换 <TICKET-KEY>`

1. 获取工单的可用转场
2.向用户显示选项
3. 执行选定的转换

### `/jira 搜索 <JQL>`

1. 对Jira执行JQL查询
2.返回匹配问题的汇总表

## 先决条件

此命令需要 Jira 凭据。选择一项：

**选项 A — MCP 服务器（推荐）：**
将“jira”添加到“mcpServers”配置中（有关模板，请参阅“mcp-configs/mcp-servers.json”）。

**选项 B — 环境变量：**```bash
export JIRA_URL="https://yourorg.atlassian.net"
export JIRA_EMAIL="your.email@example.com"
export JIRA_API_TOKEN="your-api-token"
```
如果缺少凭据，请停止并指导用户进行设置。

## 与其他命令集成

分析票证后：
- 使用“/plan”根据需求创建实施计划
- 使用“tdd-workflow”技能来实施测试驱动开发
- 实施后使用“/code-review”
- 使用“/jira comment”将进度发布回工单
- 工作完成后使用“/jiratransition”移动工单

## 相关

- **技能：** `技能/jira-integration/`
- **MCP 配置：** `mcp-configs/mcp-servers.json` → `jira`