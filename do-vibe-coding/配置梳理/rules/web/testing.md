> 此文件使用特定于 Web 的测试内容扩展了 [common/testing.md](../common/testing.md)。

# 网页测试规则

## 优先顺序

### 1. 视觉回归

- 截图关键断点：320、768、1024、1440
- 测试英雄部分、滚动讲述部分和有意义的状态
- 使用剧作家屏幕截图进行视觉密集型工作
- 如果两个主题都存在，则测试两者

### 2. 辅助功能

- 运行自动可访问性检查
- 测试键盘导航
- 验证减少运动行为
- 验证颜色对比度

### 3. 性能

- 针对有意义的页面运行 Lighthouse 或等效程序
- 保持 CWV 目标不受 [performance.md](performance.md) 影响

### 4.跨浏览器

- 最低：Chrome、Firefox、Safari
- 测试滚动、运动和回退行为

### 5.反应灵敏

- 测试 320、375、768、1024、1440、1920
- 验证没有溢出
- 验证触摸交互

## E2E形状```ts
import { test, expect } from '@playwright/test';

test('landing hero loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```
- 避免不稳定的基于超时的断言
- 更喜欢确定性等待

## 单元测试

- 测试实用程序、数据转换和自定义挂钩
- 对于高度可视化的组件，视觉回归通常比脆弱的标记断言携带更多信号
- 视觉回归补充了覆盖目标；它不会取代它们