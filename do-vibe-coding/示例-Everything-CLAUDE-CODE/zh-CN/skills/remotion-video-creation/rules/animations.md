---
name: animations
description: Remotion 的基本动画技能metadata:
  tags: animations, transitions, frames, useCurrentFrame
---
所有动画必须由“useCurrentFrame()”挂钩驱动。
在几秒钟内编写动画并将其乘以“useVideoConfig()”中的“fps”值。```tsx
import { useCurrentFrame } from "remotion";

export const FadeIn = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ opacity }}>Hello World!</div>
  );
};
```
CSS 过渡或动画是禁止的 - 它们将无法正确渲染。
Tailwind 动画类名称是禁止的 - 它们将无法正确渲染。