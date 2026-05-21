# do-mcp：MCP 思路与实现指导

## 1) 方案思路（为什么这样做）

- 先走 **stdio + 单一高价值 tool**（`fetch_json`），最小化调试面，先跑通端到端。
- 协议层先稳定，再扩展能力（更多 tool、远程化、鉴权）。
- 配置采用**目录级生效**（`mcp-test/.mcp.json`），避免污染全局配置。

这条路径适合快速验证：
1. MCP Server 能被 Claude Code CLI 发现并拉起
2. Tool 参数校验、异常分层、日志链路可用
3. 成功/失败用例都能闭环验证

---

## 2) 当前实现结构

```text
do-mcp/
  src/
    index.ts          # MCP server 注册与 tool 暴露
    fetchJson.ts      # 业务逻辑、输入约束、错误类型
  test/
    fetch-json.test.ts
  package.json
  tsconfig.json
```

关键点：
- `src/index.ts`：注册 `fetch_json`，生成 `requestId`，统一错误映射
- `src/fetchJson.ts`：
  - 输入约束：`url/timeoutMs/retries`
  - URL 安全策略：仅 `https`，或本地 `http://127.0.0.1|localhost`
  - 超时：`AbortController`
  - 重试：基于 `retries`
  - 错误分层：`UserInputError` / `TimeoutError` / `DownstreamError`

---

## 3) 编译与运行

在 `do-mcp` 下：

```bash
pnpm install
pnpm test
pnpm build
```

当前编译产物入口是：

```text
do-mcp/dist/src/index.js
```

> 注意：不是 `dist/index.js`。这也是之前 MCP 状态 failed 的根因之一。

---

## 4) 仅在测试目录生效（不污染全局）

在 `mcp-test/.mcp.json`：

```json
{
  "mcpServers": {
    "demo-mcp": {
      "command": "node",
      "args": ["../do-mcp/dist/src/index.js"]
    }
  }
}
```

在 `mcp-test/.claude/settings.local.json`（本地目录级启用与放行）：

```json
{
  "enabledMcpjsonServers": ["demo-mcp"],
  "permissions": {
    "allow": ["mcp__demo-mcp__fetch_json"]
  }
}
```

这样只有在 `mcp-test` 目录启动 `claude` 时才生效。

---

## 5) Tool 可用性测试清单

### 正向用例（成功）

让 Claude 调用：

```json
{"url":"https://jsonplaceholder.typicode.com/todos/1","timeoutMs":3000,"retries":0}
```

期望：返回包含 `requestId` 与 `data`。

### 反向用例 1（参数错误）

```json
{"url":"ftp://a.com","retries":0}
```

期望：`user` 类错误。

### 反向用例 2（下游失败）

```json
{"url":"https://httpstat.us/500","retries":0}
```

期望：`downstream` 类错误。

---

## 6) 常见问题与排查

1. `/mcp` 显示 server 但状态 failed
   - 先检查 `args` 指向的 js 入口是否存在
   - 重点核对是否写成了错误路径（如 `dist/index.js`）

2. server 可见但 tool 调用失败
   - 检查 `settings.local.json` 中 `permissions.allow` 是否放行对应 MCP tool

3. 改了配置不生效
   - 重开当前目录下的 `claude` 会话再看 `/mcp`

---

## 7) 后续演进建议（按优先级）

1. 增加结构化返回（统一 `ok/error/code/requestId`）
2. 加入更细粒度重试策略（仅对可重试状态码）
3. 增加第二个工具（例如 `fetch_text` 或受限域名抓取）
4. 再考虑 remote MCP（HTTP）与鉴权
