import "server-only";
import { envInt } from "./config";
import { memberKey } from "./membership";
import { redis, rateLimit } from "./redis";
import { ApiError } from "./errors";
import type { MemberSession } from "./tokens";
export type Capability = "chat" | "resources" | "rubric" | "voice";
export function usageWindow(now = new Date()) {
  const day = now.toISOString().slice(0, 10),
    reset = new Date(day + "T00:00:00.000Z").getTime() + 86400000;
  return { day, reset, ttl: Math.ceil((reset - now.getTime()) / 1000) + 120 };
}
export function planLimit(
  session: Pick<MemberSession, "tier">,
  capability: Capability,
) {
  return capability === "voice"
    ? envInt("PRO_DAILY_VOICE_LIMIT", 10, 1, 1000)
    : session.tier === "free"
      ? envInt("FREE_DAILY_MESSAGE_LIMIT", 10, 1, 1000)
      : envInt("PRO_DAILY_AI_LIMIT", 200);
}
export function assertEntitlement(
  session: Pick<MemberSession, "tier">,
  capability: Capability,
) {
  if (session.tier !== "pro" && capability !== "chat")
    throw new ApiError(
      403,
      "This tool is included with an active IB Genie Pro subscription.",
      "PRO_REQUIRED",
    );
}
function usageKey(session: MemberSession, capability: Capability) {
  return (
    "ibgenie:usage:" +
    usageWindow().day +
    ":" +
    memberKey(session.sub) +
    ":" +
    (capability === "voice" ? "voice" : "ai")
  );
}
export async function usageStatus(session: MemberSession) {
  const [text, voice] = await redis<(string | null)[]>([
      "MGET",
      usageKey(session, "chat"),
      usageKey(session, "voice"),
    ]),
    aiLimit = planLimit(session, "chat"),
    voiceLimit = session.tier === "pro" ? planLimit(session, "voice") : 0;
  return {
    aiUsed: Number(text) || 0,
    aiLimit,
    aiRemaining: Math.max(0, aiLimit - (Number(text) || 0)),
    voiceUsed: Number(voice) || 0,
    voiceLimit,
    voiceRemaining: Math.max(0, voiceLimit - (Number(voice) || 0)),
    resetsAt: new Date(usageWindow().reset).toISOString(),
  };
}
const reserveScript =
  "local u=tonumber(redis.call('GET',KEYS[1]) or '0'); local g=tonumber(redis.call('GET',KEYS[2]) or '0'); if u>=tonumber(ARGV[1]) then return -1 end; if g>=tonumber(ARGV[2]) then return -2 end; for i=1,2 do redis.call('INCR',KEYS[i]); redis.call('EXPIRE',KEYS[i],ARGV[3]) end; return u+1";
export async function reserveUsage(
  session: MemberSession,
  capability: Capability,
) {
  assertEntitlement(session, capability);
  const identity = memberKey(session.sub);
  await rateLimit(
    "member:" + identity + ":" + capability,
    capability === "voice" ? 3 : 15,
    60,
  );
  const window = usageWindow(),
    userKey = usageKey(session, capability),
    globalKey =
      "ibgenie:usage:" +
      window.day +
      ":workspace:" +
      (capability === "voice" ? "voice" : "ai");
  const result = await redis<number>([
    "EVAL",
    reserveScript,
    2,
    userKey,
    globalKey,
    planLimit(session, capability),
    envInt(
      capability === "voice"
        ? "VOICE_WORKSPACE_DAILY_LIMIT"
        : "AI_WORKSPACE_DAILY_LIMIT",
      capability === "voice" ? 100 : 2000,
    ),
    window.ttl,
  ]);
  if (result === -1)
    throw new ApiError(
      429,
      session.tier === "free"
        ? "You’ve used today’s free messages. Upgrade to Pro or return after the daily reset."
        : "You’ve reached today’s plan allowance. It resets at midnight UTC.",
      "DAILY_LIMIT",
    );
  if (result === -2)
    throw new ApiError(
      429,
      "The workspace has reached its daily AI allowance. Please try again after the reset.",
      "WORKSPACE_LIMIT",
    );
  if (!Number.isInteger(result) || result < 1)
    throw new ApiError(503, "Usage services are temporarily unavailable.");
  let refunded = false;
  return {
    identity,
    session,
    refund: async () => {
      if (refunded) return;
      refunded = true;
      await redis([
        "EVAL",
        "for i=1,2 do local n=tonumber(redis.call('GET',KEYS[i]) or '0'); if n>0 then redis.call('DECR',KEYS[i]) end end; return 1",
        2,
        userKey,
        globalKey,
      ]);
    },
  };
}
