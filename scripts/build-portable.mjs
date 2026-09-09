import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const preload = fileURLToPath(
  new URL("./portable-memory.cjs", import.meta.url),
);
const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_TEST_WASM: "1",
      NEXT_TEST_WASM_DIR: fileURLToPath(
        new URL("../node_modules/@next/swc-wasm-nodejs/", import.meta.url),
      ),
      NEXT_TELEMETRY_DISABLED: "1",
      NODE_OPTIONS: (
        (process.env.NODE_OPTIONS || "") +
        " --require=" +
        preload
      ).trim(),
    },
  },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
