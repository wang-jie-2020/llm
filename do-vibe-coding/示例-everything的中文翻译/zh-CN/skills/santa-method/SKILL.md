---
name: santa-method
description: "具有收敛循环的多代理对抗验证。两个独立审查机构必须同时通过才能交付输出。"origin: "Ronald Skelton - Founder, RapportScore.ai"
---
# 圣诞老人方法

多智能体对抗验证框架。列一个清单，检查两次。如果它很顽皮，请修复它，直到它变得好为止。

核心见解：审查自己输出的单个代理与产生输出的偏见、知识差距和系统错误具有相同的偏见、知识差距和系统错误。两个没有共享上下文的独立审阅者打破了这种失败模式。

## 何时激活

在以下情况下调用该技能：
- 输出将由最终用户发布、部署或使用
- 必须执行合规、监管或品牌约束
- 代码无需人工审核即可投入生产
- 内容准确性很重要（技术文档、教育材料、面向客户的副本）
- 大规模批量生成，抽查会遗漏系统模式
- 幻觉风险升高（声明、统计数据、API 参考、法律语言）

请勿用于内部草稿、探索性研究或具有确定性验证的任务（对这些使用构建/测试/lint 管道）。

＃＃ 建筑学```
┌─────────────┐
│  GENERATOR   │  Phase 1: Make a List
│  (Agent A)   │  Produce the deliverable
└──────┬───────┘
       │ output
       ▼
┌──────────────────────────────┐
│     DUAL INDEPENDENT REVIEW   │  Phase 2: Check It Twice
│                                │
│  ┌───────────┐ ┌───────────┐  │  Two agents, same rubric,
│  │ Reviewer B │ │ Reviewer C │  │  no shared context
│  └─────┬─────┘ └─────┬─────┘  │
│        │              │        │
└────────┼──────────────┼────────┘
         │              │
         ▼              ▼
┌──────────────────────────────┐
│        VERDICT GATE           │  Phase 3: Naughty or Nice
│                                │
│  B passes AND C passes → NICE  │  Both must pass.
│  Otherwise → NAUGHTY           │  No exceptions.
└──────┬──────────────┬─────────┘
       │              │
    NICE           NAUGHTY
       │              │
       ▼              ▼
   [ SHIP ]    ┌─────────────┐
               │  FIX CYCLE   │  Phase 4: Fix Until Nice
               │              │
               │ iteration++  │  Collect all flags.
               │ if i > MAX:  │  Fix all issues.
               │   escalate   │  Re-run both reviewers.
               │ else:        │  Loop until convergence.
               │   goto Ph.2  │
               └──────────────┘
```
## 阶段详细信息

### 第 1 阶段：制定列表（生成）

执行首要任务。您的正常生成工作流程不会发生任何变化。 Santa Method是生成后验证层，而不是生成策略。```python
# The generator runs as normal
output = generate(task_spec)
```
### 第 2 阶段：检查两次（独立双重审查）

并行产生两个审核代理。关键不变量：

1. **上下文隔离**——两个评审者都看不到对方的评估
2. **相同的评价标准** - 两者都接受相同的评估标准
3. **相同的输入** — 都接收原始规范和生成的输出
4. **结构化输出** - 每个都返回一个类型化的结论，而不是散文```python
REVIEWER_PROMPT = """
You are an independent quality reviewer. You have NOT seen any other review of this output.

## Task Specification
{task_spec}

## Output Under Review
{output}

## Evaluation Rubric
{rubric}

## Instructions
Evaluate the output against EACH rubric criterion. For each:
- PASS: criterion fully met, no issues
- FAIL: specific issue found (cite the exact problem)

Return your assessment as structured JSON:
{
  "verdict": "PASS" | "FAIL",
  "checks": [
    {"criterion": "...", "result": "PASS|FAIL", "detail": "..."}
  ],
  "critical_issues": ["..."],   // blockers that must be fixed
  "suggestions": ["..."]         // non-blocking improvements
}

Be rigorous. Your job is to find problems, not to approve.
"""
```

