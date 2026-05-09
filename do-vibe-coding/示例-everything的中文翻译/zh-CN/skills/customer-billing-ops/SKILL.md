---
name: customer-billing-ops
description: 使用 Stripe 等互联计费工具操作客户计费工作流程，例如订阅、退款、流失分类、计费门户恢复和计划分析。当用户需要帮助客户、检查订阅状态或管理影响收入的计费操作时使用。origin: ECC
---
# 客户计费操作

使用此技能进行真正的客户操作，而不是通用支付 API 设计。

目标是帮助操作员回答：这个客户是谁，发生了什么，最安全的解决方案是什么，以及我们应该发送什么后续信息？

## 何时使用

- 客户表示账单已损坏，他们想要退款，或者无法取消
- 调查重复订阅、意外收费、续订失败或流失风险
- 审查计划组合、有效订阅、每年与每月转换或团队席位混乱
- 创建或验证计费门户流程
- 审核涉及订阅、发票、退款或付款方式的支持投诉

## 首选工具表面

- 首先使用连接的计费工具，例如 Stripe
- 仅使用电子邮件、GitHub 或问题跟踪器作为支持证据
- 当平台已经提供所需的控制时，更喜欢托管计费/客户门户而不是自定义帐户管理代码

## 护栏

- 切勿在响应中暴露密钥、完整的卡详细信息或不必要的客户 PII
- 请勿盲目退款；首先对问题进行分类
- 区分：
  - 意外重复购买
  - 有意多席位或团队购买- 破损的产品/未满足的价值
  - 结账失败或不完整
  - 由于缺少自助控制而取消
- 对于年度计划、团队计划和按比例分配的状态，在采取行动之前验证合同形式

## 工作流程

### 1. Identify the customer cleanly

从最强的可用标识符开始：

- 客户电子邮件
- 条纹客户 ID
- 订阅ID
- 发票编号
- GitHub 用户名或支持电子邮件（如果已知映射回账单）

Return a concise identity summary:

- 客户
- 活跃订阅
- 取消订阅
- 发票
- 明显的异常情况，例如重复的活动订阅

### 2. Classify the issue

Put the case into one bucket before acting:

|案例 |典型动作|
|------|----------------|
| Duplicate personal subscription | cancel extras, consider refund |
| Real multi-seat/team intent | preserve seats, clarify billing model |
| Failed payment / incomplete checkout | recover via portal or update payment method |
| Missing self-serve controls |提供门户、取消路径或发票访问 |
| Product failure or trust break | refund, apologize, log product issue |

### 3. Take the safest reversible action first首选订单：

1.恢复自助管理
2.修复重复或损坏的计费状态
3. 仅退还受影响的费用或重复费用
4.记录原因
5.发送简短的客户跟进

如果修复需要产品工作，请分开：

- 立即修复客户
- 积压的产品错误/工作流程差距

### 4.检查运营商端产品差距

如果客户的痛苦来自于缺少操作员界面，请明确指出。常见示例：

- 没有计费门户
- 没有使用/速率限制可见性
- 没有计划/座位说明
- 无取消流程
- 没有重复订阅保护

将这些视为 ECC 或网站后续项目，而不仅仅是支持事件。

### 5. 进行操作员切换

结束于：

- 客户状态摘要
- 采取的行动
- 收入影响
- 要发送的后续文本
- 要创建的产品或积压问题

## 输出格式

使用这个结构：```text
CUSTOMER
- name / email
- relevant account identifiers

BILLING STATE
- active subscriptions
- invoice or renewal state
- anomalies

DECISION
- issue classification
- why this action is correct

ACTION TAKEN
- refund / cancel / portal / no-op

FOLLOW-UP
- short customer message

PRODUCT GAP
- what should be fixed in the product or website
```
## 好的推荐示例

- “正确的解决方案是计费门户，而不是自定义仪表板”
- “这看起来像是重复的个人结账，而不是真正的团队席位购买”
- “退还一笔重复费用，保留剩余的有效订阅，然后在需要时将客户转换为组织计费”