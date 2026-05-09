> 此文件使用特定于 Web 的模式扩展了 [common/patterns.md](../common/patterns.md)。

# 网页模式

## 组件构成

### 复合组件

当相关 UI 共享状态和交互语义时，使用复合组件：```tsx
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">...</Tabs.Content>
  <Tabs.Content value="settings">...</Tabs.Content>
</Tabs>
```
- 父母拥有国家
- 孩子们通过情境进行消费
- 对于复杂的小部件，更喜欢这个而不是支柱钻孔

### 渲染道具/插槽

- 当行为共享但标记必须不同时，使用渲染道具或插槽模式
- 将键盘处理、ARIA 和焦点逻辑保留在无头层中

### 容器/展示分割

- 容器组件自己的数据加载和副作用
- 展示组件接收道具并渲染 UI
- 展示组件应该保持纯粹

## 状态管理

分别对待这些：

|关注|模具|
|---------|---------|
|服务器状态| TanStack 查询、SWR、tRPC |
|客户端状态 | Zustand、Jotai、信号 |
| URL 状态 |搜索参数、路线段 |
|表格状态| React Hook Form 或同等形式 |

- 不要将服务器状态复制到客户端存储中
- 导出值而不是存储冗余的计算状态

## URL 作为状态

在 URL 中保留可共享状态：
- 过滤器
- 排序顺序
- 分页
- 活动选项卡
- 搜索查询

## 数据获取

### 重新验证时过时

- 立即返回缓存数据
- 在后台重新验证
- 更喜欢现有的库而不是手动滚动它

### 乐观更新- 快照当前状态
- 应用乐观更新
- 失败时回滚
- 回滚时发出可见的错误反馈

### 并行加载

- 并行获取独立数据
- 避免亲子请求瀑布
- 在合理时预取可能的下一个路线或状态