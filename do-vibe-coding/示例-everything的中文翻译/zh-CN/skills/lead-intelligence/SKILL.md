---
name: lead-intelligence
description: 人工智能原生领先情报和外展渠道。用代理驱动的信号评分、相互排名、热路径发现、来源语音建模以及跨电子邮件、LinkedIn 和 X 的特定渠道外展取代 Apollo、Clay 和 ZoomInfo。当用户想要查找、资格和联系高价值联系人时使用。origin: ECC
---
# 领先情报

由代理驱动的潜在客户情报管道，可通过社交图分析和热路径发现来查找、评分并达到高价值联系人。

## 何时激活

- 用户想要寻找特定行业的潜在客户或潜在客户
- 建立合作伙伴关系、销售或筹款的外展清单
- 研究接触谁以及接触他们的最佳途径
- 用户说“寻找线索”、“外展列表”、“我应该联系谁”、“热情介绍”
- 需要按相关性对联系人列表进行评分或排名
- 想要映射相互联系以找到热情的介绍路径

## 工具要求

### 必填
- **Exa MCP** — 针对人员、公司和信号的深度网络搜索 (`web_search_exa`)
- **X API** — 关注者/关注图、相互分析、最近活动（`X_BEARER_TOKEN`，加上写入上下文凭据，例如`X_CONSUMER_KEY`、`X_CONSUMER_SECRET`、`X_ACCESS_TOKEN`、`X_ACCESS_TOKEN_SECRET`）

### 可选（增强结果）
- **LinkedIn** — 直接 API（如果可用），否则用于搜索、个人资料检查和起草的浏览器控制
- **Apollo/Clay API** — 如果用户有权访问，则用于丰富交叉引用- **GitHub MCP** — 用于以开发人员为中心的领先资格认证
- **Apple Mail / Mail.app** — 起草冷电子邮件或暖电子邮件而不自动发送
- **浏览器控制** — 当 API 覆盖范围缺失或受限时，适用于 LinkedIn 和 X

## 管道概述```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│ 1. Signal   │────>│ 2. Mutual    │────>│ 3. Warm Path    │────>│ 4. Enrich    │────>│ 5. Outreach     │
│    Scoring  │     │    Ranking   │     │    Discovery    │     │              │     │    Draft        │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────────────┘     └─────────────────┘
```
## 外展前的声音

不要从通用销售文案中草拟出站内容。

每当用户的声音很重要时，首先运行“brand-voice”。重用其“语音配置文件”，而不是在该技能中临时重新派生风格。

如果可以进行实时 X 访问，请在起草之前提取最近的原始帖子。如果没有，请使用提供的示例或可用的最佳存储库/站点材料。

## 第 1 阶段：信号评分

寻找目标垂直领域中的高信号人物。根据以下因素为每个分配权重：

|信号|重量 |来源 |
|--------|--------|--------|
|角色/头衔对齐 | 30% | Exa，领英 |
|行业匹配| 25% | Exa 公司搜索 |
|最近的主题活动 | 20% | X API 搜索，Exa |
|关注者数量/影响力 | 10% | X API |
|位置邻近 | 10% | Exa，领英 |
|与您的内容互动 | 5% | X API 交互 |

### 信号搜索方法```python
# Step 1: Define target parameters
target_verticals = ["prediction markets", "AI tooling", "developer tools"]
target_roles = ["founder", "CEO", "CTO", "VP Engineering", "investor", "partner"]
target_locations = ["San Francisco", "New York", "London", "remote"]

# Step 2: Exa deep search for people
for vertical in target_verticals:
    results = web_search_exa(
        query=f"{vertical} {role} founder CEO",
        category="company",
        numResults=20
    )
    # Score each result

# Step 3: X API search for active voices
x_search = search_recent_tweets(
    query="prediction markets OR AI tooling OR developer tools",
    max_results=100
)
# Extract and score unique authors
```
## 第二阶段：相互排名

对于每个评分目标，分析用户的社交图以找到最温暖的路径。

### 排名模型

1. 拉取用户的 X 关注列表和 LinkedIn 连接
2. 对于每个高信号目标，检查共享连接
3.应用“social-graph-ranker”模型对桥梁价值进行评分
4. 按以下方式对互助进行排名：

|因素 |重量 |
|--------|--------|
|与目标的连接数 | 40% — 最高权重、最多连接 = 最高排名 |
| Mutual 目前的角色/公司 | 20% — 决策者与个人贡献者 |
|互助的位置 | 15% — 同一城市 = 更容易介绍 |
|产业联盟| 15% — 相同的垂直方向 = 自然介绍 |
| Mutual 的 X 句柄 / LinkedIn | 10% — 外展的可识别性 |

规范规则：```text
Use social-graph-ranker when the user wants the graph math itself,
the bridge ranking as a standalone report, or explicit decay-model tuning.
```
在该技能中，使用相同的加权桥模型：```text
B(m) = Σ_{t ∈ T} w(t) · λ^(d(m,t) - 1)
R(m) = B_ext(m) · (1 + β · engagement(m))
```
释义：
- 第 1 层：高“R(m)”和直接桥路径 -> 热情的介绍询问
- 第 2 层：中等“R(m)”和一跳桥接路径 -> 有条件介绍询问
- 第 3 层：没有可行的桥梁 -> 使用相同的潜在客户记录进行直接冷外展

### 输出格式```

If the user explicitly wants the ranking engine broken out, the math visualized, or the network scored outside the full lead workflow, run `social-graph-ranker` as a standalone pass first and feed the result back into this pipeline.
MUTUAL RANKING REPORT
=====================

