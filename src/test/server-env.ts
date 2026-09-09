export const serverEnv = {
  APP_ORIGIN: "https://app.example.test",
  WIX_SITE_ORIGIN: "https://www.ibgenie.com",
  WIX_ALLOWED_ORIGINS: "https://www.ibgenie.com,https://ibgenie.com",
  WIX_PRO_PLAN_IDS: "pro-monthly,pro-annual",
  WIX_BRIDGE_SECRET: "test-only-bridge-secret-that-is-at-least-32-characters",
  SESSION_SECRET: "test-only-session-secret-different-from-the-bridge",
  UPSTASH_REDIS_REST_URL: "https://redis.example.test",
  UPSTASH_REDIS_REST_TOKEN: "test-only-redis-token",
  GEMINI_API_KEY: "test-only-gemini-key",
  OPENAI_API_KEY: "test-only-openai-key",
  QSTASH_TOKEN: "test-only-qstash-token",
};
export function session(tier: "free" | "pro" = "free", sub = "member-one") {
  const now = Math.floor(Date.now() / 1000);
  return {
    purpose: "app-session" as const,
    iss: "ibgenie" as const,
    aud: serverEnv.APP_ORIGIN,
    sub,
    tier,
    iat: now,
    exp: now + 300,
    jti: "test-session-identifier-1234567890",
  };
}
