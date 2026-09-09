/** @jest-environment node */
import { scheduleVoiceEnd, stopVoice } from "./voice";
import { redis } from "./redis";
import { requireAI } from "./guard";
import { POST as startCall } from "@/app/api/realtime/route";
import { serverEnv, session } from "@/test/server-env";
jest.mock("./redis", () => ({ redis: jest.fn() }));
jest.mock("./guard", () => ({
  ...jest.requireActual("./guard"),
  requireAI: jest.fn(),
}));
const original = { ...process.env },
  originalFetch = global.fetch;
let stored: string | null, jobToken: string;
beforeEach(() => {
  process.env = { ...original, ...serverEnv, VOICE_SESSION_MINUTES: "1" };
  stored = null;
  jobToken = "";
  jest.mocked(redis).mockImplementation(async (command) => {
    if (command[0] === "SET") {
      stored = String(command[2]);
      return "OK";
    }
    if (command[0] === "GET") return stored;
    if (command[0] === "DEL") {
      stored = null;
      return 1;
    }
    throw new Error("Unexpected command.");
  });
  global.fetch = jest.fn(async (url, init) => {
    if (String(url).startsWith("https://qstash.upstash.io/")) {
      jobToken = JSON.parse(String(init?.body)).token;
      expect(new Headers(init?.headers).get("Upstash-Delay")).toBe("60s");
    }
    return Response.json({ messageId: "test-job" });
  });
});
afterEach(() => {
  jest.restoreAllMocks();
  global.fetch = originalFetch;
  process.env = original;
});
it("schedules a signed server cutoff and prevents early or forged timer requests", async () => {
  const result = await scheduleVoiceEnd("rtc_test123456", "member-key");
  expect(result.maxSeconds).toBe(60);
  expect(jobToken).not.toBe("");
  await expect(stopVoice(jobToken, true)).rejects.toMatchObject({
    status: 425,
  });
  await expect(stopVoice(result.stopToken, true)).rejects.toMatchObject({
    status: 401,
  });
  await expect(stopVoice("forged", false)).rejects.toMatchObject({
    status: 401,
  });
  expect(global.fetch).toHaveBeenCalledTimes(1);
  const later = Date.now() + 61000;
  jest.spyOn(Date, "now").mockReturnValue(later);
  await stopVoice(jobToken, true);
  expect(global.fetch).toHaveBeenCalledWith(
    "https://api.openai.com/v1/realtime/calls/rtc_test123456/hangup",
    expect.objectContaining({ method: "POST" }),
  );
  await stopVoice(jobToken, true);
  expect(global.fetch).toHaveBeenCalledTimes(2);
});
it("requires the matching purpose-bound stop token", async () => {
  const result = await scheduleVoiceEnd("rtc_test123456", "member-key");
  await expect(stopVoice(jobToken, false)).rejects.toMatchObject({
    status: 401,
  });
  await stopVoice(result.stopToken);
  expect(stored).toBeNull();
});
it("fails closed if delayed termination cannot be scheduled", async () => {
  global.fetch = jest.fn(async () =>
    Response.json({ error: "unavailable" }, { status: 503 }),
  );
  await expect(
    scheduleVoiceEnd("rtc_test123456", "member-key"),
  ).rejects.toMatchObject({ status: 503 });
});
it("hangs up and refunds a newly created call if its server timer fails, without returning SDP", async () => {
  const refund = jest.fn(async () => {});
  jest
    .mocked(requireAI)
    .mockResolvedValue({
      identity: "member-key",
      session: session("pro"),
      refund,
    });
  global.fetch = jest.fn(async (url) => {
    if (String(url).endsWith("/v1/realtime/calls"))
      return new Response("v=0\r\na=test-sdp", {
        status: 201,
        headers: { Location: "/v1/realtime/calls/rtc_test123456" },
      });
    if (String(url).startsWith("https://qstash.upstash.io"))
      return Response.json({ error: "failed" }, { status: 503 });
    return Response.json({ ok: true });
  });
  const r = await startCall(
    new Request(serverEnv.APP_ORIGIN + "/api/realtime", {
      method: "POST",
      headers: {
        origin: serverEnv.APP_ORIGIN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile: {
          role: "student",
          program: "dp",
          examYear: 2027,
          examSession: "May",
          level: "HL",
        },
        subject: "Biology",
        mode: "Understand a concept",
        sdp: "v=0\r\na=test-sdp",
      }),
    }),
  );
  expect(r.status).toBe(503);
  expect(await r.json()).not.toHaveProperty("sdp");
  expect(refund).toHaveBeenCalledTimes(1);
  expect(global.fetch).toHaveBeenCalledWith(
    "https://api.openai.com/v1/realtime/calls/rtc_test123456/hangup",
    expect.anything(),
  );
});
