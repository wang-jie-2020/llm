import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  fetchJson,
  fetchJsonInput,
  DownstreamError,
  TimeoutError,
  UserInputError,
} from "./fetchJson.js";

const server = new McpServer({ name: "demo-mcp", version: "0.1.0" });

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

await server.connect(new StdioServerTransport());
