---
description: 运行生成器/评估器构建循环以执行具有有限迭代和评分的任务。---
从 $ARGUMENTS 中解析以下内容：
1. `brief` — 用户对要构建的内容的一行描述
2. `--max-iterations N` —（可选，默认 15）最大生成器-评估器周期
3. `--pass-threshold N` — （可选，默认 7.0）通过的加权分数
4. `--skip-planner` —（可选）跳过规划器，假设spec.md已经存在
5. `--eval-mode MODE` —（可选，默认“剧作家”）以下之一：剧作家、屏幕截图、仅代码

## GAN 风格的 Harness 构建

该命令编排了一个三代理构建循环，其灵感来自 Anthropic 的 2026 年 3 月线束设计论文。

### 第 0 阶段：设置
1.在项目根目录创建`gan-harness/`目录
2.创建子目录：`gan-harness/feedback/`、`gan-harness/screenshots/`
3. 如果尚未初始化，则初始化 git
4. 日志启动时间及配置

### 第一阶段：规划（规划代理）
除非设置了“--skip-planner”：
1. 通过任务工具使用用户简介启动“gan-planner”代理
2. 等待生成 `gan-harness/spec.md` 和 `gan-harness/eval-rubric.md`
3. 向用户显示规格摘要
4. 进入第二阶段

### 第 2 阶段：生成器-评估器循环```
iteration = 1
while iteration <= max_iterations:

    # GENERATE
    Launch gan-generator agent via Task tool:
    - Read spec.md
    - If iteration > 1: read feedback/feedback-{iteration-1}.md
    - Build/improve the application
    - Ensure dev server is running
    - Commit changes

    # Wait for generator to finish

    # EVALUATE
    Launch gan-evaluator agent via Task tool:
    - Read eval-rubric.md and spec.md
    - Test the live application (mode: playwright/screenshot/code-only)
    - Score against rubric
    - Write feedback to feedback/feedback-{iteration}.md

    # Wait for evaluator to finish

    # CHECK SCORE
    Read feedback/feedback-{iteration}.md
    Extract weighted total score

    if score >= pass_threshold:
        Log "PASSED at iteration {iteration} with score {score}"
        Break

    if iteration >= 3 and score has not improved in last 2 iterations:
        Log "PLATEAU detected — stopping early"
        Break

    iteration += 1
```
### 第三阶段：总结
1. 阅读所有反馈文件
2. 显示最终得分和迭代历史记录
3. 显示分数进展：`迭代 1: 4.2 → 迭代 2: 5.8 → ... → 迭代 N: 7.5`
4. 列出最终评估中剩余的问题
5. 报告总时间和预计费用

### 输出```markdown
## GAN Harness Build Report

**Brief:** [original prompt]
**Result:** PASS/FAIL
**Iterations:** N / max
**Final Score:** X.X / 10

### Score Progression
| Iter | Design | Originality | Craft | Functionality | Total |
|------|--------|-------------|-------|---------------|-------|
| 1 | ... | ... | ... | ... | X.X |
| 2 | ... | ... | ... | ... | X.X |
| N | ... | ... | ... | ... | X.X |

### Remaining Issues
- [Any issues from final evaluation]

### Files Created
- gan-harness/spec.md
- gan-harness/eval-rubric.md
- gan-harness/feedback/feedback-001.md through feedback-NNN.md
- gan-harness/generator-state.md
- gan-harness/build-report.md
```
将完整报告写入“gan-harness/build-report.md”。