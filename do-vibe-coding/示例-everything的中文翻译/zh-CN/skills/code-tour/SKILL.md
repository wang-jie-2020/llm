---
name: code-tour
description: 创建 CodeTour `.tour` 文件 — 使用真实文件和行锚点进行针对角色的分步演练。用于入职参观、架构演练、公关参观、RCA 参观以及结构化的“解释其工作原理”请求。origin: ECC
---
# 代码之旅

创建 **CodeTour** `.tour` 文件用于直接打开真实文件和行范围的代码库演练。游览位于“.tours/”中，适用于 CodeTour 格式，而不是临时的 Markdown 注释。

好的游览是针对特定读者的叙述：
- 他们在看什么
- 为什么这很重要
- 他们下一步应该走什么路

仅创建 `.tour` JSON 文件。作为此技能的一部分，请勿修改源代码。

## 何时使用

在以下情况下使用此技能：
- 用户要求进行代码导览、入门导览、架构演练或公关导览
- 用户说“解释一下 X 是如何工作的”并想要一个可重复使用的引导工件
- 用户希望为新工程师或审阅者提供一条提升路径
- 通过引导序列比简单的总结更好地完成任务

示例：
- 加入新的维护者
- 一项服务或套餐的建筑之旅
- 锚定到更改的文件的公关审查演练
- RCA 巡演显示故障路径
- 信任边界和密钥检查的安全审查之旅

## 何时不使用

|而不是代码之旅 |使用 |
| --- | --- |
|聊天中一次性解释就够了 |直接回答 ||用户想要散文文档，而不是“.tour”工件 | “文档查找”或存储库文档编辑 |
|任务是实施还是重构 |做好落实工作|
|任务是在没有游览工件的情况下进行广泛的代码库入门 | `代码库入门` |

## 工作流程

### 1. 发现

在编写任何内容之前探索存储库：
- 自述文件和包/应用程序入口点
- 文件夹结构
- 相关配置文件
- 如果巡演以公关为重点，则更改文件

在了解代码的结构之前，不要开始编写步骤。

### 2. 推断读者

根据请求确定角色和深度。

|请求形状 |角色|建议深度|
| --- | --- | --- |
| “入职”、“新加入者”| `新加入者` | 9-13 步骤 |
| “快速浏览”、“氛围检查” | `vibecoder` | 5-8 个步骤 |
| “建筑”| `建筑师` | 14-18 步 |
| “浏览此公关” | `公关审稿人` | 7-11 步骤 |
| “为什么会破裂”| `RCA-调查员` | 7-11 步骤 |
| “安全审查”| `安全审查员` | 7-11 步骤 |
| “解释一下这个功能是如何工作的” | `功能解释器` | 7-11 步骤 |
| “调试此路径” | `错误修复程序` | 7-11 步骤 |

### 3.读取并验证锚点每个文件路径和行锚点都必须是真实的：
- 确认文件存在
- 确认行号在范围内
- 如果使用选择，请验证确切的块
- 如果文件不稳定，则更喜欢基于模式的锚点

永远不要猜测行号。

### 4.编写`.tour`

写信给：```text
.tours/<persona>-<focus>.tour
```
保持路径的确定性和可读性。

### 5. 验证

完成之前：
- 每个引用的路径都存在
- 每行或选择均有效
- 第一步锚定到真实的文件或目录
- 游览讲述一个连贯的故事，而不是列出文件

## 步骤类型

### 内容

谨慎使用，通常仅用于结束步骤：```json
{ "title": "Next Steps", "description": "You can now trace the request path end to end." }
```
不要让第一步只包含内容。

### 目录

用于将读者定向到模块：```json
{ "directory": "src/services", "title": "Service Layer", "description": "The core orchestration logic lives here." }
```
### 文件+行

这是默认的步骤类型：```json
{ "file": "src/auth/middleware.ts", "line": 42, "title": "Auth Gate", "description": "Every protected request passes here first." }
```
### 选择

当一个代码块比整个文件更重要时使用：```json
{
  "file": "src/core/pipeline.ts",
  "selection": {
    "start": { "line": 15, "character": 0 },
    "end": { "line": 34, "character": 0 }
  },
  "title": "Request Pipeline",
  "description": "This block wires validation, auth, and downstream execution."
}
```
### 模式

当精确的线条可能发生漂移时使用：```json
{ "file": "src/app.ts", "pattern": "export default class App", "title": "Application Entry" }
```
### URI

有帮助时用于 PR、问题或文档：```json
{ "uri": "https://github.com/org/repo/pull/456", "title": "The PR" }
```
## 书写规则：SMIG

每个描述都应该回答：
- **情况**：读者正在看什么
- **机制**：它是如何工作的
- **含义**：为什么它对这个角色很重要
- **陷阱**：聪明的读者可能会错过什么

保持描述紧凑、具体，并以实际代码为基础。

## 叙事形状

除非任务明显需要不同的东西，否则使用此弧线：
1. 方向
2.模块图
3.核心执行路径
4. 边缘情况或陷阱
5. 结束/下一步行动

这次旅行应该感觉像是一条路径，而不是一个清单。

＃＃ 例子```json
{
  "$schema": "https://aka.ms/codetour-schema",
  "title": "API Service Tour",
  "description": "Walkthrough of the request path for the payments service.",
  "ref": "main",
  "steps": [
    {
      "directory": "src",
      "title": "Source Root",
      "description": "All runtime code for the service starts here."
    },
    {
      "file": "src/server.ts",
      "line": 12,
      "title": "Entry Point",
      "description": "The server boots here and wires middleware before any route is reached."
    },
    {
      "file": "src/routes/payments.ts",
      "line": 8,
      "title": "Payment Routes",
      "description": "Every payments request enters through this router before hitting service logic."
    },
    {
      "title": "Next Steps",
      "description": "You can now follow any payment request end to end with the main anchors in place."
    }
  ]
}
```
## 反模式

|反模式|修复 |
| --- | --- |
|平面文件列表|讲述步骤之间具有依赖性的故事 |
|通用描述 |命名具体的代码路径或模式 |
|猜测的锚|首先验证每个文件和行 |
|步骤太多，无法快速浏览 |积极削减 |
|第一步仅包含内容 |将第一步锚定到真实文件或目录 |
|角色不匹配|为实际读者而不是一般工程师编写|

## 最佳实践

- 保持步数与存储库大小和角色深度成正比
- 使用目录步骤进行定位，使用文件步骤进行实质内容
- 对于公关巡演，首先覆盖更改的文件
- 对于 monorepos，范围涉及相关包，而不是浏览所有内容
- 以读者现在可以做的事情结束，而不是回顾

## 相关技能

- `代码库入门`
- `编码标准`
-`理事会`
- 官方上游格式：`microsoft/codetour`