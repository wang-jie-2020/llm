---
name: jira-integration
description: 在检索 Jira 票证、分析需求、更新票证状态、添加评论或转换问题时使用此技能。通过 MCP 或直接 REST 调用提供 Jira API 模式。origin: ECC
---
# Jira 整合技能

直接从您的 AI 编码工作流程检索、分析和更新 Jira 票证。支持**基于 MCP**（推荐）和**直接 REST API** 方法。

## 何时激活

- 获取 Jira 票证以了解要求
- 从工单中提取可测试的验收标准
- 向 Jira 问题添加进度注释
- 转换工单状态（待办事项 → 进行中 → 已完成）
- 将合并请求或分支链接到 Jira 问题
- 通过JQL查询搜索问题

## 先决条件

### 选项 A：MCP 服务器（推荐）

安装“mcp-atlassian”MCP 服务器。这会将 Jira 工具直接暴露给您的 AI 代理。

**要求：**
-Python 3.10+
- `uvx`（来自 `uv`），通过包管理器或官方 `uv` 安装文档安装

**添加到您的 MCP 配置**（例如 `~/.claude.json` → `mcpServers`）：```json
{
  "jira": {
    "command": "uvx",
    "args": ["mcp-atlassian==0.21.0"],
    "env": {
      "JIRA_URL": "https://YOUR_ORG.atlassian.net",
      "JIRA_EMAIL": "your.email@example.com",
      "JIRA_API_TOKEN": "your-api-token"
    },
    "description": "Jira issue tracking — search, create, update, comment, transition"
  }
}
```
> **安全性：** 切勿对秘密进行硬编码。最好在系统环境（或机密管理器）中设置“JIRA_URL”、“JIRA_EMAIL”和“JIRA_API_TOKEN”。仅将 MCP `env` 块用于本地未提交的配置文件。

**要获取 Jira API 令牌：**
1. 前往<https://id.atlassian.com/manage-profile/security/api-tokens>
2.点击**创建API令牌**
3. 复制令牌——将其存储在您的环境中，而不是源代码中

### 选项 B：直接 REST API

如果 MCP 不可用，请直接通过“curl”或帮助程序脚本使用 Jira REST API v3。

**所需环境变量：**

|变量|描述 |
|----------|-------------|
| `JIRA_URL` |您的 Jira 实例 URL（例如“https://yourorg.atlassian.net”）|
| `JIRA_EMAIL` |您的 Atlassian 帐户电子邮件 |
| `JIRA_API_TOKEN` |来自 id.atlassian.com 的 API 令牌 |

将它们存储在您的 shell 环境、秘密管理器或未跟踪的本地环境文件中。不要将它们提交到存储库。

## MCP 工具参考

配置“mcp-atlassian”MCP 服务器后，可以使用以下工具：

|工具|目的|示例|
|------|---------|---------|
| `jira_search` | JQL 查询 | `项目=项目并且状态=“进行中”` || `jira_get_issue` |按键获取完整问题详细信息 | `项目-1234` |
| `jira_create_issue` |创建问题（任务、Bug、故事、史诗）|新错误报告 |
| `jira_update_issue` |更新字段（摘要、描述、受让人）|变更受让人 |
| `jira_transition_issue` |更改状态 |移至“审核中”|
| `jira_add_comment` |添加评论 |进度更新 |
| `jira_get_sprint_issues` |列出冲刺中的问题 |积极的冲刺回顾|
| `jira_create_issue_link` |链接问题（块、涉及）|依赖性跟踪 |
| `jira_get_issue_development_info` |查看链接的 PR、分支、提交 |开发环境 |

> **提示：** 在转换之前始终调用 `jira_get_transitions` — 转换 ID 因项目工作流程而异。

## 直接 REST API 参考

### 取票```bash
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234" | jq '{
    key: .key,
    summary: .fields.summary,
    status: .fields.status.name,
    priority: .fields.priority.name,
    type: .fields.issuetype.name,
    assignee: .fields.assignee.displayName,
    labels: .fields.labels,
    description: .fields.description
  }'
```
### 获取评论```bash
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234?fields=comment" | jq '.fields.comment.comments[] | {
    author: .author.displayName,
    created: .created[:10],
    body: .body
  }'
```
### 添加评论```bash
curl -s -X POST -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "version": 1,
      "type": "doc",
      "content": [{
        "type": "paragraph",
        "content": [{"type": "text", "text": "Your comment here"}]
      }]
    }
  }' \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234/comment"
