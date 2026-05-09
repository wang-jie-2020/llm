---
description: 对抗性双重审查收敛循环——两个独立的模型审查者必须在代码发布之前都批准。---
# 圣诞老人循环

使用圣诞老人方法技能的对抗性双重审查收敛循环。两个独立的审阅者——不同的模型，没有共享的上下文——必须在代码发布之前都返回 NICE。

## 目的

针对当前任务输出运行两个独立审阅者（Claude Opus + 外部模型）。在推送代码之前，两者都必须返回 NICE。如果其中任何一个返回 NAUGHTY，请修复所有标记的问题、提交并重新运行新的审阅者 - 最多 3 轮。

＃＃ 用法```
/santa-loop [file-or-glob | description]
```
## 工作流程

### 第 1 步：确定要审查的内容

确定“$ARGUMENTS”的范围或回退到未提交的更改：```bash
git diff --name-only HEAD
```
读取所有更改的文件以构建完整的审阅上下文。如果“$ARGUMENTS”指定路径、文件或描述，请使用它作为范围。

### 第 2 步：构建评分细则

构建适合所审查的文件类型的标题。每个标准都必须有一个客观的通过/失败条件。至少包括：

|标准|通过条件 |
|------------|--------------|
|正确性|逻辑健全，没有错误，可以处理边缘情况 |
|安全|无秘密、注入、XSS 或 OWASP 十大问题 |
|错误处理 |错误处理明确，无声吞咽|
|完整性|满足所有要求，无遗漏案例 |
|内部一致性|文件或部分之间没有矛盾 |
|没有回归 |改变不会破坏现有的行为 |

根据文件类型添加特定于域的标准（例如，TS 的类型安全、Rust 的内存安全、SQL 的迁移安全）。

### 步骤 3：双重独立审查

使用代理工具**并行**启动两个审阅者（两者都在一条消息中用于并发执行）。两者都必须在进入判决门之前完成。每个审阅者将每个评分标准评估为“通过”或“失败”，然后返回结构化 JSON：```json
{
  "verdict": "PASS" | "FAIL",
  "checks": [
    {"criterion": "...", "result": "PASS|FAIL", "detail": "..."}
  ],
  "critical_issues": ["..."],
  "suggestions": ["..."]
}
```
判定门（第 4 步）将这些映射到“好”/“顽皮”：要么“通过”→“好”，要么“失败”→“顽皮”。

#### 审稿人 A：Claude Agent（始终运行）

启动一个代理（subagent_type：`code-reviewer`，型号：`opus`），并包含完整的标题+所有正在审查的文件。提示必须包括：
- 完整的标题
- 所有文件内容正在审查中
- “您是一名独立的质量审核员。您没有见过任何其他审核。您的工作是发现问题，而不是批准。”
- 返回上面的结构化 JSON 判决

#### 审阅者 B：外部模型（仅在未安装外部 CLI 时克劳德回退）

首先，检测哪些 CLI 可用：```bash
command -v codex >/dev/null 2>&1 && echo "codex" || true
command -v gemini >/dev/null 2>&1 && echo "gemini" || true
```
构建审阅者提示（与审阅者 A 相同的标题 + 说明）并将其写入唯一的临时文件：```bash
PROMPT_FILE=$(mktemp /tmp/santa-reviewer-b-XXXXXX.txt)
cat > "$PROMPT_FILE" << 'EOF'
... full rubric + file contents + reviewer instructions ...
EOF
```
使用第一个可用的 CLI：

**Codex CLI**（如果已安装）```bash
codex exec --sandbox read-only -m gpt-5.4 -C "$(pwd)" - < "$PROMPT_FILE"
rm -f "$PROMPT_FILE"
```
**Gemini CLI**（如果已安装但未安装 codex）```bash
gemini -p "$(cat "$PROMPT_FILE")" -m gemini-2.5-pro
rm -f "$PROMPT_FILE"
```
**Claude Agent 后备**（仅当“codex”和“gemini”均未安装时）
启动第二个 Claude Agent（子代理类型：“code-reviewer”，型号：“opus”）。记录两个审阅者共享相同模型系列的警告 - 尚未实现真正的模型多样性，但仍然强制执行上下文隔离。

在所有情况下，审阅者必须返回与审阅者 A 相同的结构化 JSON 判决。

### 步骤 4：判决门

- **均通过** → **很好** — 继续步骤 6（推）
- **要么失败** → **顽皮** - 合并两位审阅者的所有关键问题，删除重复内容，继续执行步骤 5

### 步骤 5：修复循环（NAUGHTY 路径）

1. 显示两位审阅者的所有关键问题
2. 修复每个标记的问题——仅更改标记的内容，不进行路过式重构
3. 在一次提交中提交所有修复：   ```
   fix: address santa-loop review findings (round N)
   ```
4.与**新审稿人**重新运行步骤3（不记得前几轮）
5.重复直到两者都返回PASS

**最多 3 次迭代。** 如果 3 轮后仍然顽皮，请停止并提出剩余问题：```
SANTA LOOP ESCALATION (exceeded 3 iterations)

Remaining issues after 3 rounds:
- [list all unresolved critical issues from both reviewers]

Manual review required before proceeding.
```
请勿推动。

### 第 6 步：推送（不错的路径）

当两个审稿人都返回 PASS 时：```bash
git push -u origin HEAD
```
### 第 7 步：最终报告

打印输出报告（请参阅下面的输出部分）。

＃＃ 输出```
SANTA VERDICT: [NICE / NAUGHTY (escalated)]

Reviewer A (Claude Opus):   [PASS/FAIL]
Reviewer B ([model used]):  [PASS/FAIL]

Agreement:
  Both flagged:      [issues caught by both]
  Reviewer A only:   [issues only A caught]
  Reviewer B only:   [issues only B caught]

Iterations: [N]/3
Result:     [PUSHED / ESCALATED TO USER]
```
## 注释

- 审阅者 A (Claude Opus) 始终运行 — 无论使用何种工具，都保证至少有一名强大的审阅者。
- 模型多样性是审稿人 B 的目标。GPT-5.4 或 Gemini 2.5 Pro 提供真正的独立性——不同的训练数据、不同的偏差、不同的盲点。仅克劳德的后备仍然通过上下文隔离提供价值，但失去了模型多样性。
- 使用最强的可用模型：用于审阅者 A 的 Opus、用于审阅者 B 的 GPT-5.4 或 Gemini 2.5 Pro。
- 外部审阅者使用“--sandbox read-only”（Codex）运行，以防止审阅期间存储库突变。
- 每轮新的审稿人都可以防止因先前的发现而产生偏见。
- 标题是最重要的输入。如果审稿人橡皮图章或标记主观风格问题，请收紧它。
- 提交发生在 NAUGHTY 回合中，因此即使循环中断，修复也会保留。
- 推送仅发生在 NICE 之后——绝不会发生在循环中。