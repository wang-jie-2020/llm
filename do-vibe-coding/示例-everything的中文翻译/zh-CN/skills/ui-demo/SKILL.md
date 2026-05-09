---
name: ui-demo
description: 使用 Playwright 录制精美的 UI 演示视频。当用户要求创建 Web 应用程序的演示、演练、屏幕录制或教程视频时使用。制作具有可见光标、自然节奏和专业感觉的 WebM 视频。origin: ECC
---
# UI 演示录像机

使用 Playwright 的视频录制功能，通过注入的光标覆盖、自然的节奏和讲故事流程，录制精美的 Web 应用程序演示视频。

## 何时使用

- 用户要求“演示视频”、“屏幕录制”、“演练”或“教程”
- 用户想要直观地展示功能或工作流程
- 用户需要用于文档、入职培训或利益相关者演示的视频

## 三相过程

每个演示都会经历三个阶段：**发现 -> 排练 -> 录制**。切勿直接跳至录音。

---

## 第一阶段：发现

在编写任何脚本之前，请探索目标页面以了解实际内容。

### 为什么

你无法编写你没有见过的东西。字段可以是“<input>”而不是“<textarea>”，下拉列表可以是自定义组件而不是“<select>”，评论框可以支持“@mentions”或“#tags”。假设会悄无声息地打破录音。

### 如何

导航到流程中的每个页面并转储其交互元素：```javascript
// Run this for each page in the flow BEFORE writing the demo script
const fields = await page.evaluate(() => {
  const els = [];
  document.querySelectorAll('input, select, textarea, button, [contenteditable]').forEach(el => {
    if (el.offsetParent !== null) {
      els.push({
        tag: el.tagName,
        type: el.type || '',
        name: el.name || '',
        placeholder: el.placeholder || '',
        text: el.textContent?.trim().substring(0, 40) || '',
        contentEditable: el.contentEditable === 'true',
        role: el.getAttribute('role') || '',
      });
    }
  });
  return els;
});
console.log(JSON.stringify(fields, null, 2));
```
### 寻找什么

- **表单字段**：它们是“<select>”、“<input>”、自定义下拉列表还是组合框？
- **选择选项**：转储选项值和文本。占位符通常具有看起来非空的 `value="0"` 或 `value=""`。使用 Array.from(el.options).map(o => ({ value: o.value, text: o.text }))`。跳过文本包含“选择”或值为“0”的选项。
- **富文本**：评论框是否支持`@mentions`、`#tags`、markdown 或表情符号？检查占位符文本。
- **必填字段**：哪些字段会阻止表单提交？检查标签中的“required”、“*”，并尝试提交空以查看验证错误。
- **动态内容**：填充其他字段后是否会出现字段？
- **按钮标签**：精确的文本，例如“提交”、“提交请求”或“发送”。
- **表列标题**：对于表驱动模态，将每个“输入[type =“数字”]”映射到其列标题，而不是假设所有数字输入都表示相同的意思。

### 输出

每个页面的字段映射，用于在脚本中编写正确的选择器。例子：```text
/purchase-requests/new:
  - Budget Code: <select> (first select on page, 4 options)
  - Desired Delivery: <input type="date">
  - Context: <textarea> (not input)
  - BOM table: inline-editable cells with span.cursor-pointer -> input pattern
  - Submit: <button> text="Submit"

/purchase-requests/N (detail):
  - Comment: <input placeholder="Type a message..."> supports @user and #PR tags
  - Send: <button> text="Send" (disabled until input has content)
```
---

## 第二阶段：排练

无需录制即可完成所有步骤。验证每个选择器是否解析。

### 为什么

无声选择器故障是演示录音中断的主要原因。在浪费录音之前，排练可以抓住它们。

### 如何

使用“ensureVisible”，一个记录并大声失败的包装器：```javascript
async function ensureVisible(page, locator, label) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    const msg = `REHEARSAL FAIL: "${label}" not found - selector: ${typeof locator === 'string' ? locator : '(locator object)'}`;
    console.error(msg);
    const found = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, input, select, textarea, a'))
        .filter(el => el.offsetParent !== null)
        .map(el => `${el.tagName}[${el.type || ''}] "${el.textContent?.trim().substring(0, 30)}"`)
        .join('\n  ');
    });
    console.error('  Visible elements:\n  ' + found);
    return false;
  }
  console.log(`REHEARSAL OK: "${label}"`);
  return true;
}
```
### 排练脚本结构```javascript
const steps = [
  { label: 'Login email field', selector: '#email' },
  { label: 'Login submit', selector: 'button[type="submit"]' },
  { label: 'New Request button', selector: 'button:has-text("New Request")' },
  { label: 'Budget Code select', selector: 'select' },
  { label: 'Delivery date', selector: 'input[type="date"]:visible' },
  { label: 'Description field', selector: 'textarea:visible' },
  { label: 'Add Item button', selector: 'button:has-text("Add Item")' },
  { label: 'Submit button', selector: 'button:has-text("Submit")' },
];