```python
# Spawn reviewers in parallel (Claude Code subagents)
review_b = Agent(prompt=REVIEWER_PROMPT.format(...), description="Santa Reviewer B")
review_c = Agent(prompt=REVIEWER_PROMPT.format(...), description="Santa Reviewer C")

# Both run concurrently — neither sees the other
```
### 标题设计

标题是最重要的输入。模糊的标题会产生模糊的评论。每个标准都必须有客观的通过/失败条件。

|标准|通过条件 |故障信号|
|----------|--------------|----------------|
|事实准确性 |所有声明均可根据源材料或常识进行验证 |发明了统计数据、错误的版本号、不存在的 API |
|无幻觉|没有捏造的实体、引用、URL 或参考文献 |指向不存在的页面的链接、无来源的引用 |
|完整性|规范中的每项要求均得到满足 |缺少部分、跳过边缘情况、覆盖不完整 |
|合规|通过所有项目特定的限制 |使用禁用术语、违规语气、违规行为 |
|内部一致性|输出中没有矛盾 | A 部分表示 X，B 部分表示非 X |
|技术正确性 |代码编译/运行，算法健全 |语法错误、逻辑错误、错误的复杂性声明 |

#### 特定领域的扩展

**内容/营销：**
- 品牌声音的坚持
- 满足 SEO 要求（关键词密度、元标签、结构）- 没有竞争对手滥用商标
- CTA 存在并正确链接

**代码：**
- 类型安全（没有“任何”泄漏，正确的空处理）
- 错误处理覆盖率
- 安全性（代码中没有秘密、输入验证、预防注入）
- 测试新路径的覆盖范围

**合规敏感（监管、法律、财务）：**
- 没有结果保证或未经证实的主张
- 存在必需的免责声明
- 仅批准的术语
- 适合司法管辖区的语言

### 第 3 阶段：顽皮还是善良（判决门）```python
def santa_verdict(review_b, review_c):
    """Both reviewers must pass. No partial credit."""
    if review_b.verdict == "PASS" and review_c.verdict == "PASS":
        return "NICE"  # Ship it

    # Merge flags from both reviewers, deduplicate
    all_issues = dedupe(review_b.critical_issues + review_c.critical_issues)
    all_suggestions = dedupe(review_b.suggestions + review_c.suggestions)

    return "NAUGHTY", all_issues, all_suggestions
```
为什么两者都必须通过：如果只有一位审阅者发现一个问题，那么该问题就是真实的。另一位审稿人的盲点正是圣诞老人方法所要消除的故障模式。

### 第 4 阶段：修复直至良好（收敛循环）```python
MAX_ITERATIONS = 3

for iteration in range(MAX_ITERATIONS):
    verdict, issues, suggestions = santa_verdict(review_b, review_c)

    if verdict == "NICE":
        log_santa_result(output, iteration, "passed")
        return ship(output)

    # Fix all critical issues (suggestions are optional)
    output = fix_agent.execute(
        output=output,
        issues=issues,
        instruction="Fix ONLY the flagged issues. Do not refactor or add unrequested changes."
    )

    # Re-run BOTH reviewers on fixed output (fresh agents, no memory of previous round)
    review_b = Agent(prompt=REVIEWER_PROMPT.format(output=output, ...))
    review_c = Agent(prompt=REVIEWER_PROMPT.format(output=output, ...))

