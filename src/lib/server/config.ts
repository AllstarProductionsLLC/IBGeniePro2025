import "server-only";
export function envInt(name: string, fallback: number, min = 1, max = 100000) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max)
    throw new Error("Invalid server configuration: " + name);
  return n;
}
export function exactOrigin(raw: string | undefined) {
  if (!raw) return "";
  try {
    const u = new URL(raw);
    if (
      u.username ||
      u.password ||
      u.search ||
      u.hash ||
      u.pathname !== "/" ||
      !(
        u.protocol === "https:" ||
        (process.env.NODE_ENV !== "production" &&
          u.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(u.hostname))
      )
    )
      return "";
    return u.origin;
  } catch {
    return "";
  }
}
export function appOrigin() {
  return exactOrigin(process.env.APP_ORIGIN);
}
export function wixOrigins() {
  return (
    process.env.WIX_ALLOWED_ORIGINS ||
    "https://www.ibgenie.com,https://ibgenie.com"
  )
    .split(",")
    .map((s) => exactOrigin(s.trim()))
    .filter(Boolean);
}
export function wixIssuer() {
  return exactOrigin(process.env.WIX_SITE_ORIGIN || "https://www.ibgenie.com");
}
export function proPlanIds() {
  return (process.env.WIX_PRO_PLAN_IDS || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
export function redisConfigured() {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL?.startsWith("https://") &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}
export function accessConfigured() {
  return !!(
    appOrigin() &&
    wixIssuer() &&
    wixOrigins().length &&
    (process.env.WIX_BRIDGE_SECRET?.length || 0) >= 32 &&
    (process.env.SESSION_SECRET?.length || 0) >= 32 &&
    process.env.SESSION_SECRET !== process.env.WIX_BRIDGE_SECRET &&
    redisConfigured() &&
    proPlanIds().length
  );
}
export function publicAccessConfig() {
  let upgradeUrl = wixIssuer() + "/plans-pricing";
  try {
    const url = new URL(process.env.WIX_UPGRADE_URL || upgradeUrl);
    if (url.protocol === "https:" && wixOrigins().includes(url.origin))
      upgradeUrl = url.href;
  } catch {}
  return {
    configured: accessConfigured(),
    text: !!process.env.GEMINI_API_KEY,
    voice: !!(
      process.env.OPENAI_API_KEY &&
      process.env.QSTASH_TOKEN &&
      accessConfigured()
    ),
    allowedOrigins: wixOrigins(),
    siteUrl: wixIssuer(),
    upgradeUrl,
    freeLimit: envInt("FREE_DAILY_MESSAGE_LIMIT", 10, 1, 1000),
    proLimit: envInt("PRO_DAILY_AI_LIMIT", 200),
    voiceLimit: envInt("PRO_DAILY_VOICE_LIMIT", 10, 1, 1000),
    voiceMinutes: envInt("VOICE_SESSION_MINUTES", 10, 1, 30),
  };
}
