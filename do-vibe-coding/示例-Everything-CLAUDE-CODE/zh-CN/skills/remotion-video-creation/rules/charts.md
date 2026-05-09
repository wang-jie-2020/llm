---
name: charts
description: 远程的图表和数据可视化模式。在创建条形图、饼图、直方图、进度条或任何数据驱动的动画时使用。metadata:
  tags: charts, data, visualization, bar-chart, pie-chart, graphs
---
# 远程图表

您可以使用常规 React 代码在 Remotion 中创建条形图 - 允许使用 HTML 和 SVG，以及 D3.js。

## 没有动画不是由 `useCurrentFrame()` 支持的

禁用第三方库的所有动画。
它们会在渲染过程中导致闪烁。
相反，从“useCurrentFrame()”驱动所有动画。

## 条形图动画

有关基本示例实现，请参阅[条形图示例](assets/charts/bar-chart.tsx)。

### 交错条

您可以设置条形高度的动画并使其错开，如下所示：```tsx
const STAGGER_DELAY = 5;
const frame = useCurrentFrame();
const {fps} = useVideoConfig();

const bars = data.map((item, i) => {
  const delay = i * STAGGER_DELAY;
  const height = spring({
    frame,
    fps,
    delay,
    config: {damping: 200},
  });
  return <div style={{height: height * item.value}} />;
});
```
## 饼图动画

使用Stroke-dashoffset 对片段进行动画处理，从 12 点钟开始。```tsx
const frame = useCurrentFrame();
const {fps} = useVideoConfig();

const progress = interpolate(frame, [0, 100], [0, 1]);

const circumference = 2 * Math.PI * radius;
const segmentLength = (value / total) * circumference;
const offset = interpolate(progress, [0, 1], [segmentLength, 0]);

<circle r={radius} cx={center} cy={center} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={`${segmentLength} ${circumference}`} strokeDashoffset={offset} transform={`rotate(-90 ${center} ${center})`} />;
```
