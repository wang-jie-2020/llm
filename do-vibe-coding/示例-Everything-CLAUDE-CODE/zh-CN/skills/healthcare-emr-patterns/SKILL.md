---
name: healthcare-emr-patterns
description: 医疗保健应用的 EMR/EHR 开发模式。临床安全、就诊工作流程、处方生成、临床决策支持集成以及用于医疗数据输入的可访问性优先的 UI。origin: Health1 Super Speciality Hospitals — contributed by Dr. Keyur Patel
version: "1.0.0"
---
# 医疗电子病历发展模式

构建电子病历 (EMR) 和电子健康记录 (EHR) 系统的模式。优先考虑患者安全、临床准确性和医生效率。

## 何时使用

- 建立患者就诊工作流程（投诉、检查、诊断、处方）
- 实施临床笔记（结构化+自由文本+语音转文本）
- 设计处方/药物模块并进行药物相互作用检查
- 集成临床决策支持系统（CDSS）
- 构建实验室结果显示并突出显示参考范围
- 对临床数据实施审计追踪
- 设计用于临床数据输入的医疗保健可访问的用户界面

## 它是如何工作的

### 患者安全第一

每个设计决策都必须根据以下因素进行评估：“这会伤害患者吗？”

- 药物相互作用必须警惕，而不是悄然过去
- 必须以视觉方式标记异常实验室值
- 关键生命体必须触发升级工作流程
- 未经审计追踪，不得修改临床数据

### 单页遭遇流

临床遭遇应该在单个页面上垂直流动——没有选项卡切换：```
Patient Header (sticky — always visible)
├── Demographics, allergies, active medications
│
Encounter Flow (vertical scroll)
├── 1. Chief Complaint (structured templates + free text)
├── 2. History of Present Illness
├── 3. Physical Examination (system-wise)
├── 4. Vitals (auto-trigger clinical scoring)
├── 5. Diagnosis (ICD-10/SNOMED search)
├── 6. Medications (drug DB + interaction check)
├── 7. Investigations (lab/radiology orders)
├── 8. Plan & Follow-up
└── 9. Sign / Lock / Print
```
### 智能模板系统```typescript
interface ClinicalTemplate {
  id: string;
  name: string;             // e.g., "Chest Pain"
  chips: string[];          // clickable symptom chips
  requiredFields: string[]; // mandatory data points
  redFlags: string[];       // triggers non-dismissable alert
  icdSuggestions: string[]; // pre-mapped diagnosis codes
}
```
任何模板中的危险信号都必须触发可见的、不可忽略的警报，而不是 Toast 通知。

### 药物安全模式```
User selects drug
  → Check current medications for interactions
  → Check encounter medications for interactions
  → Check patient allergies
  → Validate dose against weight/age/renal function
  → If CRITICAL interaction: BLOCK prescribing entirely
  → Clinician must document override reason to proceed past a block
  → If MAJOR interaction: display warning, require acknowledgment
  → Log all alerts and override reasons in audit trail
```
关键相互作用**默认阻止处方**。临床医生必须使用审计跟踪中存储的记录原因明确推翻。系统绝不会默默地允许关键交互。

### 锁定的遭遇模式

一旦临床遭遇签署：
- 不允许编辑——只有附录（单独的链接记录）
- 原件和附录均出现在患者时间线中
- 审计跟踪记录签署人、签署时间以及任何附录记录

### 临床数据的 UI 模式

**生命体征显示：** 正常范围突出显示的当前值（绿色/黄色/红色）、与之前相比的趋势箭头、自动计算的临床评分（NEWS2、qSOFA）、内联升级指导。

**实验室结果显示：** 正常范围突出显示、先前值比较、具有不可忽略警报的关键值、收集/分析时间戳、具有预期周转时间的挂单。

**处方 PDF：** 一键生成患者人口统计数据、过敏、诊断、药物详细信息（通用名 + 品牌、剂量、途径、频率、持续时间）、临床医生签名块。

### 医疗保健的可及性

医疗保健 UI 比典型的 Web 应用程序有更严格的要求：- 4.5:1 最小对比度 (WCAG AA) — 临床医生在不同的照明条件下工作
- 大触摸目标（最小 44x44 像素）— 用于戴手套/匆忙交互
- 键盘导航 — 供高级用户快速输入数据
- 没有纯颜色指示器 - 始终将颜色与文本/图标配对（色盲临床医生）
- 所有表单字段上的屏幕阅读器标签
- 临床警报不会自动关闭 - 临床医生必须积极确认

### 反模式

- 将临床数据存储在浏览器localStorage中
- 药物相互作用检查中的无声失败
- 重要临床警报的可关闭祝酒词
- 基于选项卡的交互用户界面使临床工作流程支离破碎
- 允许编辑签名/锁定的遭遇
- 显示临床数据，无需审计跟踪
- 对临床数据结构使用“any”类型

## 示例

### 示例 1：患者就诊流程```
Doctor opens encounter for Patient #4521
  → Sticky header shows: "Rajesh M, 58M, Allergies: Penicillin, Active Meds: Metformin 500mg"
  → Chief Complaint: selects "Chest Pain" template
    → Clicks chips: "substernal", "radiating to left arm", "crushing"
    → Red flag "crushing substernal chest pain" triggers non-dismissable alert
  → Examination: CVS system — "S1 S2 normal, no murmur"
  → Vitals: HR 110, BP 90/60, SpO2 94%
    → NEWS2 auto-calculates: score 8, risk HIGH, escalation alert shown
  → Diagnosis: searches "ACS" → selects ICD-10 I21.9
  → Medications: selects Aspirin 300mg
    → CDSS checks against Metformin: no interaction
  → Signs encounter → locked, addendum-only from this point
```
### 示例 2：用药安全工作流程```
Doctor prescribes Warfarin for Patient #4521
  → CDSS detects: Warfarin + Aspirin = CRITICAL interaction
  → UI: red non-dismissable modal blocks prescribing
  → Doctor clicks "Override with reason"
  → Types: "Benefits outweigh risks — monitored INR protocol"
  → Override reason + alert stored in audit trail
  → Prescription proceeds with documented override
```
### 示例 3：锁定遭遇 + 附录```
Encounter #E-2024-0891 signed by Dr. Shah at 14:30
  → All fields locked — no edit buttons visible
  → "Add Addendum" button available
  → Dr. Shah clicks addendum, adds: "Lab results received — Troponin elevated"
  → New record E-2024-0891-A1 linked to original
  → Timeline shows both: original encounter + addendum with timestamps
```
