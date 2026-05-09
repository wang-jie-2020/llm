---
description: 获取有关 hookify 系统的帮助---
显示全面的 hookify 文档。

## Hook 系统概述

Hookify 创建与 Claude Code 的钩子系统集成的规则文件，以防止不需要的行为。

### 事件类型

- `bash`：触发 Bash 工具的使用并匹配命令模式
- `file`：在使用写入/编辑工具时触发并匹配文件路径
- `stop`：会话结束时触发
- `prompt`：在用户消息提交时触发并匹配输入模式
- `all`：触发所有事件

### 规则文件格式

文件存储为 `.claude/hookify.{name}.local.md`：```yaml
---
name: descriptive-name
enabled: true
event: bash|file|stop|prompt|all
action: block|warn
pattern: "regex pattern to match"
---
Message to display when rule triggers.
Supports multiple lines.
```
### 命令

- `/hookify [description]` 创建新规则并在未给出描述时自动分析对话
- `/hookify-list` 列出配置的规则
- `/hookify-configure` 打开或关闭规则

### 图案提示

- 使用正则表达式语法
- 对于“bash”，与完整命令字符串匹配
- 对于“文件”，与文件路径匹配
- 部署前测试模式