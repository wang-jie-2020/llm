---
name: click-path-audit
description: "通过其完整的状态更改序列跟踪每个面向用户的按钮/接触点，以查找功能单独工作但相互抵消、产生错误的最终状态或使 UI 处于不一致状态的错误。使用时间：系统调试未发现错误，但用户报告按钮损坏，或者在涉及共享状态存储的任何重大重构之后。"origin: community
---
# /click-path-audit — 行为流审核

查找静态代码读取遗漏的错误：状态交互副作用、顺序调用之间的竞争条件以及默默地相互撤消的处理程序。

## 这解决的问题

传统的调试检查：
- 该功能存在吗？ （缺少接线）
- 它会崩溃吗？ （运行时错误）
- 它返回正确的类型吗？ （数据流）

但它不检查：
- **最终的 UI 状态是否与按钮标签所承诺的相符？**
- **函数 B 是否会默默地撤销函数 A 刚刚所做的事情？**
- **共享状态（Zustand/Redux/context）是否具有取消预期操作的副作用？**

真实示例：“新电子邮件”按钮调用“setComposeMode(true)”，然后调用“selectThread(null)”。两人都是单独工作。但是“selectThread”有一个副作用，即重置“composeMode: false”。该按钮什么也没做。系统调试发现了 54 个 bug——这一个被遗漏了。

---

## 它是如何工作的

对于目标区域中的每个交互式接触点：```
1. IDENTIFY the handler (onClick, onSubmit, onChange, etc.)
2. TRACE every function call in the handler, IN ORDER
3. For EACH function call:
   a. What state does it READ?
   b. What state does it WRITE?
   c. Does it have SIDE EFFECTS on shared state?
   d. Does it reset/clear any state as a side effect?
4. CHECK: Does any later call UNDO a state change from an earlier call?
5. CHECK: Is the FINAL state what the user expects from the button label?
6. CHECK: Are there race conditions (async calls that resolve in wrong order)?
```
---

## 执行步骤

### 第 1 步：映射状态存储

在审核任何接触点之前，构建每个状态存储操作的副作用图：```
For each Zustand store / React context in scope:
  For each action/setter:
    - What fields does it set?
    - Does it RESET other fields as a side effect?
    - Document: actionName → {sets: [...], resets: [...]}
```
这是关键的参考。如果不知道“selectThread”重置“composeMode”，“新电子邮件”错误是不可见的。

**输出格式：**```
STORE: emailStore
  setComposeMode(bool) → sets: {composeMode}
  selectThread(thread|null) → sets: {selectedThread, selectedThreadId, messages, drafts, selectedDraft, summary} RESETS: {composeMode: false, composeData: null, redraftOpen: false}
  setDraftGenerating(bool) → sets: {draftGenerating}
  ...

DANGEROUS RESETS (actions that clear state they don't own):
  selectThread → resets composeMode (owned by setComposeMode)
  reset → resets everything
```
### 第 2 步：审核每个接触点

对于目标区域中提交的每个按钮/切换/表单：```
TOUCHPOINT: [Button label] in [Component:line]
  HANDLER: onClick → {
    call 1: functionA() → sets {X: true}
    call 2: functionB() → sets {Y: null} RESETS {X: false}  ← CONFLICT
  }
  EXPECTED: User sees [description of what button label promises]
  ACTUAL: X is false because functionB reset it
  VERDICT: BUG — [description]
```
**检查每个错误模式：**

