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
import {
  resourceContentSchema,
  resourceKinds,
  resourceSchema,
} from "@/lib/workspace";
import { programYears } from "@/lib/learning-tools";
export const runtime = "nodejs";
const schema = z.object({
  profile: contextSchema,
  kind: z.enum(resourceKinds),
  subject: z.string().min(1).max(100),
  source: z.string().min(1).max(24000),
  count: z.number().int().min(3).max(20),
  difficulty: z.enum(["Support", "Mixed", "Extension"]),
  years: z.number().int().min(1).max(6).optional(),
});
export const maxDuration = 60;
export async function POST(r: Request) {
  let lease: Awaited<ReturnType<typeof requireAI>> | undefined;
  try {
    lease = await requireAI(r, "resources");
    const d = schema.parse(await readJson(r));
    if (d.years && d.years > programYears[d.profile.program])
      throw new ApiError(400, "Check the number of programme years.");
    const structured =
      d.kind === "presentation"
        ? ` For this presentation include presentation:{slides:[{id,layout,title,bullets,prompt,notes}]}. Create ${Math.min(d.count, 16)} complete classroom slides with unique IDs. layout is title, explain, activity or check. Keep title under 90 characters, at most 5 bullets each under 160 characters, prompt under 240 characters, notes under 2000 characters. Use a strong learning sequence: retrieval, explain with concrete examples, guided practice, independent application, exit check. Provide actual usable teaching content, questions and answers in notes, not placeholder instructions to create content. Title slides may have no bullets. For PYP use concrete familiar examples and simple language, MYP inquiry and transfer, DP disciplinary depth and evaluation. Include source URLs from supplied materials in speaker notes; do not invent citations. body, cards and questions are empty. Do not include sequence.`
        : d.kind === "scope-sequence"
          ? ` Include sequence:{years:${d.years || programYears[d.profile.program]},units:[{id,year,title,weeks,goals,inquiry,skills,assessment,connections}]}. Exactly 3 substantial units per year, sequentially for every selected year starting at 1. weeks is a positive integer, together at most 40 per year. Each text field is a string under 500 characters. goals describe increasingly demanding knowledge and skills; inquiry includes PYP transdisciplinary inquiry or MYP concepts/global contexts or DP subject questions; skills describe ATL practice; assessment describes evidence and formative checks; connections explain prerequisites and progression. Use supplied course materials for coverage. Identify assumptions and topics the teacher must verify in body. This is an editable planning draft, not an official or exhaustive IB syllabus. No invented required units, criteria or hours. cards and questions are empty. Do not include presentation.`
          : "";
    const prompt =
      tutorInstructions(d.profile, d.subject) +
      "\nCreate an original " +
      d.kind +
      " at " +
      d.difficulty +
      " level. Use " +
      d.count +
      " items for cards or quizzes; lesson plans total 50 minutes. Return JSON only: {title,summary,body,cards,questions}. title and summary are strings under 150 and 400 characters. body is Markdown. cards are {id,front,back}. questions are {id,question,options,correctAnswer,explanation}, with four plausible options and zero-based correctAnswer. Include worked explanations. IDs must be unique. Use only cards for flashcards, only questions for quizzes, and only body for other types; unused strings and arrays must be empty. Include misconceptions and application. Lessons need goals, timings, support, extension and an exit ticket. Rubrics must be original formative criteria, not official mark schemes. Do not invent IB assessments or requirements." +
      structured;
    const raw = await generateText(
      prompt,
      [{ role: "user", parts: [{ text: d.source }] }],
      true,
    );
    let parsed;
    try {
      parsed = resourceContentSchema.parse(JSON.parse(raw));
    } catch {
      throw new ApiError(
        502,
        "The AI draft was not usable. Try a smaller request.",
      );
    }
    if (
      d.kind === "scope-sequence" &&
      parsed.sequence?.years !== (d.years || programYears[d.profile.program])
    )
      throw new ApiError(
        502,
        "The draft did not cover the requested programme years. Try again.",
      );
    const checked = resourceSchema.safeParse({
      ...parsed,
      id: "validation",
      kind: d.kind,
      subject: d.subject,
      program: d.profile.program,
      level: d.profile.level,
      examYear: d.profile.examYear,
      createdAt: new Date().toISOString(),
      origin: "ai",
      starred: false,
      sourceNotes: d.source,
    });
    if (!checked.success)
      throw new ApiError(
        502,
        "The draft contained incomplete cards or questions. Try again.",
      );
    return NextResponse.json(parsed, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    await refundUsage(lease);
    return apiFailure(e);
  }
}
