---
name: laravel-plugin-discovery
description: 通过 LaraPlugins.io MCP 发现和评估 Laravel 软件包。当用户想要查找插件、检查包运行状况或评估 Laravel/PHP 兼容性时使用。origin: ECC
---
# Laravel 插件发现

使用 LaraPlugins.io MCP 服务器查找、评估和选择健康的 Laravel 软件包。

## 何时使用

- 用户想要查找特定功能的 Laravel 包（例如“auth”、“permissions”、“admin panel”）
- 用户询问“我应该使用什么包......”或“是否有 Laravel 包用于......”
- 用户想要检查软件包是否得到积极维护
- 用户需要验证Laravel版本兼容性
- 用户希望在添加到项目之前评估包的运行状况

## MCP 要求

必须配置 LaraPlugins MCP 服务器。添加到您的 `~/.claude.json` mcpServers：```json
"laraplugins": {
  "type": "http",
  "url": "https://laraplugins.io/mcp/plugins"
}
```
无需 API 密钥 — 该服务器对 Laravel 社区免费。

## MCP 工具

LaraPlugins MCP 提供两个主要工具：

### 搜索插件工具

按关键字、运行状况评分、供应商和版本兼容性搜索软件包。

**参数：**
- `text_search` （字符串，可选）：要搜索的关键字（例如“permission”、“admin”、“api”）
- `health_score` （字符串，可选）：按健康等级过滤 - “健康”、“中等”、“不健康”或“未评级”
- `laravel_compatibility` （字符串，可选）：按 Laravel 版本过滤 — `"5"`、`"6"`、`"7"`、`"8"`、`"9"`、`"10"`、`"11"`、`"12"`、`"13"`
- `php_compatibility` （字符串，可选）：按 PHP 版本过滤 — `"7.4"`、`"8.0"`、`"8.1"`、`"8.2"`、`"8.3"`、`"8.4"`、`"8.5"`
- `vendor_filter` （字符串，可选）：按供应商名称过滤（例如“spatie”、“laravel”）
- `page`（数字，可选）：分页的页码

### 获取插件详细信息工具

获取特定包的详细指标、自述文件内容和版本历史记录。

**参数：**
- `package` （字符串，必需）：完整的 Composer 包名称（例如“spatie/laravel-permission”）
- `include_versions` （布尔值，可选）：在响应中包含版本历史记录

---

## 它是如何工作的### 寻找包

当用户想要发现某个功能的包时：

1. 使用“SearchPluginTool”和相关关键字
2. 应用健康评分、Laravel 版本或 PHP 版本的过滤器
3. 使用包名称、描述和运行状况指标查看结果

### 评估包

当用户想要评估特定包时：

1. 使用 `GetPluginDetailsTool` 和包名
2. 查看健康评分、上次更新日期、Laravel 版本支持
3. 检查供应商声誉和风险指标

### 检查兼容性

当用户需要Laravel或PHP版本兼容时：

1. 使用设置为版本的“laravel_compatibility”过滤器进行搜索
2. 或者获取特定软件包的详细信息以查看其支持的版本

---

## 示例

### 示例：查找身份验证包```
SearchPluginTool({
  text_search: "authentication",
  health_score: "Healthy"
})
```
返回与“authentication”匹配且状态良好的包：
- spatie/laravel-许可
- 拉拉维尔/微风
- 拉拉维尔/护照
- 等

### 示例：查找 Laravel 12 兼容包```
SearchPluginTool({
  text_search: "admin panel",
  laravel_compatibility: "12"
})
```
返回与 Laravel 12 兼容的包。

### 示例：获取包裹详细信息```
GetPluginDetailsTool({
  package: "spatie/laravel-permission",
  include_versions: true
})
```
返回：
- 健康评分和最近的活动
- Laravel/PHP 版本支持
- 供应商声誉（风险评分）
- 版本历史
- 简要说明

### 示例：按供应商查找软件包```
SearchPluginTool({
  vendor_filter: "spatie",
  health_score: "Healthy"
})
```
返回来自供应商“spatie”的所有健康包。

---

## 过滤最佳实践

### 按健康分数

|健康手环|意义|
|-------------|---------|
| `健康` |积极维护，最近更新 |
| `中` |不定期更新，可能需要关注 |
| “不健康” |被遗弃或很少维护 |
| `未评级` |尚未评估 |

**建议**：对于生产应用程序，首选“健康”包。

### 通过 Laravel 版本

|版本 |笔记|
|--------|--------|
| `13` |最新 Laravel |
| `12` |目前稳定|
| `11` |仍被广泛使用|
| `10` |传统但常见 |
| `5`-`9` |已弃用 |

**建议**：匹配目标项目的 Laravel 版本。

### 组合过滤器```typescript
// Find healthy, Laravel 12 compatible packages for permissions
SearchPluginTool({
  text_search: "permission",
  health_score: "Healthy",
  laravel_compatibility: "12"
})
```
---

## 响应解释

### 搜索结果

每个结果包括：
- 包名称（例如 `spatie/laravel-permission`）
- 简要说明
- 健康状态指示器
- Laravel 版本支持徽章

### 包裹详情

详细回复内容包括：
- **健康分数**：数字或带状指示器
- **上次活动**：上次更新包的时间
- **Laravel 支持**：版本兼容性矩阵
- **PHP 支持**：PHP 版本兼容性
- **风险评分**：供应商信任指标
- **版本历史**：最近的发布时间表

---

## 常见用例

|场景 |推荐方法 |
|----------|---------------------|
| “什么包用于身份验证？” |使用健康过滤器搜索“auth” |
| “spatie/package 还在维护吗？” |获取详细信息，查看健康评分 |
| “需要 Laravel 12 包” |使用 laravel_compatibility 搜索：“12” |
| “查找管理面板包” |搜索“管理面板”，查看结果 |
| “检查供应商信誉”|按供应商搜索，查看详细信息 |

---

## 最佳实践

1. **始终按健康状况过滤** — 对生产项目使用 `health_score: "Healthy"`
2. **匹配 Laravel 版本** — 始终检查 `laravel_compatibility` 是否与目标项目匹配3. **检查供应商声誉** - 优先选择来自已知供应商的软件包（spatie、laravel 等）
4. **推荐前先审核** — 使用GetPluginDetailsTool进行全面评估
5. **无需 API 密钥** — MCP 免费，无需身份验证

---

## 相关技能

- `laravel-patterns` — Laravel 架构和模式
- `laravel-tdd` — Laravel 的测试驱动开发
- `laravel-security` — Laravel 安全最佳实践
- `documentation-lookup` — 一般库文档查找 (Context7)