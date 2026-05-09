---
description: 创建挂钩以防止对话分析或显式指令中出现不需要的行为---
通过分析对话模式或显式用户指令，创建挂钩规则以防止不需要的 Claude Code 行为。

## 用法

`/hookify [要防止的行为描述]`

如果没有提供参数，请分析当前对话以找到值得预防的行为。

## 工作流程

### 第 1 步：收集行为信息

- 带参数：解析用户对不良行为的描述
- 不带参数：使用“conversation-analyzer”代理查找：
  - 明确的更正
  - 对重复错误的沮丧反应
  - 恢复更改
  - 重复类似问题

### 第 2 步：展示调查结果

向用户显示：

- 行为描述
- 提议的活动类型
- 提议的模式或匹配器
- 提议的行动

### 步骤 3：生成规则文件

对于每个批准的规则，在“.claude/hookify.{name}.local.md”处创建一个文件：```yaml
---
name: rule-name
enabled: true
event: bash|file|stop|prompt|all
action: block|warn
pattern: "regex pattern"
---
Message shown when rule triggers.
```
### 第 4 步：确认

报告创建的规则以及如何使用“/hookify-list”和“/hookify-configure”管理它们。