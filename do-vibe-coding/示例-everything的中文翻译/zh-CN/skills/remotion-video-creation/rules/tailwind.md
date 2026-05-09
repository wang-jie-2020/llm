---
name: tailwind
description: 在 Remotion 中使用 TailwindCSS。metadata:
---
如果项目中安装了 TailwindCSS，您可以而且应该在 Remotion 中使用 TailwindCSS。

不要使用 `transition-*` 或 `animate-*` 类 - 始终使用 `useCurrentFrame()` 挂钩进行动画处理。

必须首先在 Remotion 项目中安装并启用 Tailwind - 使用 WebFetch 获取 <https://www.remotion.dev/docs/tailwind> 以获取说明。