/** @jest-environment node */
import { NextResponse } from "next/server";
import {
  accessConfigured,
  createAccessCookie,
  readJson,
  readLimited,
  requireAI,
  sameOrigin,
  sessionIdentity,
} from "./guard";
const original = { ...process.env };
beforeEach(() => {
  process.env = {
    ...original,
    NODE_ENV: "test",
    APP_ORIGIN: "https://example.test",
    AI_ACCESS_CODE: "test-code-only-123456",
    SESSION_SECRET: "a-test-only-secret-with-more-than-32-characters",
    GEMINI_API_KEY: "test-placeholder",
  };
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});
afterAll(() => {
  process.env = original;
});
function req(headers: Record<string, string> = {}) {
  return new Request("https://example.test/api/chat", {
    method: "POST",
    headers: { origin: "https://example.test", ...headers },
  });
}
describe("AI request boundaries", () => {
  it("rejects cross-origin and missing-origin requests", () => {
    expect(() => sameOrigin(req({ origin: "https://other.test" }))).toThrow();
    expect(() =>
      sameOrigin(new Request("https://example.test/api/chat")),
    ).toThrow();
    expect(() => sameOrigin(req())).not.toThrow();
  });
  it("requires access before any AI request is accepted", async () => {
    await expect(requireAI(req())).rejects.toMatchObject({ status: 401 });
  });
  it("accepts a signed cookie and rejects tampering", () => {
    const response = NextResponse.json({ ok: true });
    createAccessCookie(response);
    const cookie = response.headers.get("set-cookie")!.split(";")[0];
    expect(sessionIdentity(req({ cookie }))).toMatch(/^[a-f0-9]{32}$/);
    expect(sessionIdentity(req({ cookie: cookie + "x" }))).toBeNull();
    expect(response.headers.get("set-cookie")).toMatch(/HttpOnly/i);
    expect(response.headers.get("set-cookie")).toMatch(/SameSite=strict/i);
  });
  it("fails closed in production without durable rate limiting", async () => {
    process.env = { ...process.env, NODE_ENV: "production" };
    expect(accessConfigured()).toBe(false);
    await expect(requireAI(req())).rejects.toMatchObject({ status: 503 });
  });
  it("limits streamed bytes even without a content-length header", async () => {
    const r = new Request("https://example.test", {
      method: "POST",
      body: "x".repeat(101),
    });
    await expect(readLimited(r, 100)).rejects.toMatchObject({ status: 413 });
  });
  it("returns a client error for malformed JSON", async () => {
    const r = new Request("https://example.test", {
      method: "POST",
      body: "{invalid",
    });
    await expect(readJson(r)).rejects.toMatchObject({ status: 400 });
  });
});
