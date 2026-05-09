> 此文件使用特定于 Web 的前端内容扩展了 [common/coding-style.md](../common/coding-style.md)。

# 网页编码风格

## 文件组织

按功能或表面积组织，而不是按文件类型组织：```text
src/
├── components/
│   ├── hero/
│   │   ├── Hero.tsx
│   │   ├── HeroVisual.tsx
│   │   └── hero.css
│   ├── scrolly-section/
│   │   ├── ScrollySection.tsx
│   │   ├── StickyVisual.tsx
│   │   └── scrolly.css
│   └── ui/
│       ├── Button.tsx
│       ├── SurfaceCard.tsx
│       └── AnimatedText.tsx
├── hooks/
│   ├── useReducedMotion.ts
│   └── useScrollProgress.ts
├── lib/
│   ├── animation.ts
│   └── color.ts
└── styles/
    ├── tokens.css
    ├── typography.css
    └── global.css
```
## CSS 自定义属性

将设计标记定义为变量。不要重复对调色板、版式或间距进行硬编码：```css
:root {
  --color-surface: oklch(98% 0 0);
  --color-text: oklch(18% 0 0);
  --color-accent: oklch(68% 0.21 250);

  --text-base: clamp(1rem, 0.92rem + 0.4vw, 1.125rem);
  --text-hero: clamp(3rem, 1rem + 7vw, 8rem);

  --space-section: clamp(4rem, 3rem + 5vw, 10rem);

  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```
## 仅动画属性

更喜欢合成器友好的运动：
- `变换`
- `不透明度`
- `剪辑路径`
- “过滤器”（谨慎）

避免对布局绑定属性进行动画处理：
- `宽度`
- `高度`
- `顶部`
- `左`
- `保证金`
- `填充`
- `边界`
- `字体大小`

## 语义 HTML 优先```html
<header>
  <nav aria-label="Main navigation">...</nav>
</header>
<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">...</h1>
  </section>
</main>
<footer>...</footer>
```
当语义元素存在时，不要使用通用包装器“div”堆栈。

## 命名

- 组件：PascalCase（`ScrollySection`、`SurfaceCard`）
- 挂钩：`use` 前缀 (`useReducedMotion`)
- CSS 类：kebab-case 或实用程序类
- 动画时间线：带有意图的驼峰命名法 (`heroRevealTl`)