```
### 转换票证```bash
# 1. Get available transitions
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234/transitions" | jq '.transitions[] | {id, name: .name}'

# 2. Execute transition (replace TRANSITION_ID)
curl -s -X POST -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transition": {"id": "TRANSITION_ID"}}' \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234/transitions"
```
### 使用 JQL 搜索```bash
curl -s -G -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  --data-urlencode "jql=project = PROJ AND status = 'In Progress'" \
  "$JIRA_URL/rest/api/3/search"
```
## 分析工单

检索开发或测试自动化的票证时，提取：

### 1. 可测试的要求
- **功能要求** — 该功能的用途
- **验收标准** — 必须满足的条件
- **可测试的行为** — 具体行动和预期结果
- **用户角色** — 谁使用此功能及其权限
- **数据要求** — 需要哪些数据
- **集成点** — 涉及的 API、服务或系统

### 2. 所需的测试类型
- **单元测试** — 单独的功能和实用程序
- **集成测试** — API 端点和服务交互
- **E2E 测试** — 面向用户的 UI 流程
- **API 测试** — 端点合约和错误处理

### 3. 边缘情况和错误场景
- 无效输入（空、太长、特殊字符）
- 未经授权的访问
- 网络故障或超时
- 并发用户或竞争条件
- 边界条件
- 数据缺失或为空
- 状态转换（后退导航、刷新等）

### 4. 结构化分析输出```
Ticket: PROJ-1234
Summary: [ticket title]
Status: [current status]
Priority: [High/Medium/Low]
Test Types: Unit, Integration, E2E

Requirements:
1. [requirement 1]
2. [requirement 2]

Acceptance Criteria:
- [ ] [criterion 1]
- [ ] [criterion 2]

Test Scenarios:
- Happy Path: [description]
- Error Case: [description]
- Edge Case: [description]

Test Data Needed:
- [data item 1]
- [data item 2]

Dependencies:
- [dependency 1]
- [dependency 2]
```
## 更新门票

### 何时更新

|工作流程步骤|吉拉更新 |
|---|---|
|开始工作 |过渡到“进行中” |
|测试编写 |评论测试覆盖率摘要 |
|已创建分支 |评论带有分支名称 |
|已创建 PR/MR |带链接评论，链接问题 |
|测试通过 |评论结果摘要 |
| PR/MR 合并 |过渡到“完成”或“审核中”|

### 评论模板

**开始工作：**```
Starting implementation for this ticket.
Branch: feat/PROJ-1234-feature-name
```
**实施的测试：**```
Automated tests implemented:

Unit Tests:
- [test file 1] — [what it covers]
- [test file 2] — [what it covers]

Integration Tests:
- [test file] — [endpoints/flows covered]

All tests passing locally. Coverage: XX%
```
**公关创建：**```
Pull request created:
[PR Title](https://github.com/org/repo/pull/XXX)

Ready for review.
```
**工作完成：**```
Implementation complete.

PR merged: [link]
Test results: All passing (X/Y)
Coverage: XX%
```
## 安全指南

- **切勿在源代码或技能文件中硬编码** Jira API 令牌
- **始终使用**环境变量或秘密管理器
- **将`.env`**添加到每个项目中的`.gitignore`
- **如果在 git 历史记录中暴露，则立即轮换令牌**
- **使用最低权限** API 令牌，范围仅限于所需项目
- **验证**在进行 API 调用之前是否已设置凭据 — 快速失败并显示明确的消息

## 故障排除

|错误 |原因 |修复 |
|---|---|---|
| `401 未经授权` | API 令牌无效或过期 |在 id.atlassian.com 重新生成 |
| `403 禁止` | Token缺少项目权限 |检查令牌范围和项目访问权限 |
| `404 未找到` |错误的票证密钥或基本 URL |验证“JIRA_URL”和票证密钥 |
| `生成 uvx ENOENT` | IDE 在 PATH 上找不到 `uvx` |使用完整路径（例如`~/.local/bin/uvx`）或在`~/.zprofile`中设置PATH |
|连接超时 |网络/VPN 问题 |检查 VPN 连接和防火墙规则 |

## 最佳实践

- 随时更新 Jira，而不是最后一次全部更新
- 保持评论简洁但内容丰富
- 链接而不是复制——指向 PR、测试报告和仪表板
- 如果您需要其他人的意见，请使用@mentions- 在开始之前检查链接的问题以了解完整的功能范围
- 如果验收标准模糊，请在编写代码之前要求澄清