import "server-only";
import { createHash } from "node:crypto";
import { appOrigin, accessConfigured, proPlanIds, wixIssuer } from "./config";
import { redis } from "./redis";
import { ApiError } from "./errors";
import {
  assertionSchema,
  sessionSchema,
  signToken,
  verifyToken,
  randomId,
  type MemberSession,
} from "./tokens";
export function memberKey(memberId: string) {
  return createHash("sha256")
    .update(wixIssuer() + ":" + memberId)
    .digest("hex");
}
export function inspectAssertion(
  assertion: string,
  nonce: string,
  now = Math.floor(Date.now() / 1000),
) {
  let data;
  try {
    data = assertionSchema.parse(
      verifyToken(assertion, process.env.WIX_BRIDGE_SECRET || ""),
    );
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      401,
      "Your Wix connection was invalid.",
      "INVALID_SESSION",
    );
  }
  if (
    data.iss !== wixIssuer() ||
    data.aud !== appOrigin() ||
    data.nonce !== nonce ||
    data.iat > now + 15 ||
    data.iat < now - 120 ||
    data.exp <= now ||
    data.exp - data.iat > 120 ||
    data.exp <= data.iat
  )
    throw new ApiError(
      401,
      "Your Wix connection expired. Reconnect from IB Genie.",
      "INVALID_SESSION",
    );
  return data;
}
export async function exchangeAssertion(assertion: string, nonce: string) {
  if (!accessConfigured())
    throw new ApiError(503, "Wix access is not connected yet.");
  const now = Math.floor(Date.now() / 1000),
    data = inspectAssertion(assertion, nonce, now);
  if (
    (await redis([
      "SET",
      "ibgenie:wix-once:" + data.jti,
      "1",
      "NX",
      "EX",
      180,
    ])) !== "OK"
  )
    throw new ApiError(
      401,
      "This Wix connection has already been used. Please reconnect.",
      "REPLAYED_ASSERTION",
    );
  const eligible = data.plans.filter(
      (p) => proPlanIds().includes(p.id) && (p.until === null || p.until > now),
    ),
    latestEnd = eligible.reduce(
      (end, p) => Math.max(end, p.until ?? now + 300),
      0,
    );
  return issueSession({
    purpose: "app-session",
    iss: "ibgenie",
    aud: appOrigin(),
    sub: data.sub,
    tier: eligible.length ? "pro" : "free",
    iat: now,
    exp: Math.min(now + 300, eligible.length ? latestEnd : now + 300),
    jti: randomId(),
  });
}
export async function issueSession(session: MemberSession) {
  const token = signToken(session, process.env.SESSION_SECRET || "");
  await redis([
    "SET",
    "ibgenie:session:" + session.jti,
    memberKey(session.sub),
    "EX",
    Math.max(1, session.exp - Math.floor(Date.now() / 1000)),
  ]);
  return { token, expiresAt: session.exp * 1000 };
}
export async function readSession(r: Request): Promise<MemberSession | null> {
  const auth = r.headers.get("authorization");
  if (!auth) return null;
  if (!accessConfigured())
    throw new ApiError(503, "Wix access is not connected yet.");
  let session;
  try {
    session = sessionSchema.parse(
      verifyToken(
        auth.startsWith("Bearer ") ? auth.slice(7) : "",
        process.env.SESSION_SECRET || "",
      ),
    );
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      401,
      "Your session was invalid. Reconnect from IB Genie.",
      "INVALID_SESSION",
    );
  }
  const now = Math.floor(Date.now() / 1000);
  if (
    session.aud !== appOrigin() ||
    session.exp <= now ||
    session.iat > now + 15 ||
    session.exp - session.iat > 300 ||
    session.exp <= session.iat
  )
    throw new ApiError(
      401,
      "Reconnect to refresh your Wix membership.",
      "SESSION_EXPIRED",
    );
  if (
    (await redis(["GET", "ibgenie:session:" + session.jti])) !==
    memberKey(session.sub)
  )
    throw new ApiError(
      401,
      "This session ended. Reconnect from IB Genie.",
      "SESSION_EXPIRED",
    );
  return session;
}
export async function requireMember(r: Request) {
  const session = await readSession(r);
  if (!session)
    throw new ApiError(
      401,
      "Sign in through IB Genie to use your free messages or Pro plan.",
      "SIGN_IN_REQUIRED",
    );
  return session;
}
export async function revokeSession(session: MemberSession) {
  await redis(["DEL", "ibgenie:session:" + session.jti]);
}
export async function createHandoff(session: MemberSession) {
  const code = randomId();
  await redis([
    "SET",
    "ibgenie:handoff:" + createHash("sha256").update(code).digest("hex"),
    JSON.stringify(session),
    "EX",
    45,
  ]);
  return appOrigin() + "/#connect=" + code;
}
export async function redeemHandoff(code: string) {
  if (!/^[A-Za-z0-9_-]{32}$/.test(code))
    throw new ApiError(401, "This link is invalid.");
  const raw = await redis<string | null>([
    "GETDEL",
    "ibgenie:handoff:" + createHash("sha256").update(code).digest("hex"),
  ]);
  if (!raw)
    throw new ApiError(
      401,
      "This link expired or was already opened. Open a new link from your Wix workspace.",
    );
  const session = sessionSchema.parse(JSON.parse(raw));
  if (
    session.exp <= Math.floor(Date.now() / 1000) ||
    (await redis(["GET", "ibgenie:session:" + session.jti])) !==
      memberKey(session.sub)
  )
    throw new ApiError(401, "This session ended. Reconnect from IB Genie.");
  return issueSession({ ...session, jti: randomId() });
}
