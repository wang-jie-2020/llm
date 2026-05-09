---
name: gateguard
description: 强制事实的大门，阻止编辑/写入/Bash（包括多重编辑），并要求在允许操作之前进行具体调查（导入者、数据模式、用户指令）。与非门控代理相比，输出质量显着提高了 +2.25 点。origin: community
---
# GateGuard — 事实强制行动前门

一个 PreToolUse 挂钩，迫使 Claude 在编辑之前进行调查。它不需要自我评价（“你确定吗？”），而是需要具体的事实。调查行为可以产生自我评价从未产生过的意识。

## 何时激活

- 在文件编辑影响多个模块的任何代码库上工作
- 包含具有特定架构或日期格式的数据文件的项目
- 人工智能生成的代码必须与现有模式匹配的团队
- 克劳德倾向于猜测而不是调查的任何工作流程

## 核心理念

LLM自我评估不起作用。问“您是否违反任何政策？”答案总是“不”。这是通过实验验证的。

但是要求“列出导入此模块的每个文件”会强制 LLM 运行 Grep 和 Read。调查本身会创建改变输出的上下文。

**三级门：**```
1. DENY  — block the first Edit/Write/Bash attempt
2. FORCE — tell the model exactly which facts to gather
3. ALLOW — permit retry after facts are presented
```
没有竞争对手能同时做到这三点。大多数人止步于否认。

## 证据

两个独立的 A/B 测试，相同的代理，相同的任务：

|任务|门控|未门禁 |差距|
| --- | --- | --- | --- |
|分析模块 | 8.0/10 | 6.5/10 | +1.5 |
| Webhook 验证器 | 10.0/10 | 10.0/10 7.0/10 | +3.0 |
| **平均** | **9.0** | **6.75** | **+2.25** |

两个代理都会生成运行并通过测试的代码。区别在于设计深度。

## 门类型

### 编辑/多重编辑门（每个文件的第一次编辑）

多重编辑的处理方式相同——批次中的每个文件都是单独门控的。```
Before editing {file_path}, present these facts:

1. List ALL files that import/require this file (use Grep)
2. List the public functions/classes affected by this change
3. If this file reads/writes data files, show field names, structure,
   and date format (use redacted or synthetic values, not raw production data)
4. Quote the user's current instruction verbatim
```
### Write Gate（第一个新文件创建）```
Before creating {file_path}, present these facts:

1. Name the file(s) and line(s) that will call this new file
2. Confirm no existing file serves the same purpose (use Glob)
3. If this file reads/writes data files, show field names, structure,
   and date format (use redacted or synthetic values, not raw production data)
4. Quote the user's current instruction verbatim
```
### Destructive Bash Gate（每个破坏性命令）

触发：`rm -rf`、`git reset --hard`、`git push --force`、`drop table` 等。```
1. List all files/data this command will modify or delete
2. Write a one-line rollback procedure
3. Quote the user's current instruction verbatim
```
### 例行 Bash Gate（每节一次）```
1. The current user request in one sentence
2. What this specific command verifies or produces
```
## 快速入门

### 选项 A：使用 ECC 挂钩（零安装）

该插件中包含“scripts/hooks/gateguard-fact-force.js”处的钩子。通过 hooks.json 启用它。

如果 GateGuard 阻止设置或修复工作，请使用以下命令启动会话
`ECC_GATEGUARD=关闭`。对于钩子级别的控制，继续使用
带有 GateGuard 挂钩 ID 的“ECC_DISABLED_HOOKS”。

### 选项 B：带配置的完整包```bash
pip install gateguard-ai
gateguard init
```
这为每个项目配置添加了“.gateguard.yml”（自定义消息、忽略路径、门切换）。

## 反模式

- **不要使用自我评估。** “你确定吗？”总是得到“是”。这是经过实验验证的。
- **不要跳过数据模式检查。** 当实际数据使用 `%Y/%m/%d %H:%M` 时，两个 A/B 测试代理都假定 ISO-8601 日期。检查数据结构（使用编辑值）可以防止整个类别的错误。
- **不要对每个 Bash 命令进行门控。** 每个会话例行 bash 门控一次。每次都破坏性地猛击大门。这种平衡可以避免经济放缓，同时捕捉真正的风险。

## 最佳实践

- 让门自然开火。不要试图预先回答入门问题——调查本身就可以提高质量。
- 为您的域定制门消息。如果您的项目有特定约定，请将它们添加到门提示中。
- 使用“.gateguard.yml”忽略“.venv/”、“node_modules/”、“.git/”等路径。

## 相关技能

- `safety-guard` — 运行时安全检查（补充，不重叠）
- `code-reviewer` — 编辑后审查（GateGuard 是编辑前调查）