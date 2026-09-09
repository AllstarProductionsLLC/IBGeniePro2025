import { NextResponse } from "next/server";
import { z } from "zod";
import {
  contextSchema,
  generateText,
  tutorInstructions,
} from "@/lib/server/ai";
import {
  apiFailure,
  ApiError,
  readJson,
  requireAI,
  refundUsage,
} from "@/lib/server/guard";
import { validateGrammar } from "@/lib/server/feedback-validation";
export const runtime = "nodejs";
export const maxDuration = 60;
const schema = z.object({
  profile: contextSchema,
  work: z.string().min(10).max(12000),
  language: z.string().min(1).max(60),
  dialect: z.enum(["British English", "American English", "Match my text"]),
  consent: z.literal(true),
});
export async function POST(r: Request) {
  let lease: Awaited<ReturnType<typeof requireAI>> | undefined;
  try {
    lease = await requireAI(r, "resources");
    const d = schema.parse(await readJson(r));
    const raw = await generateText(
      tutorInstructions(d.profile, d.language) +
        `\nReview grammar, spelling, punctuation and local clarity in ${d.language}; preference ${d.dialect}. Preserve the author's meaning, voice and argument. Never write or substantially rewrite an assessed submission. Explain each small edit as a learning opportunity. Do not add facts or content. Return JSON {summary,suggestions:[{original,replacement,reason,category}],practice}. At most 20 targeted suggestions, each original is an exact substring of the submitted text under 500 characters, replacement under 700 characters. category is Grammar, Spelling, Punctuation, or Clarity. No overlapping suggestions. summary, reason and practice under 800 characters. practice is one small exercise based on a pattern in the writing, not an answer to the assignment. If no corrections are needed, return an empty suggestions array. Adapt language to the learner's programme and year.`,
      [{ role: "user", parts: [{ text: d.work }] }],
      true,
    );
    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch {
      throw new ApiError(
        502,
        "The writing review was not usable. Try a shorter selection.",
      );
    }
    return NextResponse.json(validateGrammar(value, d.work), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    await refundUsage(lease);
    return apiFailure(e);
  }
}
