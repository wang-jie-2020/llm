---
name: project-flow-ops
description: 通过分类问题和拉取请求、链接活动工作并保持 GitHub 面向公众，同时 Linear 保留内部执行层，跨 GitHub 和 Linear 操作执行流。当用户需要积压控制、PR 分类或 GitHub 到线性协调时使用。origin: ECC
---
# 项目流程操作

这项技能将互不相关的 GitHub 问题、PR 和线性任务转变为一个执行流程。

当问题是协调而不是编码时使用它。

## 何时使用

- 分类开放 PR 或问题积压
- 决定什么属于 Linear 和什么应该保留在 GitHub 上
- 将活跃的 GitHub 工作链接到内部执行通道
- 将 PR 分类为合并、移植/重建、关闭或停放
- 审核审核评论、CI 失败或陈旧问题是否阻碍执行

## 运营模式

- **GitHub** 是公众和社区的真相
- **线性**是活动计划工作的内部执行事实
- 并非每个 GitHub 问题都需要线性问题
- 仅当工作是以下情况时才创建或更新 Linear：
  - 活跃
  - 委托
  - 预定的
  - 跨职能
  - 足够重要以进行内部跟踪

## 核心工作流程

### 1.首先阅读公共表面

收集：

- GitHub 问题或 PR 状态
- 作者和分支状态
- 评论评论
- CI状态
- 相关问题

### 2. 对工作进行分类

每个项目最终都应处于以下状态之一：

|状态|意义|
|--------|---------|
|合并|独立、符合政策、准备就绪 ||移植/重建|有用的想法，但应该手动重新登陆 ECC |
|关闭 |方向错误、过时、不安全或重复 |
|公园 |可能有用，但现在尚未安排|

### 3. 决定 Linear 是否有保证

仅在以下情况下创建或更新 Linear：

- 执行是积极计划的
- 涉及多个存储库或工作流
- 工作需要内部所有权或排序
- 该问题是更大程序通道的一部分

不要机械地镜像一切。

### 4.保持两个系统一致

当工作活跃时：

- GitHub 问题/PR 应该公开说明正在发生的事情
- Linear 应在内部跟踪所有者、优先级和执行通道

当作品发货或被拒绝时：

- 将公开决议发布回 GitHub
- 相应地标记线性任务

## 审核规则

- 切勿仅根据标题、摘要或信任进行合并；使用完整的差异
- 当外部源功能有价值但不独立时，应在 ECC 内重建它们
- CI红色表示分类并修复或阻止；不要假装它已准备好合并
- 如果真正的障碍是产品方向，请直接说出来，而不是躲在工具后面

## 输出格式

返回：```text
PUBLIC STATUS
- issue / PR state
- CI / review state

CLASSIFICATION
- merge / port-rebuild / close / park
- one-paragraph rationale

LINEAR ACTION
- create / update / no Linear item needed
- project / lane if applicable

NEXT OPERATOR ACTION
- exact next move
```
## 好的用例

-“审核未完成的 PR 积压工作，并告诉我要合并什么、要重建什么”
-“将 GitHub 问题映射到我们的 ECC 1.x 和 ECC 2.0 程序通道”
-“检查这是否需要线性问题或者应该仅保留 GitHub”