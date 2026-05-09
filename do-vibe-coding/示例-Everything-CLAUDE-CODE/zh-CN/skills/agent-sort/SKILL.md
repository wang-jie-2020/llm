---
name: agent-sort
description: 通过使用并行存储库感知审核通道将技能、命令、规则、挂钩和附加内容分类到“每日”与“库”存储桶中，为特定存储库构建有证据支持的 ECC 安装计划。当 ECC 应根据项目实际需要进行调整而不是加载完整包时使用。origin: ECC
---
# 代理排序

当存储库需要特定于项目的 ECC 表面而不是默认的完整安装时，请使用此技能。

我们的目标不是猜测什么“感觉有用”。目标是根据实际代码库的证据对 ECC 组件进行分类。

## 何时使用

- 一个项目只需要 ECC 的一个子集，完整安装的噪音太大
- 仓库堆栈很清晰，但没有人愿意一一手工策划技能
- 团队想要一个由 grep 证据而不是意见支持的可重复安装决策
- 您需要将始终加载的日常工作流程表面与可搜索库/参考表面分开
- 存储库已陷入错误的语言、规则或钩子集，需要清理

## 不可协商的规则

- 使用当前存储库作为事实来源，而不是通用偏好
- 每个每日决策都必须引用具体的回购证据
- LIBRARY 并不意味着“删除”；它的意思是“默认情况下保持可访问而不加载”
- 不要安装当前存储库无法使用的挂钩、规则或脚本
- 更喜欢 ECC 原生表面；不引入第二个安装系统

## 输出

按顺序生成这些工件：

1. 每日库存
2. 图书馆库存
3.安装计划4、验证报告
5. 可选的“技能库”路由器（如果项目需要）

## 分类模型

仅使用两个桶：

- “每日”
  - 应该加载此存储库的每个会话
  - 与存储库的语言、框架、工作流程或操作界面高度匹配
- `图书馆`
  - 保留有用，但默认情况下不值得加载
  - 应通过搜索、路由器技能或选择性手动使用保持可达性

## 证据来源

在进行任何分类之前使用存储库本地证据：

- 文件扩展名
- 包管理器和锁定文件
- 框架配置
- CI 和钩子配置
- 构建/测试脚本
- 导入和依赖清单
- 明确描述堆栈的存储库文档

有用的命令包括：```bash
rg --files
rg -n "typescript|react|next|supabase|django|spring|flutter|swift"
cat package.json
cat pyproject.toml
cat Cargo.toml
cat pubspec.yaml
cat go.mod
```
## 并行审核通过

如果并行子代理可用，请将审核分为以下阶段：

1. 代理商
   - 对`agents/*`进行分类
2. 技能
   - 对`技能/*`进行分类
3. 命令
   - 对`命令/*`进行分类
4. 规则
   - 对`规则/*`进行分类
5. 钩子和脚本
   - 对钩子表面、MCP 健康检查、帮助脚本和操作系统兼容性进行分类
6. 附加功能
   - 对上下文、示例、MCP 配置、模板和指导文档进行分类

如果子代理不可用，请按顺序运行相同的遍。

## 核心工作流程

### 1. 阅读存储库

在对任何内容进行分类之前建立真实的堆栈：

- 使用的语言
- 使用中的框架
- 主要包管理器
- 测试堆栈
- lint/格式堆栈
- 部署/运行时表面
- 运营商集成已经存在

### 2. 构建证据表

对于每个候选表面，记录：

- 组件路径
- 组件类型
- 建议的桶
- 回购证据
- 简短的理由

使用这种格式：```text
skills/frontend-patterns | skill | DAILY | 84 .tsx files, next.config.ts present | core frontend stack
skills/django-patterns   | skill | LIBRARY | no .py files, no pyproject.toml       | not active in this repo
rules/typescript/*       | rules | DAILY | package.json + tsconfig.json            | active TS repo
rules/python/*           | rules | LIBRARY | zero Python source files             | keep accessible only
```
### 3. 决定 DAILY 与 LIBRARY

在以下情况下升级为“每日”：

- 仓库明确使用了匹配的堆栈
- 该组件足够通用，可以帮助每个会话
- 存储库已经依赖于相应的运行时或工作流程

在以下情况下降级为“LIBRARY”：

- 组件脱离堆栈
- 仓库稍后可能需要它，但不是每天都需要它
- 它增加了上下文开销，但没有直接相关性

### 4. 制定安装计划

将分类转化为行动：

- 日常技能 -> 安装或保存在 `.claude/skills/` 中
- DAILY 命令 -> 仅当仍然有用时才保留为显式垫片
- 每日规则 -> 仅安装匹配的语言集
- DAILY 挂钩/脚本 -> 仅保留兼容的
- 库表面 -> 通过搜索或“技能库”保持可访问性

如果存储库已使用选择性安装，请更新该计划而不是创建另一个系统。

### 5. 创建可选的库路由器

如果项目需要可搜索的库表面，请创建：

- `.claude/skills/skill-library/SKILL.md`

该路由器应包含：

- DAILY 与 LIBRARY 的简短说明
- 分组触发关键字
- 图书馆参考文献所在的位置

不要复制路由器内的每个技能体。### 6. 验证结果

应用计划后，验证：

- 每个 DAILY 文件都存在于预期的位置
- 过时的语言规则没有保持活动状态
- 未安装不兼容的挂钩
- 结果安装实际上与存储库堆栈匹配

返回一份简洁的报告：

- 每日计数
- 图书馆计数
- 去除陈旧的表面
- 开放式问题

## 交接

如果下一步是交互式安装或修复，请移交给：

- `配置 ecc`

如果下一步是重叠清理或目录审查，请移交给：

- `技能盘点`

如果下一步是更广泛的上下文修剪，请移交给：

- `战略紧凑`

## 输出格式

按以下顺序返回结果：```text
STACK
- language/framework/runtime summary

DAILY
- always-loaded items with evidence

LIBRARY
- searchable/reference items with evidence

INSTALL PLAN
- what should be installed, removed, or routed

VERIFICATION
- checks run and remaining gaps
```
