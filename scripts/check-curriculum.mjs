import { readFile } from "node:fs/promises";
const snapshot = JSON.parse(
  await readFile(
    new URL("../src/data/curriculum.json", import.meta.url),
    "utf8",
  ),
);
const checked = new Date(snapshot.checkedAt + "T00:00:00Z");
let needsReview =
  Date.now() - checked.getTime() > snapshot.reviewIntervalDays * 86400000;
if (needsReview)
  console.error(
    "Curriculum snapshot is older than " +
      snapshot.reviewIntervalDays +
      " days. An editor must review and update it.",
  );
const allowed = (url) =>
  ["ibo.org", "www.ibo.org"].includes(new URL(url).hostname);
for (const url of new Set(snapshot.updates.map((u) => u.url))) {
  try {
    if (!allowed(url))
      throw new Error("Source is outside the official IB host allowlist");
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "IBGenie-Curriculum-Review/1.0" },
    });
    if (!response.ok || !allowed(response.url))
      throw new Error(
        "HTTP " + response.status + " or unexpected redirect host",
      );
    const html = (await response.text())
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ");
    const match = html.match(
      /Last updated\s*:?\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
    );
    if (match) {
      const date = new Date(match[1] + " 00:00:00 GMT");
      if (Number.isNaN(date.getTime())) {
        console.log("MANUAL REVIEW: unrecognized update date " + url);
      } else if (date > checked) {
        needsReview = true;
        console.error("SOURCE UPDATED: " + match[1] + " " + url);
      } else
        console.log("REACHABLE: " + url + " (published date " + match[1] + ")");
    } else console.log("MANUAL REVIEW: no published update date found " + url);
  } catch (error) {
    needsReview = true;
    console.error("CHECK FAILED: " + url + " · " + error.message);
  }
}
console.log(
  "This check flags stale snapshots, changed dates and broken sources. It cannot certify syllabus completeness or detect every content change.",
);
process.exitCode = needsReview ? 1 : 0;
