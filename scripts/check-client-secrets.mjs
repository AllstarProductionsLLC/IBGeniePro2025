import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
const keys = [
  "GEMINI_API_KEY",
  "OPENAI_API_KEY",
  "WIX_BRIDGE_SECRET",
  "SESSION_SECRET",
  "UPSTASH_REDIS_REST_TOKEN",
  "QSTASH_TOKEN",
];
const files = await readdir(".next/static", { recursive: true });
let count = 0;
for (const file of files) {
  if (!/\.(js|map)$/.test(file)) continue;
  const text = await readFile(path.join(".next/static", file), "utf8");
  count++;
  for (const key of keys) {
    const value = process.env[key];
    if (
      text.includes(key) ||
      (value && value.length >= 16 && text.includes(value))
    ) {
      console.error(
        "Client bundle contains a server credential reference:",
        key,
        file,
      );
      process.exit(1);
    }
  }
}
if (!count) throw new Error("Build the app before checking client bundles.");
console.log(
  `Checked ${count} client assets: no server credential names or configured secret values found.`,
);
