# 从 stdio 迁移到 HTTP MCP（do-mcp-http）

## 目标

把原来的本地 `stdio` MCP（仅 CLI 子进程调用）迁移为可通过 HTTP 访问的 MCP 服务，便于：

- 多客户端复用
- 统一服务部署
- 后续接入网关/鉴权/观测

---

## 迁移路径

1. **复用业务逻辑**
   - `fetchJson.ts` 基本不变，继续复用参数校验、超时、重试和错误分层。

2. **替换 transport**
   - 从 `StdioServerTransport` 切到 `StreamableHTTPServerTransport`。

3. **加 HTTP 宿主**
   - 使用 SDK 内置的 `createMcpExpressApp`，监听 `POST /mcp`。

4. **保持同一 tool 协议**
   - 继续暴露 `fetch_json`，客户端调用方式保持一致。

---

## 目录

```text
do-mcp-http/
  src/
    server.ts
    fetchJson.ts
  test/
    fetch-json.test.ts
  package.json
  tsconfig.json
```

---

## 运行

```bash
cd do-mcp-http
pnpm install
pnpm test
pnpm build
pnpm start
```

启动后地址：

```text
http://127.0.0.1:3100/mcp
```

---

## 在 Claude Code CLI 里做目录级测试

在任意测试目录（例如 `do-mcp-http/mcp-http-test`）放 `.mcp.json`：

```json
{
  "mcpServers": {
    "demo-mcp-http": {
      "url": "http://127.0.0.1:3100/mcp"
    }
  }
}
```

可选 `.claude/settings.local.json`：

```json
{
  "enabledMcpjsonServers": ["demo-mcp-http"],
  "permissions": {
    "allow": ["mcp__demo-mcp-http__fetch_json"]
  }
}
```

---

## 验证清单

- 正向：
  - `{"url":"https://jsonplaceholder.typicode.com/todos/1","timeoutMs":3000,"retries":0}`
- 反向参数：
  - `{"url":"ftp://a.com","retries":0}`
- 反向下游：
  - `{"url":"https://httpstat.us/500","retries":0}`

---

## 注意事项

- 当前示例未加认证，仅监听 `127.0.0.1` 用于本机测试。
- 生产化前建议补充：鉴权、限流、请求审计、错误码规范化。
