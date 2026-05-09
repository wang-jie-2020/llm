---
description: "使用自然语言文件定位快速提交 - 用简单的英语描述要提交的内容"argument-hint: "[target description] (blank = all changes)"
---
# 智能提交

> 改编自 Wirasm 的 PRPs-agentic-eng。 PRP 工作流程系列的一部分。

**输入**：$ARGUMENTS

---

## 第一阶段——评估```bash
git status --short
```
如果输出为空→停止：“没有什么可提交的。”

向用户显示更改内容的摘要（添加、修改、删除、未跟踪）。

---

## 第 2 阶段 — 解释和舞台

解释 `$ARGUMENTS` 以确定要暂存的内容：

|输入|解读| Git 命令 |
|---|---|---|
| *（空白/空）* |舞台一切| `git add -A` |
| “上演” |使用已经上演的任何内容 | *（无 git add）* |
| `*.ts` 或 `*.py` 等 |阶段匹配全局 | `git add '*.ts'` |
| `测试除外` |暂存所有测试，然后取消暂存测试 | `git add -A && git reset -- '**/*.test.*' '**/*.spec.*' '**/test_*' 2>/dev/null \|\|真实` |
| `仅新文件` |仅暂存未跟踪的文件 | `git ls-files --others --exclude-standard \| grep 。 && git ls-files --others --exclude-standard \| xargs git add`|
| `授权更改` |从 status/diff 解释 — 查找与 auth 相关的文件 | `git add <匹配的文件>` |
|具体文件名 |暂存这些文件 | `git add <文件>` |

对于自然语言输入（例如“身份验证更改”），交叉引用“git status”输出和“git diff”以识别相关文件。向用户显示您正在暂存哪些文件以及原因。```bash
git add <determined files>
```
登台后，验证：```bash
git diff --cached --stat
```
如果没有上演任何内容，请停止：“没有文件与您的描述相符。”

---

## 第三阶段——提交

以命令语气编写单行提交消息：```
{type}: {description}
```
类型：
- `feat` — 新特性或功能
- `fix` — 错误修复
- `refactor` — 代码重组而不改变行为
- `docs` — 文档更改
- `test` — 添加或更新测试
- `chore` — 构建、配置、依赖项
- `perf` — 性能改进
- `ci` — CI/CD 更改

规则：
- 命令式语气（“添加功能”而不是“添加功能”）
- 类型前缀后小写
- 末尾没有句号
- 72 个字符以下
- 描述改变了什么，而不是如何改变```bash
git commit -m "{type}: {description}"
```
---

## 第 4 阶段 — 输出

向用户报告：```
Committed: {hash_short}
Message:   {type}: {description}
Files:     {count} file(s) changed

Next steps:
  - git push           → push to remote
  - /prp-pr            → create a pull request
  - /code-review       → review before pushing
```
---

## 示例

|你说|会发生什么 |
|---|---|
| `/prp-提交` |暂存所有，自动生成消息 |
| `/prp-commit 已上演` |仅提交已经上演的内容 |
| `/prp-commit *.ts` |暂存所有 TypeScript 文件，提交 |
| `/prp-commit 测试除外` |暂存除测试文件之外的所有内容 |
| `/prp-提交数据库迁移` |从状态中查找数据库迁移文件，暂存它们 |
| `/prp-仅提交新文件` |仅暂存未跟踪的文件 |