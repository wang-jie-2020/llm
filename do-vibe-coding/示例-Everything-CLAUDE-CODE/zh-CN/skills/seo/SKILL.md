---
name: seo
description: 审核、规划和实施跨技术 SEO、页面优化、结构化数据、核心网络生命和内容策略的 SEO 改进。当用户想要更好的搜索可见性、SEO 修复、架构标记、站点地图/机器人工作或关键字映射时使用。origin: ECC
---
# 搜索引擎优化

通过技术正确性、性能和内容相关性而不是噱头来提高搜索可见性。

## 何时使用

在以下情况下使用此技能：
- 审核可爬行性、可索引性、规范或重定向
- 改进标题标签、元描述和标题结构
- 添加或验证结构化数据
- 改善核心网络生命力
- 进行关键字研究并将关键字映射到 URL
- 规划内部链接或站点地图/机器人更改

## 它是如何工作的

### 原则

1.在内容优化之前修复技术障碍。
2. 一个页面应该有一个明确的主要搜索意图。
3. 更喜欢长期的质量信号而不是操纵模式。
4. 移动优先的假设很重要，因为索引是移动优先的。
5. 建议应针对特定页面且可实施。

### 技术 SEO 清单

#### 可爬行性

- `robots.txt` 应允许重要页面并阻止低价值表面
- 任何重要页面都不应无意中成为“noindex”
- 重要的页面应该可以在较浅的点击深度内访问
- 避免重定向链长于两跳
- 规范标签应该是自洽且非循环的

#### 可转位性- 首选的URL格式应该一致
- 多语言页面需要正确的 hreflang（如果使用）
- 站点地图应反映预期的公共界面
- 如果没有规范控制，重复的 URL 不应竞争

#### 性能

- LCP < 2.5 秒
- INP < 200 毫秒
- CLS < 0.1
- 常见修复：预加载英雄资源、减少渲染阻塞工作、预留布局空间、修剪繁重的 JS

#### 结构化数据

- 主页：组织或业务架构（如果适用）
- 编辑页面：“文章”/“博客发布”
- 产品页面：“产品”和“报价”
- 内部页面：`BreadcrumbList`
- 问答部分：仅当内容真正匹配时才显示“FAQPage”

### 页面规则

#### 标题标签

- 目标是大约 50-60 个字符
- 将主要关键字或概念放在前面
- 使标题易于人类阅读，而不是为机器人而填充

#### 元描述

- 目标是大约 120-160 个字符
- 诚实地描述页面
- 自然地包含主要主题

#### 标题结构

- 一个清晰的“H1”
- “H2”和“H3”应反映实际的内容层次结构
- 不要仅仅为了视觉样式而跳过结构

### 关键字映射

1. 定义搜索意图
2.收集现实的关键词变体3. 按意图匹配、可能价值和竞争确定优先级
4. 将一个主要关键字/主题映射到一个 URL
5. 检测并避免蚕食

### 内部链接

- 从强大的页面链接到您想要排名的页面
- 使用描述性锚文本
- 当可能有更具体的锚点时，避免通用锚点
- 从新页面回填到相关现有页面的链接

## 示例

### 标题公式```text
Primary Topic - Specific Modifier | Brand
```
###元描述公式```text
Action + topic + value proposition + one supporting detail
```
### JSON-LD 示例```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Page Title Here",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Brand Name"
  }
}
```
### 审核输出形状```text
[HIGH] Duplicate title tags on product pages
Location: src/routes/products/[slug].tsx
Issue: Dynamic titles collapse to the same default string, which weakens relevance and creates duplicate signals.
Fix: Generate a unique title per product using the product name and primary category.
```
## 反模式

|反模式|修复 |
| --- | --- |
|关键词堆砌|首先为用户编写 |
|薄近乎重复的页面|巩固或区分它们|
|实际不存在的内容的架构 |将模式与现实相匹配 |
|内容建议无需检查实际页面|首先阅读真实页面 |
|通用“改善 SEO”输出 |将每个推荐与页面或资产联系起来 |

## 相关技能

- `seo专家`
- `前端模式`
- “品牌声音”
-“市场研究”