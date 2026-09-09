/** @jest-environment node */
import { reserveUsage, usageStatus } from "./quota";
import { redis } from "./redis";
import { redisCommand } from "@/test/redis-wire";
import { serverEnv, session } from "@/test/server-env";
const original = { ...process.env },
  originalFetch = global.fetch;
// Real Lua and concurrency checks run against a disposable Redis 7 service in CI.
const integration = process.env.REDIS_TEST_PORT ? describe : describe.skip;
integration("durable quotas with real Redis", () => {
  beforeEach(async () => {
    process.env = {
      ...original,
      ...serverEnv,
      FREE_DAILY_MESSAGE_LIMIT: "10",
      AI_WORKSPACE_DAILY_LIMIT: "2000",
    };
    const keys = (await redisCommand(["KEYS", "ibgenie:*"])) as string[];
    if (keys.length) await redisCommand(["DEL", ...keys]);
    global.fetch = jest.fn(async (url, init) => {
      if (String(url) !== serverEnv.UPSTASH_REDIS_REST_URL)
        throw new Error("Unexpected external request.");
      const result = await redisCommand(JSON.parse(String(init?.body)));
      return Response.json({ result });
    });
  });
  afterEach(() => {
    process.env = original;
    global.fetch = originalFetch;
  });
  it("allows exactly ten free messages under concurrency and retains counts on a new session", async () => {
    const member = session(),
      results = await Promise.allSettled(
        Array.from({ length: 14 }, () => reserveUsage(member, "chat")),
      );
    expect(results.filter((v) => v.status === "fulfilled")).toHaveLength(10);
    expect(results.filter((v) => v.status === "rejected")).toHaveLength(4);
    for (const value of results)
      if (value.status === "rejected")
        expect(value.reason).toMatchObject({ code: "DAILY_LIMIT" });
    expect(await usageStatus(member)).toMatchObject({
      aiUsed: 10,
      aiRemaining: 0,
    });
    await expect(
      reserveUsage(
        { ...member, jti: "a-completely-new-login-session" },
        "chat",
      ),
    ).rejects.toMatchObject({ code: "DAILY_LIMIT" });
  });
  it("refunds once and keeps members separate", async () => {
    const member = session(),
      lease = await reserveUsage(member, "chat");
    await Promise.all([lease.refund(), lease.refund()]);
    expect(await usageStatus(member)).toMatchObject({
      aiUsed: 0,
      aiRemaining: 10,
    });
    await reserveUsage(member, "chat");
    expect(await usageStatus(session("free", "member-two"))).toMatchObject({
      aiUsed: 0,
      aiRemaining: 10,
    });
  });
  it("shares the workspace ceiling and refunds it after failures", async () => {
    process.env.AI_WORKSPACE_DAILY_LIMIT = "1";
    const lease = await reserveUsage(session(), "chat");
    await expect(
      reserveUsage(session("free", "member-two"), "chat"),
    ).rejects.toMatchObject({ code: "WORKSPACE_LIMIT" });
    await lease.refund();
    await expect(
      reserveUsage(session("free", "member-two"), "chat"),
    ).resolves.toBeDefined();
  });
  it("uses separate voice counters and blocks free premium reservations", async () => {
    await expect(reserveUsage(session(), "voice")).rejects.toMatchObject({
      code: "PRO_REQUIRED",
    });
    const member = session("pro");
    await reserveUsage(member, "voice");
    expect(await usageStatus(member)).toMatchObject({
      aiUsed: 0,
      voiceUsed: 1,
    });
  });
});
it("fails closed on Redis outages without exposing upstream responses", async () => {
  process.env = { ...original, ...serverEnv };
  global.fetch = jest.fn(async () =>
    Response.json({ error: "private upstream failure" }, { status: 500 }),
  );
  try {
    await expect(redis(["GET", "test"])).rejects.toMatchObject({
      status: 503,
      message:
        "Account services are temporarily unavailable. Please try again.",
    });
  } finally {
    process.env = original;
    global.fetch = originalFetch;
  }
});