let allOk = true;
for (const step of steps) {
  if (!await ensureVisible(page, step.selector, step.label)) {
    allOk = false;
  }
}
if (!allOk) {
  console.error('REHEARSAL FAILED - fix selectors before recording');
  process.exit(1);
}
console.log('REHEARSAL PASSED - all selectors verified');
```
### 当排练失败时

1. 读取可见元素转储。
2. 找到正确的选择器。
3.更新脚本。
4. 重新排练。
5. 仅当每个选择器都通过时才继续。

---

## 第三阶段：记录

只有在发现和排练通过后才可以创建录音。

### 录音原则

#### 1. 讲故事流程

将视频计划为一个故事。遵循用户指定的顺序，或使用此默认值：

- **入口**：登录或导航到起点
- **背景**：平移周围环境，以便观众自行定位
- **操作**：执行主要工作流程步骤
- **变体**：显示次要功能，例如设置、主题或本地化
- **结果**：显示结果、确认或新状态

#### 2. 节奏

- 登录后：`4s`
- 导航后：`3s`
- 单击按钮后：`2s`
- 主要步骤之间：`1.5-2s`
- 最后一个动作之后：`3s`
- 打字延迟：每个字符“25-40ms”

#### 3. 光标叠加

注入跟随鼠标移动的 SVG 箭头光标：```javascript
async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
    cursor.style.cssText = `
      position: fixed; z-index: 999999; pointer-events: none;
      width: 24px; height: 24px;
      transition: left 0.1s, top 0.1s;
      filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
    `;
    cursor.style.left = '0px';
    cursor.style.top = '0px';
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  });
}
```
每次页面导航后调用“injectCursor(page)”，因为覆盖层在导航时被破坏。

#### 4.鼠标移动

切勿传送光标。单击之前移动到目标：```javascript
async function moveAndClick(page, locator, label, opts = {}) {
  const { postClickDelay = 800, ...clickOpts } = opts;
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: moveAndClick skipped - "${label}" not visible`);
    return false;
  }
  try {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = await el.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
      await page.waitForTimeout(400);
    }
    await el.click(clickOpts);
  } catch (e) {
    console.error(`WARNING: moveAndClick failed on "${label}": ${e.message}`);
    return false;
  }
  await page.waitForTimeout(postClickDelay);
  return true;
}
```
每个调用都应该包含一个用于调试的描述性“标签”。

#### 5. 打字

直观地键入，而不是即时填充：```javascript
async function typeSlowly(page, locator, text, label, charDelay = 35) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: typeSlowly skipped - "${label}" not visible`);
    return false;
  }
  await moveAndClick(page, el, label);
  await el.fill('');
  await el.pressSequentially(text, { delay: charDelay });
  await page.waitForTimeout(500);
  return true;
}
```
#### 6. 滚动

使用平滑滚动而不是跳跃：```javascript
await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
await page.waitForTimeout(1500);
```
#### 7. 仪表板平移

显示仪表板或概览页面时，将光标移过关键元素：```javascript
async function panElements(page, selector, maxCount = 6) {
  const elements = await page.locator(selector).all();
  for (let i = 0; i < Math.min(elements.length, maxCount); i++) {
    try {
      const box = await elements[i].boundingBox();
      if (box && box.y < 700) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
        await page.waitForTimeout(600);
      }
    } catch (e) {
      console.warn(`WARNING: panElements skipped element ${i} (selector: "${selector}"): ${e.message}`);
    }
  }
}
```
#### 8. 字幕

在视口底部插入字幕栏：```javascript
async function injectSubtitleBar(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-subtitle')) return;
    const bar = document.createElement('div');
    bar.id = 'demo-subtitle';
    bar.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 999998;
      text-align: center; padding: 12px 24px;
      background: rgba(0, 0, 0, 0.75);
      color: white; font-family: -apple-system, "Segoe UI", sans-serif;
      font-size: 16px; font-weight: 500; letter-spacing: 0.3px;
      transition: opacity 0.3s;
      pointer-events: none;
    `;
    bar.textContent = '';
    bar.style.opacity = '0';
    document.body.appendChild(bar);
  });
}

async function showSubtitle(page, text) {
  await page.evaluate((t) => {
    const bar = document.getElementById('demo-subtitle');
    if (!bar) return;
    if (t) {
      bar.textContent = t;
      bar.style.opacity = '1';
    } else {
      bar.style.opacity = '0';
    }
  }, text);
  if (text) await page.waitForTimeout(800);
}
```
每次导航后，与“injectCursor(page)”一起调用“injectSubtitleBar(page)”。

使用模式：```javascript
await showSubtitle(page, 'Step 1 - Logging in');
await showSubtitle(page, 'Step 2 - Dashboard overview');
await showSubtitle(page, '');
```
指南：

- 保持字幕文本简短，最好少于 60 个字符。
- 使用“第 N 步 - 操作”格式以保持一致性。
- 在长时间停顿期间清除字幕，此时用户界面可以自己说话。

## 脚本模板```javascript
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:3000';
const VIDEO_DIR = path.join(__dirname, 'screenshots');
const OUTPUT_NAME = 'demo-FEATURE.webm';
const REHEARSAL = process.argv.includes('--rehearse');

// Paste injectCursor, injectSubtitleBar, showSubtitle, moveAndClick,
// typeSlowly, ensureVisible, and panElements here.

(async () => {
  const browser = await chromium.launch({ headless: true });

  if (REHEARSAL) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    // Navigate through the flow and run ensureVisible for each selector.
    await browser.close();
    return;
  }

  const context = await browser.newContext({
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    await injectCursor(page);
    await injectSubtitleBar(page);

    await showSubtitle(page, 'Step 1 - Logging in');
    // login actions

    await page.goto(`${BASE_URL}/dashboard`);
    await injectCursor(page);
    await injectSubtitleBar(page);
    await showSubtitle(page, 'Step 2 - Dashboard overview');
    // pan dashboard

    await showSubtitle(page, 'Step 3 - Main workflow');
    // action sequence

    await showSubtitle(page, 'Step 4 - Result');
    // final reveal
    await showSubtitle(page, '');
  } catch (err) {
    console.error('DEMO ERROR:', err.message);
  } finally {
    await context.close();
    const video = page.video();
    if (video) {
      const src = await video.path();
      const dest = path.join(VIDEO_DIR, OUTPUT_NAME);
      try {
        fs.copyFileSync(src, dest);
        console.log('Video saved:', dest);
      } catch (e) {
        console.error('ERROR: Failed to copy video:', e.message);
        console.error('  Source:', src);
        console.error('  Destination:', dest);
      }
    }
    await browser.close();
  }
})();
```
用法：```bash
# Phase 2: Rehearse
node demo-script.cjs --rehearse

# Phase 3: Record
node demo-script.cjs
```
## 录制前的检查清单

- [ ] 发现阶段已完成
- [ ] 排练通过，所有选择器均正常
- [ ] 无头模式已启用
- [ ] 分辨率设置为“1280x720”
- [ ] 每次导航后重新注入光标和字幕覆盖
- [ ] `showSubtitle(page, 'Step N - ...')` 用于主要过渡
- [ ] `moveAndClick` 用于所有带有描述性标签的点击
- [ ] `typeSlowly` 用于可见输入
- [ ] 没有静音捕获；助手记录警告
- [ ] 平滑滚动用于内容显示
- [ ] 人类观看者可以看到按键暂停
- [ ] 流程与请求的故事顺序相匹配
- [ ] 脚本反映了第一阶段发现的实际 UI

## 常见陷阱

1. 导航后光标消失 - 重新插入。
2. 视频太快 - 添加暂停。
3. 光标是一个点而不是箭头 - 使用 SVG 叠加。
4. 光标传送 - 在点击之前移动。
5. 选择看起来错误的下拉菜单 - 显示移动，然后选择选项。
6. 模态感觉生硬 - 在确认之前添加阅读暂停。
7. 视频文件路径是随机的 - 将其复制到稳定的输出名称。
8. 选择器失败会被吞掉——永远不要使用静默的 catch 块。
9. 假定字段类型 - 首先发现它们。10. 假定功能 - 在编写脚本之前检查实际的 UI。
11. 占位符选择值看起来很真实 - 观察“0”和“Select...”。
12. 弹出窗口创建单独的视频 - 明确捕获弹出页面并在需要时合并。