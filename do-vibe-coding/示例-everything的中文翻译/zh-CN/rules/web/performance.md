> 此文件使用特定于 Web 的性能内容扩展了 [common/performance.md](../common/performance.md)。

# Web 性能规则

## 核心 Web Vitals 目标

|公制|目标|
|--------|--------|
|液晶聚合物| < 2.5 秒 |
|国际NP | < 200 毫秒 |
| CLS | < 0.1 |
| FCP| < 1.5 秒 |
|技术性贸易试验 | < 200 毫秒 |

## 捆绑预算

|页面类型 | JS 预算（gzip 压缩）| CSS 预算 |
|------------|----------|------------|
|登陆页面 | < 150kb | < 30kb |
|应用页面 | < 300kb | < 50kb |
|微型网站 | < 80kb | < 15kb |

## 加载策略

1. 合理的内联关键首屏 CSS
2. 仅预加载英雄图像和主要字体
3. 推迟非关键的 CSS 或 JS
4.动态导入重库```js
const gsapModule = await import('gsap');
const { ScrollTrigger } = await import('gsap/ScrollTrigger');
```
## 图像优化

- 明确的“宽度”和“高度”
- `loading="eager"` 加上 `fetchpriority="high"` 仅适用于英雄媒体
- 首屏资源的“loading="lazy"”
- 更喜欢带有后备功能的 AVIF 或 WebP
- 切勿发送远远超出渲染尺寸的源图像

## 字体加载

- 最多两个字体系列，除非有明显的例外
- `字体显示：交换`
- 可能的子集
- 仅预加载真正关键的重量/样式

## 动画表演

- 仅限动画合成器友好的属性
- 狭义地使用“will-change”并在完成后将其删除
- 更喜欢 CSS 进行简单的过渡
- 使用`requestAnimationFrame`或已建立的动画库进行JS运动
- 避免滚动处理程序流失；使用 IntersectionObserver 或行为良好的库

## 绩效检查表

- [ ] 所有图像都有明确的尺寸
- [ ] 没有意外渲染阻塞资源
- [ ] 动态内容的布局不会发生变化
- [ ] 运动保持对合成器友好的属性
- [ ] 第三方脚本仅在需要时加载异步/延迟