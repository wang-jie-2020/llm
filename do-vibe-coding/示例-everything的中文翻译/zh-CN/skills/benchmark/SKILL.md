---
name: benchmark
description: 使用此技能来衡量性能基线、检测 PR 之前/之后的回归以及比较堆栈替代方案。origin: ECC
---
# 基准 - 性能基准和回归检测

## 何时使用

- 在 PR 之前和之后衡量性能影响
- 为项目设置绩效基准
- 当用户报告“感觉很慢”时
- 发布前 — 确保您达到绩效目标
- 将您的堆栈与替代方案进行比较

## 它是如何工作的

### 模式 1：页面性能

通过浏览器 MCP 测量真实的浏览器指标：```
1. Navigate to each target URL
2. Measure Core Web Vitals:
   - LCP (Largest Contentful Paint) — target < 2.5s
   - CLS (Cumulative Layout Shift) — target < 0.1
   - INP (Interaction to Next Paint) — target < 200ms
   - FCP (First Contentful Paint) — target < 1.8s
   - TTFB (Time to First Byte) — target < 800ms
3. Measure resource sizes:
   - Total page weight (target < 1MB)
   - JS bundle size (target < 200KB gzipped)
   - CSS size
   - Image weight
   - Third-party script weight
4. Count network requests
5. Check for render-blocking resources
```
### 模式 2：API 性能

基准 API 端点：```
1. Hit each endpoint 100 times
2. Measure: p50, p95, p99 latency
3. Track: response size, status codes
4. Test under load: 10 concurrent requests
5. Compare against SLA targets
```
### 模式 3：构建性能

衡量开发反馈循环：```
1. Cold build time
2. Hot reload time (HMR)
3. Test suite duration
4. TypeScript check time
5. Lint time
6. Docker build time
```
### 模式 4：前后比较

在更改之前和之后运行以衡量影响：```
/benchmark baseline    # saves current metrics
# ... make changes ...
/benchmark compare     # compares against baseline
```
输出：```
| Metric | Before | After | Delta | Verdict |
|--------|--------|-------|-------|---------|
| LCP | 1.2s | 1.4s | +200ms | WARNING: WARN |
| Bundle | 180KB | 175KB | -5KB | ✓ BETTER |
| Build | 12s | 14s | +2s | WARNING: WARN |
```
## 输出

将基线以 JSON 形式存储在 `.ecc/benchmarks/` 中。 Git 跟踪，因此团队共享基线。

## 整合

- CI：在每个 PR 上运行“/基准比较”
- 与“/canary-watch”配对进行部署后监控
- 与“/browser-qa”配对以获得完整的发货前清单