# Exhausted iterations — escalate
log_santa_result(output, MAX_ITERATIONS, "escalated")
escalate_to_human(output, issues)
```
关键：每轮审查都使用**新鲜药剂**。审稿人不得保留前几轮的记忆，因为先前的背景会产生锚定偏差。

## 实现模式

### 模式 A：Claude Code 子代理（推荐）

子代理提供真正的上下文隔离。每个审阅者都是一个独立的进程，没有共享状态。```bash
# In a Claude Code session, use the Agent tool to spawn reviewers
# Both agents run in parallel for speed
```

```python
# Pseudocode for Agent tool invocation
reviewer_b = Agent(
    description="Santa Review B",
    prompt=f"Review this output for quality...\n\nRUBRIC:\n{rubric}\n\nOUTPUT:\n{output}"
)
reviewer_c = Agent(
    description="Santa Review C",
    prompt=f"Review this output for quality...\n\nRUBRIC:\n{rubric}\n\nOUTPUT:\n{output}"
)
```
### 模式 B：顺序内联（后备）

当子代理不可用时，通过显式上下文重置来模拟隔离：

1. 生成输出
2. 新上下文：“您是审阅者 1。仅根据此标题进行评估。发现问题。”
3. 逐字记录调查结果
4. 完全清晰上下文
5. 新上下文：“您是审阅者 2。仅根据此标题进行评估。发现问题。”
6.比较两条评论，修复，重复

子代理模式是绝对优越的——内联模拟存在审阅者之间上下文流失的风险。

### 模式 C：批量采样

对于大批量（100 件以上的物品）来说，每件物品都配备完整的圣诞老人成本高昂。使用分层抽样：

1. 对随机样本运行 Santa（批次的 10-15%，至少 5 个项目）
2. 按类型对失败进行分类（幻觉、合规性、完整性等）
3. 如果出现系统模式，则对整个批次进行有针对性的修复
4. 固定批次重新取样、重新验证
5. 继续直到干净的样品通过```python
import random

def santa_batch(items, rubric, sample_rate=0.15):
    sample = random.sample(items, max(5, int(len(items) * sample_rate)))

    for item in sample:
        result = santa_full(item, rubric)
        if result.verdict == "NAUGHTY":
            pattern = classify_failure(result.issues)
            items = batch_fix(items, pattern)  # Fix all items matching pattern
            return santa_batch(items, rubric)   # Re-sample

    return items  # Clean sample → ship batch
```
## 故障模式和缓解措施

|失效模式|症状|缓解措施 |
|-------------|---------|------------|
|无限循环|修复后审阅者不断发现新问题 |最大迭代上限 (3)。升级。 |
|橡胶冲压|两位审稿人都通过了一切 |对抗性提示：“你的工作是发现问题，而不是批准。” |
|主观漂移|审稿人标记风格偏好，而不是错误 |仅具有客观通过/失败标准的严格标准 |
|修复回归 |解决问题 A 会引入问题 B |每轮新的审稿人都会发现回归|
|审稿人协议偏差 |两位审稿人都错过了同样的事情|通过独立来缓解，而不是消除。对于关键输出，请添加第三位审阅者或人工抽查。 |
|成本爆炸|大输出迭代次数过多 |批量采样模式。每个验证周期的预算上限。 |

## 与其他技能的整合

|技能|关系 |
|--------|-------------|
|验证循环|用于确定性检查（构建、lint、测试）。圣诞老人进行语义检查（准确性、幻觉）。首先运行验证循环，其次运行圣诞老人。 ||评估安全带|圣诞老人方法结果提供评估指标。跟踪圣诞老人运行中的 pass@k 以测量一段时间内发电机的质量。 |
|持续学习 v2 |圣诞老人的发现变成了本能。在同一标准上重复失败 → 学会避免这种模式的行为。 |
|战略契约|在压缩之前运行 Santa。不要在验证过程中丢失审核上下文。 |

## 指标

跟踪这些以衡量圣诞老人方法的有效性：

- **首次通过率**：第一轮通过圣诞老人的输出百分比（目标：>70%）
- **收敛的平均迭代**：达到 NICE 的平均轮次（目标：<1.5）
- **问题分类**：失败类型的分布（幻觉与完整性与合规性）
- **审稿人一致意见**：两位审稿人标记的问题与只有一位审稿人标记的问题的百分比（一致度低=标题需要收紧）
- **逃逸率**：圣诞老人应该发现的发货后发现的问题（目标：0）

## 成本分析

圣诞老人方法的成本大约是每个验证周期单独生成代币成本的 2-3 倍。对于大多数高风险输出来说，这是一个便宜的选择：```
Cost of Santa = (generation tokens) + 2×(review tokens per round) × (avg rounds)
Cost of NOT Santa = (reputation damage) + (correction effort) + (trust erosion)
```
对于批量操作，采样模式可将全面验证的成本降低至约 15-20%，同时捕获 >90% 的系统问题。