import { z } from "zod";

export const fetchJsonInput = {
  url: z.string().url(),
  timeoutMs: z.number().int().min(100).max(10000).optional(),
  retries: z.number().int().min(0).max(3).optional(),
};

export class UserInputError extends Error {}
export class DownstreamError extends Error {}
export class TimeoutError extends Error {}

function assertUrl(url: string) {
  const u = new URL(url);
  const local = u.hostname === "127.0.0.1" || u.hostname === "localhost";
  if (!(u.protocol === "https:" || (u.protocol === "http:" && local))) {
    throw new UserInputError("only https or local http");
  }
}

export async function fetchJson({
  url,
  timeoutMs = 3000,
  retries = 1,
}: {
  url: string;
  timeoutMs?: number;
  retries?: number;
}) {
  assertUrl(url);
  let last: unknown;
  for (let i = 0; i <= retries; i++) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: c.signal });
      if (!res.ok) throw new DownstreamError(`status ${res.status}`);
      return await res.json();
    } catch (e) {
      last = e;
      if (e instanceof DOMException && e.name === "AbortError") {
        last = new TimeoutError("timeout");
      }
    } finally {
      clearTimeout(t);
    }
  }
  throw last;
}
