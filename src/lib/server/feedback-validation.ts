import "server-only";
import { ApiError } from "./errors";
import {
  feedbackSchema,
  grammarSchema,
  type Criterion,
  type Feedback,
} from "@/lib/learning-tools";

export function validateFeedback(
  value: unknown,
  work: string,
  criteria: Criterion[],
  scoring: boolean,
): Feedback {
  const parsed = feedbackSchema.safeParse(value);
  if (!parsed.success)
    throw new ApiError(
      502,
      "The feedback draft was incomplete. Try a shorter selection.",
    );
  const r = parsed.data;
  if (
    r.criteria.length !== criteria.length ||
    new Set(r.criteria.map((c) => c.id)).size !== r.criteria.length
  )
    throw new ApiError(502, "The draft did not match your rubric. Try again.");
  for (const c of r.criteria) {
    const criterion = criteria.find((d) => d.id === c.id);
    if (
      !criterion ||
      (c.score !== null && (criterion.max === null || c.score > criterion.max))
    )
      throw new ApiError(502, "The draft used a mark outside your rubric.");
    // An unverifiable quotation must never support a numerical suggestion.
    if (!c.evidence || !work.includes(c.evidence)) {
      c.evidence = "";
      c.score = null;
    }
    if (!scoring) c.score = null;
  }
  return r;
}
export function validateGrammar(value: unknown, work: string) {
  const parsed = grammarSchema.safeParse(value);
  if (!parsed.success)
    throw new ApiError(
      502,
      "The grammar draft was incomplete. Try a shorter selection.",
    );
  if (parsed.data.suggestions.some((s) => !work.includes(s.original)))
    throw new ApiError(
      502,
      "Some suggestions did not match your text. Try a shorter selection.",
    );
  return parsed.data;
}
