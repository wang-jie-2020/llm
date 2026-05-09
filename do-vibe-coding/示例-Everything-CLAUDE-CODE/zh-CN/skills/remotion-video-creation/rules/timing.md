---
name: timing
description: Remotion 中的插值曲线 - 线性、缓动、弹簧动画metadata:
  tags: spring, bounce, easing, interpolation
---
使用“interpolate”函数完成简单的线性插值。```ts title="Going from 0 to 1 over 100 frames"
import {interpolate} from 'remotion';

const opacity = interpolate(frame, [0, 100], [0, 1]);
```
默认情况下，这些值不会被限制，因此该值可能会超出范围 [0, 1]。
以下是如何夹紧它们：```ts title="Going from 0 to 1 over 100 frames with extrapolation"
const opacity = interpolate(frame, [0, 100], [0, 1], {
  extrapolateRight: 'clamp',
  extrapolateLeft: 'clamp',
});
```
## 春天动画

弹簧动画有更自然的运动。
随着时间的推移，它们从 0 变为 1。```ts title="Spring animation from 0 to 1 over 100 frames"
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

const frame = useCurrentFrame();
const {fps} = useVideoConfig();

const scale = spring({
  frame,
  fps,
});
```
### 物理特性

默认配置为：“质量：1，阻尼：10，刚度：100”。
这会导致动画在稳定之前有一点反弹。

该配置可以像这样被覆盖：```ts
const scale = spring({
  frame,
  fps,
  config: {damping: 200},
});
```
无反弹的自然运动的推荐配置是：“{damping: 200}”。

以下是一些常见的配置：```tsx
const smooth = {damping: 200}; // Smooth, no bounce (subtle reveals)
const snappy = {damping: 20, stiffness: 200}; // Snappy, minimal bounce (UI elements)
const bouncy = {damping: 8}; // Bouncy entrance (playful animations)
const heavy = {damping: 15, stiffness: 80, mass: 2}; // Heavy, slow, small bounce
```
### 延迟

默认情况下，动画立即开始。
使用“delay”参数将动画延迟一定数量的帧。```tsx
const entrance = spring({
  frame: frame - ENTRANCE_DELAY,
  fps,
  delay: 20,
});
```
### 持续时间

`spring()` 具有基于物理属性的自然持续时间。
要将动画拉伸到特定的持续时间，请使用“durationInFrames”参数。```tsx
const spring = spring({
  frame,
  fps,
  durationInFrames: 40,
});
```
### 将 spring() 与 interpolate() 结合起来

将弹簧输出 (0-1) 映射到自定义范围：```tsx
const springProgress = spring({
  frame,
  fps,
});

// Map to rotation
const rotation = interpolate(springProgress, [0, 1], [0, 360]);

<div style={{rotate: rotation + 'deg'}} />;
```
### 添加弹簧

Springs 仅返回数字，因此可以执行数学运算：```tsx
const frame = useCurrentFrame();
const {fps, durationInFrames} = useVideoConfig();

const inAnimation = spring({
  frame,
  fps,
});
const outAnimation = spring({
  frame,
  fps,
  durationInFrames: 1 * fps,
  delay: durationInFrames - 1 * fps,
});

const scale = inAnimation - outAnimation;
```
## 缓动

可以将缓动添加到“interpolate”函数中：```ts
import {interpolate, Easing} from 'remotion';

const value1 = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.inOut(Easing.quad),
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```
默认缓动是“Easing.线性”。
还有各种其他凸性：

- `Easing.in` 用于缓慢启动和加速
- `Easing.out` 用于快速启动和减速
- `Easing.inOut`

和曲线（从最线性到最弯曲排序）：

- `Easing.quad`
- `Easing.sin`
- `Easing.exp`
- `缓动圈`

需要结合凸面和曲线来实现缓动函数：```ts
const value1 = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.inOut(Easing.quad),
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```
还支持三次贝塞尔曲线：```ts
const value1 = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.bezier(0.8, 0.22, 0.96, 0.65),
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```
