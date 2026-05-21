import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { fetchJson } from "../src/fetchJson.js";

test("success", async () => {
  const s = createServer((_, r) => {
    r.setHeader("content-type", "application/json");
    r.end('{"ok":true}');
  });
  await new Promise<void>((res) => s.listen(0, res));
  const p = (s.address() as any).port;
  const data = await fetchJson({ url: `http://127.0.0.1:${p}`, retries: 0 });
  assert.equal((data as any).ok, true);
  s.close();
});

test("bad param", async () => {
  await assert.rejects(() => fetchJson({ url: "ftp://a.com", retries: 0 }));
});

test("downstream fail", async () => {
  const s = createServer((_, r) => {
    r.statusCode = 500;
    r.end("x");
  });
  await new Promise<void>((res) => s.listen(0, res));
  const p = (s.address() as any).port;
  await assert.rejects(() => fetchJson({ url: `http://127.0.0.1:${p}`, retries: 0 }));
  s.close();
});