#### 模式 1：顺序撤消```
handler() {
  setState_A(true)     // sets X = true
  setState_B(null)     // side effect: resets X = false
}
// Result: X is false. First call was pointless.
```
#### 模式 2：异步竞赛```
handler() {
  fetchA().then(() => setState({ loading: false }))
  fetchB().then(() => setState({ loading: true }))
}
// Result: final loading state depends on which resolves first
```
#### 模式 3：过时的闭包```
const [count, setCount] = useState(0)
const handler = useCallback(() => {
  setCount(count + 1)  // captures stale count
  setCount(count + 1)  // same stale count — increments by 1, not 2
}, [count])
```
#### 模式 4：缺少状态转换```
// Button says "Save" but handler only validates, never actually saves
// Button says "Delete" but handler sets a flag without calling the API
// Button says "Send" but the API endpoint is removed/broken
```
#### 模式 5：条件死路径```
handler() {
  if (someState) {        // someState is ALWAYS false at this point
    doTheActualThing()    // never reached
  }
}
```
#### 模式 6：useEffect 干扰```
// Button sets stateX = true
// A useEffect watches stateX and resets it to false
// User sees nothing happen
```
### 第 3 步：报告

对于发现的每个错误：```
CLICK-PATH-NNN: [severity: CRITICAL/HIGH/MEDIUM/LOW]
  Touchpoint: [Button label] in [file:line]
  Pattern: [Sequential Undo / Async Race / Stale Closure / Missing Transition / Dead Path / useEffect Interference]
  Handler: [function name or inline]
  Trace:
    1. [call] → sets {field: value}
    2. [call] → RESETS {field: value}  ← CONFLICT
  Expected: [what user expects]
  Actual: [what actually happens]
  Fix: [specific fix]
```
---

## 范围控制

这次审计的费用很高。适当地确定范围：

- **完整的应用程序审核：** 在启动时或重大重构后使用。每页启动并行代理。
- **单页审核：** 在构建新页面或用户报告损坏的按钮后使用。
- **以商店为中心的审核：** 修改 Zustand 商店后使用 - 审核更改操作的所有消费者。

### 完整应用程序的推荐代理拆分：```
Agent 1: Map ALL state stores (Step 1) — this is shared context for all other agents
Agent 2: Dashboard (Tasks, Notes, Journal, Ideas)
Agent 3: Chat (DanteChatColumn, JustChatPage)
Agent 4: Emails (ThreadList, DraftArea, EmailsPage)
Agent 5: Projects (ProjectsPage, ProjectOverviewTab, NewProjectWizard)
Agent 6: CRM (all sub-tabs)
Agent 7: Profile, Settings, Vault, Notifications
Agent 8: Management Suite (all pages)
```
代理 1 必须首先完成。它的输出是所有其他代理的输入。

---

## 何时使用

- 系统调试后发现“没有错误”，但用户报告 UI 损坏
- 修改任何 Zustand 存储操作后（检查所有调用者）
- 在任何涉及共享状态的重构之后
- 发布前，关于关键用户流程
- 当一个按钮“什么都不做”时——这就是解决这个问题的工具

## 何时不使用

- 对于 API 级错误（错误的响应形状、缺少端点）——使用系统调试
- 对于样式/布局问题 - 目视检查
- 对于性能问题——分析工具

---

## 与其他技能的整合

- 在 `/superpowers:systematic-debugging` 之后运行（找到其他 54 个错误类型）
- 在 `/superpowers:verification-before-completion` 之前运行（验证修复工作）
- 馈入“/superpowers:test-driven-development”——这里发现的每个错误都应该进行测试

---

## 示例：激发此技能的错误

**ThreadList.tsx“新电子邮件”按钮：**```
onClick={() => {
  useEmailStore.getState().setComposeMode(true)   // ✓ sets composeMode = true
  useEmailStore.getState().selectThread(null)      // ✗ RESETS composeMode = false
}}
```
店铺定义：```
selectThread: (thread) => set({
  selectedThread: thread,
  selectedThreadId: thread?.id ?? null,
  messages: [],
  drafts: [],
  selectedDraft: null,
  summary: null,
  composeMode: false,     // ← THIS silent reset killed the button
  composeData: null,
  redraftOpen: false,
})
```
**系统调试错过了它**因为：
- 该按钮有一个 onClick 处理程序（未死）
- 两种功能均存在（无遗漏接线）
- 两个函数都不会崩溃（没有运行时错误）
- 数据类型正确（没有类型不匹配）

**点击路径审核发现了它**，因为：
- 第 1 步映射 `selectThread` 重置 `composeMode`
- 步骤 2 跟踪处理程序：调用 1 设置 true，调用 2 重置 false
- 结论：顺序撤消 - 最终状态与按钮意图相矛盾