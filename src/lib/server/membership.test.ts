/** @jest-environment node */
import { createHmac } from "node:crypto";
import {
  paidPlans,
  makeAssertion,
} from "../../../integrations/wix/backend/ibgenie-policy";
import {
  exchangeAssertion,
  inspectAssertion,
  readSession,
  memberKey,
  createHandoff,
  redeemHandoff,
  revokeSession,
} from "./membership";
import { redis } from "./redis";
import { signToken } from "./tokens";
import { serverEnv } from "@/test/server-env";
jest.mock("./redis", () => ({ redis: jest.fn() }));
const original = { ...process.env },
  nonce = "a".repeat(48),
  data = new Map<string, string>(),
  now = Math.floor(Date.now() / 1000);
const order = {
  buyer: { memberId: "member-one" },
  planId: "pro-monthly",
  lastPaymentStatus: "PAID",
  planPrice: "19.99",
  status: "ACTIVE",
  startDate: new Date((now - 864000) * 1000),
  endDate: new Date((now + 86400) * 1000),
  currentCycle: { index: 1, endedDate: new Date((now + 3600) * 1000) },
};
beforeEach(() => {
  process.env = { ...original, ...serverEnv };
  data.clear();
  jest.mocked(redis).mockImplementation(async (command) => {
    const [operation, key, value] = command.map(String);
    if (operation === "SET") {
      if (command.includes("NX") && data.has(key)) return null;
      data.set(key, value);
      return "OK";
    }
    if (operation === "GET") return data.get(key) ?? null;
    if (operation === "GETDEL") {
      const value = data.get(key);
      data.delete(key);
      return value ?? null;
    }
    if (operation === "DEL") return Number(data.delete(key));
    throw new Error("Unexpected Redis command.");
  });
});
afterAll(() => {
  process.env = original;
});
function assertion(plans = paidPlans([order], "member-one")) {
  return makeAssertion({
    memberId: "member-one",
    plans,
    nonce,
    secret: serverEnv.WIX_BRIDGE_SECRET,
    appOrigin: serverEnv.APP_ORIGIN,
    issuer: serverEnv.WIX_SITE_ORIGIN,
  });
}
function request(token: string) {
  return new Request(serverEnv.APP_ORIGIN + "/api/access", {
    headers: { Authorization: "Bearer " + token },
  });
}
it("accepts the actual Wix signature and an approved paid plan", async () => {
  const result = await exchangeAssertion(assertion(), nonce);
  expect(await readSession(request(result.token))).toMatchObject({
    tier: "pro",
    sub: "member-one",
  });
  expect(result.expiresAt - Date.now()).toBeLessThanOrEqual(300000);
});
it("rejects similarly named unapproved plans and expired entitlements", async () => {
  for (const plans of [
    [{ id: "Ultimate Pro", until: null }],
    [{ id: "pro-monthly", until: now - 1 }],
  ]) {
    const result = await exchangeAssertion(assertion(plans), nonce);
    expect(await readSession(request(result.token))).toMatchObject({
      tier: "free",
    });
  }
});
it("bounds the session by the confirmed paid period", async () => {
  const end = Math.floor(Date.now() / 1000) + 25;
  const result = await exchangeAssertion(
    assertion([{ id: "pro-monthly", until: end }]),
    nonce,
  );
  expect(result.expiresAt).toBe(end * 1000);
});
it("consumes an assertion once during simultaneous exchanges", async () => {
  const token = assertion(),
    results = await Promise.allSettled([
      exchangeAssertion(token, nonce),
      exchangeAssertion(token, nonce),
    ]);
  expect(results.filter((v) => v.status === "fulfilled")).toHaveLength(1);
  expect(results.find((v) => v.status === "rejected")).toMatchObject({
    reason: { code: "REPLAYED_ASSERTION" },
  });
});
it.each([
  { iss: "https://attacker.test" },
  { aud: "https://other-app.test" },
  { nonce: "b".repeat(48) },
  { exp: now - 1 },
  { iat: now + 60 },
  { exp: now + 1000 },
  { isPro: true },
])("rejects invalid signed claims: %j", (changes) => {
  const payload = inspectAssertion(assertion(), nonce);
  expect(() =>
    inspectAssertion(
      signToken({ ...payload, ...changes }, serverEnv.WIX_BRIDGE_SECRET),
      nonce,
    ),
  ).toThrow();
});
it("rejects tampered signatures and unsupported algorithms", () => {
  const token = assertion(),
    parts = token.split(".");
  parts[2] = (parts[2][0] === "A" ? "B" : "A") + parts[2].slice(1);
  expect(() => inspectAssertion(parts.join("."), nonce)).toThrow();
  const content =
    Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
      "base64url",
    ) +
    "." +
    token.split(".")[1];
  expect(() =>
    inspectAssertion(
      content +
        "." +
        createHmac("sha256", serverEnv.WIX_BRIDGE_SECRET)
          .update(content)
          .digest("base64url"),
      nonce,
    ),
  ).toThrow();
});
it("revokes sessions and consumes new-tab links once without extending expiry", async () => {
  const login = await exchangeAssertion(assertion(), nonce),
    session = (await readSession(request(login.token)))!,
    url = await createHandoff(session),
    code = url.split("#connect=")[1];
  expect(new URL(url).search).toBe("");
  expect((await redeemHandoff(code)).expiresAt).toBe(login.expiresAt);
  await expect(redeemHandoff(code)).rejects.toMatchObject({ status: 401 });
  await revokeSession(session);
  await expect(readSession(request(login.token))).rejects.toMatchObject({
    status: 401,
  });
});
it("separates member identities", () => {
  expect(memberKey("member-one")).toHaveLength(64);
  expect(memberKey("member-one")).not.toBe(memberKey("member-two"));
});
describe("paid Wix order policy", () => {
  it.each([
    { lastPaymentStatus: "UNPAID" },
    { lastPaymentStatus: "REFUNDED" },
    { lastPaymentStatus: "FAILED" },
    { lastPaymentStatus: "NOT_APPLICABLE" },
    { status: "PENDING" },
    { status: "PAUSED" },
    { status: "ENDED" },
    { planPrice: "0" },
    { buyer: { memberId: "someone-else" } },
    { currentCycle: { index: 0 } },
    { startDate: new Date((now + 600) * 1000) },
    { endDate: new Date((now - 1) * 1000) },
    { endDate: "invalid" },
    { freeTrialDays: "30" },
    {
      status: "CANCELED",
      cancellation: { effectiveAt: "IMMEDIATELY", cause: "MEMBER_ACTION" },
    },
  ])("excludes ineligible orders: %j", (changes) => {
    expect(paidPlans([{ ...order, ...changes }], "member-one", now)).toEqual(
      [],
    );
  });
  it("preserves scheduled cancellation until the paid end, but excludes payment failures", () => {
    const canceled = {
      ...order,
      status: "CANCELED",
      currentCycle: undefined,
      cancellation: {
        effectiveAt: "NEXT_PAYMENT_DATE",
        cause: "MEMBER_ACTION",
      },
    };
    expect(paidPlans([canceled], "member-one", now)).toEqual([
      { id: "pro-monthly", until: now + 86400 },
    ]);
    expect(
      paidPlans(
        [
          {
            ...canceled,
            cancellation: {
              ...canceled.cancellation,
              cause: "PAYMENT_FAILURE",
            },
          },
        ],
        "member-one",
        now,
      ),
    ).toEqual([]);
    expect(
      paidPlans([{ ...canceled, endDate: undefined }], "member-one", now),
    ).toEqual([]);
  });
});
