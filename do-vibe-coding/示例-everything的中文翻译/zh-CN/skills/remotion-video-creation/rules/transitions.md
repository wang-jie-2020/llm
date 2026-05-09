---
name: transitions
description: 远程的全屏场景转换。metadata:
  tags: transitions, fade, slide, wipe, scenes
---
## 全屏过渡

使用“<TransitionSeries>”在多个场景或剪辑之间制作动画。
这绝对会给孩子定位。

## 先决条件

首先，需要安装@remotion/transitions 包。
如果不是，请使用以下命令：```bash
npx remotion add @remotion/transitions # If project uses npm
bunx remotion add @remotion/transitions # If project uses bun
yarn remotion add @remotion/transitions # If project uses yarn
pnpm exec remotion add @remotion/transitions # If project uses pnpm
```
## 用法示例```tsx
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 15})} />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```
## 可用的转换类型

从各自的模块导入过渡：```tsx
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {flip} from '@remotion/transitions/flip';
import {clockWipe} from '@remotion/transitions/clock-wipe';
```
## 带方向的滑动过渡

指定进入/退出动画的滑动方向。```tsx
import {slide} from '@remotion/transitions/slide';

<TransitionSeries.Transition presentation={slide({direction: 'from-left'})} timing={linearTiming({durationInFrames: 20})} />;
```
方向：“从左”、“从右”、“从上”、“从下”

## 计时选项```tsx
import {linearTiming, springTiming} from '@remotion/transitions';

// Linear timing - constant speed
linearTiming({durationInFrames: 20});

// Spring timing - organic motion
springTiming({config: {damping: 200}, durationInFrames: 25});
```
## 持续时间计算

过渡重叠相邻场景，因此总合成长度比所有序列持续时间的总和**短**。

例如，有两个 60 帧序列和一个 15 帧过渡：

- 没有过渡：“60 + 60 = 120”帧
- 带过渡：`60 + 60 - 15 = 105` 帧

过渡持续时间会被减去，因为两个场景在过渡期间同时播放。

### 获取转换的持续时间

在计时对象上使用“getDurationInFrames()”方法：```tsx
import {linearTiming, springTiming} from '@remotion/transitions';

const linearDuration = linearTiming({durationInFrames: 20}).getDurationInFrames({fps: 30});
// Returns 20

const springDuration = springTiming({config: {damping: 200}}).getDurationInFrames({fps: 30});
// Returns calculated duration based on spring physics
```
对于没有显式“durationInFrames”的“springTiming”，持续时间取决于“fps”，因为它计算弹簧动画何时稳定。

### 计算总的乐曲持续时间```tsx
import {linearTiming} from '@remotion/transitions';

const scene1Duration = 60;
const scene2Duration = 60;
const scene3Duration = 60;

const timing1 = linearTiming({durationInFrames: 15});
const timing2 = linearTiming({durationInFrames: 20});

const transition1Duration = timing1.getDurationInFrames({fps: 30});
const transition2Duration = timing2.getDurationInFrames({fps: 30});

const totalDuration = scene1Duration + scene2Duration + scene3Duration - transition1Duration - transition2Duration;
// 60 + 60 + 60 - 15 - 20 = 145 frames
```
