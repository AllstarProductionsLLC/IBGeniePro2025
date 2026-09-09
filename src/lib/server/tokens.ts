import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { ApiError } from "./errors";
export function randomId() {
  return randomBytes(24).toString("base64url");
}
export function signToken(value: unknown, secret: string) {
  if (secret.length < 32)
    throw new ApiError(503, "Account signing is not configured.");
  const head = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" }),
    ).toString("base64url"),
    body = Buffer.from(JSON.stringify(value)).toString("base64url"),
    content = head + "." + body;
  return (
    content +
    "." +
    createHmac("sha256", secret).update(content).digest("base64url")
  );
}
export function verifyToken(token: string, secret: string): unknown {
  try {
    if (secret.length < 32 || token.length > 30000) throw new Error();
    const parts = token.split(".");
    if (
      parts.length !== 3 ||
      parts.some((p) => !p || !/^[A-Za-z0-9_-]+$/.test(p))
    )
      throw new Error();
    const expected = createHmac("sha256", secret)
        .update(parts[0] + "." + parts[1])
        .digest(),
      signature = Buffer.from(parts[2], "base64url");
    if (
      signature.length !== expected.length ||
      !timingSafeEqual(signature, expected)
    )
      throw new Error();
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
    if (header.alg !== "HS256" || header.typ !== "JWT" || header.crit)
      throw new Error();
    return JSON.parse(Buffer.from(parts[1], "base64url").toString());
  } catch {
    throw new ApiError(
      401,
      "Your Wix connection could not be verified. Reconnect from IB Genie.",
      "INVALID_SESSION",
    );
  }
}
export const assertionSchema = z
  .object({
    purpose: z.literal("wix-member"),
    iss: z.string().url(),
    aud: z.string().url(),
    sub: z.string().min(1).max(100),
    iat: z.number().int(),
    exp: z.number().int(),
    jti: z.string().min(16).max(100),
    nonce: z.string().min(32).max(100),
    plans: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          until: z.number().int().nullable(),
        }),
      )
      .max(100),
  })
  .strict();
export const sessionSchema = z
  .object({
    purpose: z.literal("app-session"),
    iss: z.literal("ibgenie"),
    aud: z.string(),
    sub: z.string().min(1).max(100),
    tier: z.enum(["free", "pro"]),
    iat: z.number().int(),
    exp: z.number().int(),
    jti: z.string().min(16).max(100),
  })
  .strict();
export type MemberSession = z.infer<typeof sessionSchema>;
