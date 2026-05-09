---
name: hookify-rules
description: 当用户要求创建 hookify 规则、编写 hookify 规则、配置 hookify、添加 hookify 规则或需要 hookify 规则语法和模式的指导时，应使用此技能。---
# 编写 Hookify 规则

## 概述

Hookify 规则是带有 YAML frontmatter 的 Markdown 文件，定义了要监视的模式以及这些模式匹配时要显示的消息。规则存储在 `.claude/hookify.{rule-name}.local.md` 文件中。

## 规则文件格式

### 基本结构```markdown
---
name: rule-identifier
enabled: true
event: bash|file|stop|prompt|all
pattern: regex-pattern-here
---

Message to show Claude when this rule triggers.
Can include markdown formatting, warnings, suggestions, etc.
```
### Frontmatter 字段

|领域|必填 |价值观 |描述 |
|--------|----------|--------|-------------|
|名称 |是的 |烤肉串大小写字符串 |唯一标识符（动词优先：警告-*、阻止-*、要求-*）|
|已启用 |是的 |真/假|切换而不删除|
|活动 |是的 | bash/文件/停止/提示/全部|哪个钩子事件触发此 |
|行动|没有 |警告/阻止 | warn（默认）显示消息；块阻止操作 |
|图案|是* |正则表达式字符串 |要匹配的模式（*或使用复杂规则的条件）|

### 高级格式（多个条件）```markdown
---
name: warn-env-api-keys
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.env$
  - field: new_text
    operator: contains
    pattern: API_KEY
---

You're adding an API key to a .env file. Ensure this file is in .gitignore!
```
**按事件划分的条件字段：**
- bash：`命令`
- 文件：`文件路径`、`新文本`、`旧文本`、`内容`
- 提示：`user_prompt`

**运算符：** `regex_match`、`contains`、`equals`、`not_contains`、`starts_with`、`ends_with`

所有条件必须匹配才能触发规则。

## 事件类型指南

### bash 事件
匹配 Bash 命令模式：
- 危险命令：`rm\s+-rf`、`dd\s+if=`、`mkfs`
- 权限升级：`sudo\s+`、`su\s+`
- 权限问题：`chmod\s+777`

### 文件事件
匹配编辑/写入/多重编辑操作：
- 调试代码：`console\.log\(`, `debugger`
- 安全风险：`eval\(`、`innerHTML\s*=`
- 敏感文件：`\.env$`、`credentials`、`\.pem$`

### 停止活动
完成检查和提醒。模式 `.*` 始终匹配。

### 提示事件
匹配用户提示内容以执行工作流。

## 模式写作技巧

### 正则表达式基础知识
- 转义特殊字符：`.`到`\.`，`(`到`\(`
- `\s` 空格、`\d` 数字、`\w` 单词字符
- `+` 一个或多个，`*` 零个或多个，`?` 可选
- `|` 或运算符

### 常见陷阱
- **太宽泛**：`log`匹配“login”，“dialog” - 使用`console\.log\(`
- **太具体**：`rm -rf /tmp` — 使用`rm\s+-rf`- **YAML 转义**：使用不带引号的模式；带引号的字符串需要 `\\s`

### 测试```bash
python3 -c "import re; print(re.search(r'your_pattern', 'test text'))"
```
## 文件组织

- **位置**：项目根目录中的`.claude/`目录
- **命名**：`.claude/hookify.{描述性名称}.local.md`
- **Gitignore**：将 `.claude/*.local.md` 添加到 `.gitignore`

## 命令

- `/hookify [description]` - 创建新规则（如果没有参数则自动分析对话）
- `/hookify-list` - 以表格格式查看所有规则
- `/hookify-configure` - 交互式打开/关闭规则
- `/hookify-help` - 完整文档

## 快速参考

最小可行规则：```markdown
---
name: my-rule
enabled: true
event: bash
pattern: dangerous_command
---
Warning message here
```
