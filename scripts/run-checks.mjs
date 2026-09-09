import { spawnSync } from "node:child_process";
const jest = "node_modules/jest/bin/jest.js";
// PptxGenJS loads Node built-ins via import(). Isolate its integration suite
// from the legacy icon package's CommonJS tests, which use a separate Jest VM.
const runs = [
  [
    jest,
    "--runInBand",
    "--testPathIgnorePatterns=resource-export.test.ts",
    ...process.argv.slice(2),
  ],
  [
    "--experimental-vm-modules",
    jest,
    "--runInBand",
    "--runTestsByPath",
    "src/lib/resource-export.test.ts",
  ],
];
for (const args of runs) {
  const r = spawnSync(process.execPath, args, {
    stdio: "inherit",
    env: process.env,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status ?? 1);
}
