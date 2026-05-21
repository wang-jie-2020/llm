import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import {
  fetchJson,
  fetchJsonInput,
  DownstreamError,
  TimeoutError,
  UserInputError,
} from "./fetchJson.js";

function createServer() {
  const server = new McpServer({ name: "demo-mcp-http", version: "0.1.0" });

  server.tool("fetch_json", fetchJsonInput, async (args) => {
    const requestId = randomUUID();
    console.log(JSON.stringify({ level: "info", requestId, tool: "fetch_json", args }));
    try {
      const data = await fetchJson(args);
      return {
        content: [{ type: "text", text: JSON.stringify({ requestId, data }, null, 2) }],
      };
    } catch (e) {
      const kind =
        e instanceof UserInputError
          ? "user"
          : e instanceof TimeoutError
          ? "timeout"
          : e instanceof DownstreamError
          ? "downstream"
          : "system";
      throw new Error(`[${requestId}] ${kind}: ${(e as Error).message}`);
    }
  });

  return server;
}

const app = createMcpExpressApp({ host: "127.0.0.1" });

app.post("/mcp", async (req: any, res: any) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  } finally {
    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });
  }
});

app.get("/mcp", async (_req: any, res: any) => {
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    })
  );
});

app.delete("/mcp", async (_req: any, res: any) => {
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    })
  );
});

const PORT = Number(process.env.PORT ?? "3100");
app.listen(PORT, "127.0.0.1", (error?: Error) => {
  if (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
  console.log(`MCP HTTP server listening at http://127.0.0.1:${PORT}/mcp`);
});
