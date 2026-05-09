---
name: api-connector-builder
description: 通过完全匹配目标存储库的现有集成模式来构建新的 API 连接器或提供程序。在添加另一个集成而不发明第二种架构时使用。origin: ECC direct-port adaptation
version: "1.0.0"
---
# API 连接器生成器

当工作是添加一个 repo-native 集成表面而不仅仅是一个通用 HTTP 客户端时，请使用此选项。

重点是匹配主机存储库的模式：

- 连接器布局
- 配置模式
- 授权模型
- 错误处理
- 测试风格
- 注册/发现接线

## 何时使用

- “为此项目构建 Jira 连接器”
- “按照现有模式添加 Slack 提供商”
- “为此 API 创建新的集成”
- “构建一个与存储库连接器风格相匹配的插件”

## 护栏

- 当仓库已经有一个新的集成架构时，不要发明一种新的集成架构
- 不要仅从供应商文档开始；首先从现有的回购连接器开始
- 如果存储库需要注册表连接、测试和文档，请不要停在传输代码处
- 如果仓库有更新的当前模式，请勿对旧连接器进行货物崇拜

## 工作流程

### 1.了解家居风格

检查至少 2 个现有连接器/提供商并绘制地图：

- 文件布局
- 抽象边界
- 配置模型
- 重试/分页约定
- 注册表挂钩
- 测试装置和命名

### 2. 缩小目标整合范围

仅定义存储库实际需要的表面：

- 授权流程
- 关键实体- 核心读/写操作
- 分页和速率限制
- webhook 或轮询模型

### 3. 构建 repo-native 层

Typical slices:

- config/schema
- client/transport
- mapping layer
- 连接器/提供商入口点
- registration
- 测试

### 4. 根据源模式进行验证

新的连接器在代码库中应该看起来很明显，而不是从不同的生态系统导入。

## Reference Shapes

### Provider-style```text
providers/
  existing_provider/
    __init__.py
    provider.py
    config.py
```
### 连接器式```text
integrations/
  existing/
    client.py
    models.py
    connector.py
```
### TypeScript 插件风格```text
src/integrations/
  existing/
    index.ts
    client.ts
    types.ts
    test.ts
```
## 质量检查表

- [ ] 匹配现有的仓库内集成模式
- [ ] 配置验证存在
- [ ] 验证和错误处理是明确的
- [ ] 分页/重试行为遵循回购规范
- [ ] 注册/发现接线已完成
- [ ] 测试反映了主机仓库的风格
- [ ] 文档/示例根据存储库的预期进行更新

## 相关技能

- `后端模式`
- `mcp-服务器模式`
- `github-ops`