#1  @mutual_handle (Score: 92)
    Name: Jane Smith
    Role: Partner @ Acme Ventures
    Location: San Francisco
    Connections to targets: 7
    Connected to: @target1, @target2, @target3, @target4, @target5, @target6, @target7
    Best intro path: Jane invested in Target1's company

#2  @mutual_handle2 (Score: 85)
    ...
```
## 第三阶段：温暖路径发现

对于每个目标，找到最短的引入链：```
You ──[follows]──> Mutual A ──[invested in]──> Target Company
You ──[follows]──> Mutual B ──[co-founded with]──> Target Person
You ──[met at]──> Event ──[also attended]──> Target Person
```
### 路径类型（按温暖程度排序）
1. **直接相互** - 你们都关注/认识同一个人
2. **投资组合连接** — 共同投资目标公司或为目标公司提供建议
3. **同事/校友** — 共同在同一家公司工作或就读于同一所学校
4. **活动重叠** — 双方参加同一会议/项目
5. **内容参与** — 目标与共同内容互动，反之亦然

## 第四阶段：丰富

对于每个合格的潜在客户，拉：

- 全名、当前职务、公司
- 公司规模、融资阶段、近期新闻
- 最近的 X 条帖子（过去 30 天）——主题、语气、兴趣
- 与用户共同兴趣（分享关注、相似内容）
- 最近的公司活动（产品发布、融资、招聘）

### 富集来源
- Exa：公司数据、新闻、博客文章
- X API：最近的推文、简介、关注者
- GitHub：开源贡献（针对以开发人员为中心的潜在客户）
- LinkedIn（通过浏览器使用）：完整档案、经验、教育背景

## 第五阶段：外展草案

为每个潜在客户生成个性化的外展服务。草稿应与源自源的语音配置文件和目标通道相匹配。

### 频道规则

#### 电子邮件- 用于最高价值的冷外展、热情介绍、投资者外展和合作询问
- 当本地桌面控制可用时，默认在 Apple Mail / Mail.app 中起草
- 首先创建草稿，除非用户明确要求，否则不会自动发送
- 主题行应该简单、具体，而不是巧妙

#### 领英

- 当目标在那里处于活动状态、LinkedIn 上的相互图上下文更强或电子邮件置信度较低时使用
- 优先选择 API 访问（如果可用）
- 否则使用浏览器控件来检查配置文件、最近的活动并起草消息
- 保持比电子邮件短，避免虚假的专业热情

#### X

- 用于公开发布行为很重要的高背景运营商、建筑商或投资者外展
- 优先使用 API 访问进行搜索、时间线和参与度分析
- 需要时回退到浏览器控制
- 私信和公开回复应该比电子邮件更严格，并且应该引用目标时间线中的真实内容

#### 渠道选择启发式

按以下顺序选择一个主要渠道：

1. 通过电子邮件进行热情介绍
2. 直接发送电子邮件
3.LinkedIn DM
4. X DM 或回复仅当有充分理由时才使用多通道，并且节奏不会让人感觉垃圾。

### 热情的介绍请求（相互）

目标：

- 一个明确的询问
- 本介绍有意义的一个具体原因
- 如果需要，易于转发的简介

避免：

- 过度解释你的公司
- 社会证明堆叠
- 听起来像筹款模板

### 直接冷外展（针对目标）

目标：

- 从特定的和最近的事情开始
- 解释为什么合身是真实的
- 提出一个低摩擦的问题

避免：

- 普遍的钦佩
- 特征倾销
- 广泛询问，例如“愿意联系”
- 强制反问句

### 执行模式

对于每个目标，生成：

1.推荐渠道
2.渠道最好的理由
3.留言草稿
4. 可选的后续草案
5. 如果选择电子邮件渠道并且 Apple Mail 可用，则创建草稿而不是仅返回文本

如果浏览器控件可用：

- LinkedIn：检查目标个人资料、最近的活动和相互背景，然后起草或准备消息
- X：检查最近的帖子或回复，然后起草 DM 或公开回复语言

如果桌面自动化可用：

- Apple Mail：创建包含主题、正文和收件人的电子邮件草稿未经用户明确批准，不要自动发送消息。

### 反模式

- 没有个性化的通用模板
- 长段落解释您的整个公司
- 一条消息中多个询问
- 假装熟悉，没有细节
- 带有可见合并字段的批量发送消息
- 电子邮件、LinkedIn 和 X 重复使用相同的副本
- 平台状的斜坡而不是作者的真实声音

## 配置

用户应该设置这些环境变量：```bash
# Required
export X_BEARER_TOKEN="..."
export X_ACCESS_TOKEN="..."
export X_ACCESS_TOKEN_SECRET="..."
export X_CONSUMER_KEY="..."
export X_CONSUMER_SECRET="..."
export EXA_API_KEY="..."

# Optional
export LINKEDIN_COOKIE="..." # For browser-use LinkedIn access
export APOLLO_API_KEY="..."  # For Apollo enrichment
```
## 代理

此技能包括“agents/”子目录中的专用代理：

- **signal-scorer** — 通过相关信号搜索和排名潜在客户
- **mutual-mapper** — 映射社交图连接并找到温暖路径
- **enrichment-agent** — 提取详细的个人资料和公司数据
- **outreach-drafter** — 生成个性化消息

## 用法示例```
User: find me the top 20 people in prediction markets I should reach out to

Agent workflow:
1. signal-scorer searches Exa and X for prediction market leaders
2. mutual-mapper checks user's X graph for shared connections
3. enrichment-agent pulls company data and recent activity
4. outreach-drafter generates personalized messages for top ranked leads

Output: Ranked list with warm paths, voice profile summary, and channel-specific outreach drafts or drafts-in-app
```
## 相关技能

- 用于规范语音捕捉的“品牌声音”
- “连接优化器”，用于在外展之前先审查网络修剪和扩展