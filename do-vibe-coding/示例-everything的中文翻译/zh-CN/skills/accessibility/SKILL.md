---
name: accessibility
description: 使用 WCAG 2.2 AA 级设计、实施和审核包容性数字产品  standards. Use this skill to generate semantic ARIA for Web and accessibility traits for Web and Native platforms (iOS/Android).
origin: ECC
---
# 辅助功能 (WCAG 2.2)

这项技能可确保数字界面对于所有用户（包括使用屏幕阅读器、开关控件或键盘导航的用户）来说都是可感知的、可操作的、可理解的和稳健的 (POUR)。它重点关注 WCAG 2.2 成功标准的技术实施。

## 何时使用

- 定义 Web、iOS 或 Android 的 UI 组件规范。
- 审核现有代码是否存在可访问性障碍或合规性差距。
- 实施新的 WCAG 2.2 标准，例如目标尺寸（最小）和焦点外观。
- 将高级设计要求映射到技术属性（ARIA 角色、特征、提示）。

## 核心概念

- **POUR 原则**：WCAG 的基础（可感知、可操作、可理解、稳健）。
- **语义映射**：在通用容器上使用本机元素来提供内置的可访问性。
- **辅助功能树**：辅助技术实际“读取”的 UI 表示。
- **焦点管理**：控制键盘/屏幕阅读器光标的顺序和可见性。
- **标签和提示**：通过“aria-label”、“accessibilityLabel”和“contentDescription”提供上下文。

## 它是如何工作的### 第 1 步：确定组件角色

确定功能目的（例如，这是按钮、链接还是选项卡？）。在求助于自定义角色之前，请使用最语义化的可用本机元素。

### 步骤 2：定义可感知的属性

- 确保文本对比度符合 **4.5:1**（正常）或 **3:1**（大/UI）。
- 添加非文本内容（图像、图标）的替代文本。
- 实施响应式回流（高达 400% 缩放且不损失功能）。

### 步骤 3：实施可操作的控制

- 确保最小 **24x24 CSS 像素** 目标尺寸 (WCAG 2.2 SC 2.5.8)。
- 验证所有交互元素均可通过键盘访问并具有可见的焦点指示器 (SC 2.4.11)。
- 提供用于拖动动作的单指针替代方案。

### 步骤 4：确保逻辑可理解

- 使用一致的导航模式。
- 提供描述性错误消息和纠正建议（SC 3.3.3）。
- 实施“冗余输入”（SC 3.3.7）以防止两次请求相同的数据。

### 步骤 5：验证稳健的兼容性

- 使用正确的“名称、角色、值”模式。
- 实施“aria-live”或实时区域以进行动态状态更新。

## 辅助功能架构图```mermaid
flowchart TD
  UI["UI Component"] --> Platform{Platform?}
  Platform -->|Web| ARIA["WAI-ARIA + HTML5"]
  Platform -->|iOS| SwiftUI["Accessibility Traits + Labels"]
  Platform -->|Android| Compose["Semantics + ContentDesc"]

  ARIA --> AT["Assistive Technology (Screen Readers, Switches)"]
  SwiftUI --> AT
  Compose --> AT
```
## 跨平台映射

|特色 |网页 (HTML/ARIA) | iOS（SwiftUI）| Android（撰写）|
| ：------------------ | :------------------------ | ：------------------------------------------------ | :---------------------------------------------------------- |
| **主标签** | `aria-label` / `<标签>` | `.accessibilityLabel()` | `内容描述` |
| **辅助提示** | `咏叹调描述者` | `.accessibilityHint()` | `Modifier.semantics { stateDescription = ... }` |
| **动作角色** | `角色=“按钮”` | `.accessibilityAddTraits(.isButton)` | `Modifier.semantics { role = Role.Button }` |
| **实时更新** | `aria-live="礼貌"` | `.accessibilityLiveRegion(.polite)` | `Modifier.semantics { liveRegion = LiveRegionMode.Polite }` |

## 示例

### 网页：无障碍搜索```html
<form role="search">
  <label for="search-input" class="sr-only">Search products</label>
  <input type="search" id="search-input" placeholder="Search..." />
  <button type="submit" aria-label="Submit Search">
    <svg aria-hidden="true">...</svg>
  </button>
</form>
```
### iOS：可访问的操作按钮```swift
Button(action: deleteItem) {
    Image(systemName: "trash")
}
.accessibilityLabel("Delete item")
.accessibilityHint("Permanently removes this item from your list")
.accessibilityAddTraits(.isButton)
```
### Android：可访问切换```kotlin
Switch(
    checked = isEnabled,
    onCheckedChange = { onToggle() },
    modifier = Modifier.semantics {
        contentDescription = "Enable notifications"
    }
)
```
## 要避免的反模式

- **Div-Buttons**：使用 `<div>` 或 `<span>` 进行单击事件，而不添加角色和键盘支持。
- **仅颜色含义**：仅通过颜色变化（例如，将边框变为红色）指示错误或状态。
- **非包含模态焦点**：不捕获焦点的模态，允许键盘用户在模态打开时导航背景内容。焦点必须被包含并可通过“Escape”键或显式关闭按钮逃脱（WCAG SC 2.1.2）。
- **冗余替代文本**：在替代文本中使用“...的图像”或“...的图片”（屏幕阅读器已经宣布角色“图像”）。

## 最佳实践清单

- [ ] 交互元素满足 **24x24px** (Web) 或 **44x44pt** (Native) 目标尺寸。
- [ ] 对焦指示清晰可见且对比度高。
- [ ] 模态框在打开时**包含焦点**，并在关闭时干净地释放它（“Escape”键或关闭按钮）。
- [ ] 下拉菜单和菜单在关闭时将焦点恢复到触发元素。
- [ ] 表单提供基于文本的错误建议。
- [ ] 所有仅图标按钮都有描述性文本标签。
- [ ] 缩放文本时内容会正确重排。

＃＃ 参考- [WCAG 2.2 指南](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA 创作实践](https://www.w3.org/TR/wai-aria-practices/)
- [iOS 辅助功能编程指南](https://developer.apple.com/documentation/accessibility)
- [iOS 人机界面指南 - 辅助功能](https://developer.apple.com/design/ human-interface-guidelines/accessibility)
- [Android 辅助功能开发人员指南](https://developer.android.com/guide/topics/ui/accessibility)

## 相关技能

- `前端模式`
- `设计系统`
- `液体玻璃设计`
- `swiftui 模式`