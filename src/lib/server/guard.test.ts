/** @jest-environment node */
import {
  accessConfigured,
  readJson,
  readLimited,
  requireAI,
  sameOrigin,
  ApiError,
} from "./guard";
import { requireMember } from "./membership";
import { reserveUsage } from "./quota";
import { publicAccessConfig } from "./config";
import { POST as resources } from "@/app/api/resources/route";
import { POST as rubric } from "@/app/api/rubric/route";
import { POST as feedback } from "@/app/api/feedback/route";
import { POST as grammar } from "@/app/api/grammar/route";
import { POST as voice } from "@/app/api/realtime/route";
import { serverEnv, session } from "@/test/server-env";
jest.mock("./membership", () => ({ requireMember: jest.fn() }));
jest.mock("./quota", () => ({
  ...jest.requireActual("./quota"),
  reserveUsage: jest.fn(),
}));
const original = { ...process.env };
beforeEach(() => {
  process.env = { ...original, ...serverEnv, NODE_ENV: "test" };
  jest.clearAllMocks();
  jest
    .mocked(requireMember)
    .mockRejectedValue(new ApiError(401, "Sign in first."));
});
afterAll(() => {
  process.env = original;
});
function req(headers: Record<string, string> = {}, body?: string) {
  return new Request(serverEnv.APP_ORIGIN + "/api/chat", {
    method: "POST",
    headers: { origin: serverEnv.APP_ORIGIN, ...headers },
    body,
  });
}
it("rejects cross-origin and missing-origin requests", () => {
  expect(() => sameOrigin(req({ origin: "https://attacker.test" }))).toThrow();
  expect(() =>
    sameOrigin(new Request(serverEnv.APP_ORIGIN + "/api/chat")),
  ).toThrow();
  expect(() => sameOrigin(req())).not.toThrow();
});
it("requires a verified member before AI", async () => {
  await expect(requireAI(req())).rejects.toMatchObject({ status: 401 });
  expect(reserveUsage).not.toHaveBeenCalled();
});
it.each([resources, rubric, voice, feedback, grammar])(
  "blocks free members at the premium API even with a forged Pro body",
  async (handler) => {
    jest.mocked(requireMember).mockResolvedValue(session());
    const response = await handler(
      req(
        {},
        JSON.stringify({
          isPro: true,
          tier: "pro",
          roles: ["admin"],
          plans: ["Ultimate Pro"],
        }),
      ),
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: "PRO_REQUIRED" });
    expect(reserveUsage).not.toHaveBeenCalled();
  },
);
it("fails closed without durable storage", async () => {
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  expect(accessConfigured()).toBe(false);
  await expect(requireAI(req())).rejects.toMatchObject({ status: 503 });
});
it("rejects reused signing secrets and keeps secrets out of public configuration", () => {
  expect(accessConfigured()).toBe(true);
  const exposed = JSON.stringify(publicAccessConfig());
  for (const key of [
    "WIX_BRIDGE_SECRET",
    "SESSION_SECRET",
    "GEMINI_API_KEY",
    "OPENAI_API_KEY",
    "QSTASH_TOKEN",
    "UPSTASH_REDIS_REST_TOKEN",
  ])
    expect(exposed).not.toContain(process.env[key]);
  process.env.SESSION_SECRET = process.env.WIX_BRIDGE_SECRET;
  expect(accessConfigured()).toBe(false);
});
it("limits streamed bytes without content-length", async () => {
  await expect(
    readLimited(req({}, "x".repeat(101)), 100),
  ).rejects.toMatchObject({ status: 413 });
});
it("rejects malformed JSON", async () => {
  await expect(readJson(req({}, "{invalid"))).rejects.toMatchObject({
    status: 400,
  });
});
