---
name: agent-payment-x402
description: 通过 MCP 工具向 AI 代理添加 x402 支付执行 — 每任务预算、支出控制和非托管钱包。当代理需要为 API、服务或其他代理付费时使用。origin: community
---
# 代理付款执行 (x402)

使人工智能代理能够通过内置的支出控制进行自主支付。使用 x402 HTTP 支付协议和 MCP 工具，因此代理可以为外部服务、API 或其他代理付费，而无需承担托管风险。

## 何时使用

使用时机：您的代理需要支付 API 调用费用、购买服务、与其他代理结算、强制执行每个任务的支出限制或管理非托管钱包。与具有成本意识的LLM管道和安全审查技能自然搭配。

## 它是如何工作的

### x402 协议
x402 将 HTTP 402（需要付款）扩展为机器可协商的流。当服务器返回“402”时，代理的支付工具会自动协商价格、检查预算、签署交易并重试——循环中无需人工干预。

### 支出控制
每个支付工具调用都会强制执行“SpendingPolicy”：
- **每任务预算** — 单个代理操作的最大支出
- **每会话预算** — 整个会话的累积限制
- **列入白名单的收件人** — 限制代理可以支付的地址/服务
- **速率限制** — 每分钟/小时的最大交易量

### 非托管钱包代理通过 ERC-4337 智能账户持有自己的密钥。协调者在授权之前制定策略；代理人只能在限额内消费。无集合资金，无托管风险。

## MCP 集成

支付层公开了标准 MCP 工具，可插入任何 Claude Code 或代理工具设置中。

> **安全说明**：始终固定软件包版本。该工具管理私钥——未固定的“npx”安装会带来供应链风险。```json
{
  "mcpServers": {
    "agentpay": {
      "command": "npx",
      "args": ["agentwallet-sdk@6.0.0"]
    }
  }
}
```
### 可用工具（代理可调用）

|工具|目的|
|------|---------|
| `获取余额` |查看代理钱包余额 |
| `发送付款` |将付款发送至地址或 ENS |
| `检查支出` |查询剩余预算 |
| `列表交易` |所有付款的审计追踪|

> **注意**：支出政策是由**协调员**在委托给代理之前设置的，而不是由代理本身设置。这可以防止代理商提高自己的支出限额。通过编排层或任务前挂钩中的“set_policy”配置策略，而不是作为代理可调用工具。

## 示例

### MCP 客户端中的预算执行

在构建调用 agentpay MCP 服务器的编排器时，请在分派付费工具调用之前强制执行预算。

> **先决条件**：在添加 MCP 配置之前安装软件包 - 在非交互式环境中，没有 `-y` 的 `npx` 将提示确认，导致服务器挂起：`npm install -g agentwallet-sdk@6.0.0````typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // 1. Validate credentials before constructing the transport.
  //    A missing key must fail immediately — never let the subprocess start without auth.
  const walletKey = process.env.WALLET_PRIVATE_KEY;
  if (!walletKey) {
    throw new Error("WALLET_PRIVATE_KEY is not set — refusing to start payment server");
  }

  // Connect to the agentpay MCP server via stdio transport.
  // Whitelist only the env vars the server needs — never forward all of process.env
  // to a third-party subprocess that manages private keys.
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["agentwallet-sdk@6.0.0"],
    env: {
      PATH: process.env.PATH ?? "",
      NODE_ENV: process.env.NODE_ENV ?? "production",
      WALLET_PRIVATE_KEY: walletKey,
    },
  });
  const agentpay = new Client({ name: "orchestrator", version: "1.0.0" });
  await agentpay.connect(transport);

  // 2. Set spending policy before delegating to the agent.
  //    Always verify success — a silent failure means no controls are active.
  const policyResult = await agentpay.callTool({
    name: "set_policy",
    arguments: {
      per_task_budget: 0.50,
      per_session_budget: 5.00,
      allowlisted_recipients: ["api.example.com"],
    },
  });
  if (policyResult.isError) {
    throw new Error(
      `Failed to set spending policy — do not delegate: ${JSON.stringify(policyResult.content)}`
    );
  }

  // 3. Use preToolCheck before any paid action
  await preToolCheck(agentpay, 0.01);
}

// Pre-tool hook: fail-closed budget enforcement with four distinct error paths.
async function preToolCheck(agentpay: Client, apiCost: number): Promise<void> {
  // Path 1: Reject invalid input (NaN/Infinity bypass the < comparison)
  if (!Number.isFinite(apiCost) || apiCost < 0) {
    throw new Error(`Invalid apiCost: ${apiCost} — action blocked`);
  }

  // Path 2: Transport/connectivity failure
  let result;
  try {
    result = await agentpay.callTool({ name: "check_spending" });
  } catch (err) {
    throw new Error(`Payment service unreachable — action blocked: ${err}`);
  }

  // Path 3: Tool returned an error (e.g., auth failure, wallet not initialised)
  if (result.isError) {
    throw new Error(
      `check_spending failed — action blocked: ${JSON.stringify(result.content)}`
    );
  }

  // Path 4: Parse and validate the response shape
  let remaining: number;
  try {
    const parsed = JSON.parse(
      (result.content as Array<{ text: string }>)[0].text
    );
    if (!Number.isFinite(parsed?.remaining)) {
      throw new TypeError("missing or non-finite 'remaining' field");
    }
    remaining = parsed.remaining;
  } catch (err) {
    throw new Error(
      `check_spending returned unexpected format — action blocked: ${err}`
    );
  }

  // Path 5: Budget exceeded
  if (remaining < apiCost) {
    throw new Error(
      `Budget exceeded: need $${apiCost} but only $${remaining} remaining`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
```
## 最佳实践

- **在委派之前设置预算**：生成子代理时，通过编排层附加 SpendingPolicy。永远不要给代理无限制的支出。
- **固定您的依赖项**：始终在 MCP 配置中指定确切的版本（例如“agentwallet-sdk@6.0.0”）。在部署到生产之前验证包的完整性。
- **审计跟踪**：在任务后挂钩中使用“list_transactions”来记录花费的内容和原因。
- **失败关闭**：如果支付工具无法访问，则阻止付费操作 - 不要退回到不限流量的访问。
- **与安全审查配对**：支付工具具有高权限。应用与 shell 访问相同的审查。
- **首先使用测试网进行测试**：使用 Base Sepolia 进行开发；切换到 Base 主网进行生产。

## 生产参考

- **npm**：[`agentwallet-sdk`](https://www.npmjs.com/package/agentwallet-sdk)
- **合并到 NVIDIA NeMo Agent Toolkit**：[PR #17](https://github.com/NVIDIA/NeMo-Agent-Toolkit-Examples/pull/17) — 用于 NVIDIA 代理示例的 x402 支付工具
- **协议规范**：[x402.org](https://x402.org)