import { NextResponse } from "next/server";
import { z } from "zod";
import {
  contextSchema,
  coachModes,
  generateText,
  tutorInstructions,
} from "@/lib/server/ai";
import {
  apiFailure,
  ApiError,
  readJson,
  readLimited,
  requireAI,
  refundUsage,
} from "@/lib/server/guard";
const historySchema = z
  .array(
    z.object({
      role: z.enum(["user", "model"]),
      parts: z
        .array(z.object({ text: z.string().max(12000) }))
        .min(1)
        .max(1),
    }),
  )
  .max(24)
  .refine((h) => h.reduce((n, m) => n + m.parts[0].text.length, 0) <= 60000);
const schema = z.object({
  profile: contextSchema,
  subject: z.string().min(1).max(100),
  mode: z.enum(coachModes).default("Understand a concept"),
  message: z.string().min(1).max(12000),
  history: historySchema.default([]),
});
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(r: Request) {
  let lease: Awaited<ReturnType<typeof requireAI>> | undefined;
  try {
    lease = await requireAI(r, "chat");
    let value: unknown;
    let attachment:
      { inlineData: { data: string; mimeType: string } } | undefined;
    if (r.headers.get("content-type")?.includes("multipart/form-data")) {
      const bytes = await readLimited(r, 6 * 1024 * 1024);
      const form = await new Request(r.url, {
        method: "POST",
        headers: { "Content-Type": r.headers.get("content-type")! },
        body: new Uint8Array(bytes),
      }).formData();
      value = {
        profile: {
          role: form.get("role"),
          program: form.get("program"),
          examYear: Number(form.get("examYear") || 2027),
          examSession: form.get("examSession") || "May",
          level: form.get("level") || "SL",
        },
        subject: form.get("subject") || "General",
        message: form.get("message"),
        history: JSON.parse(String(form.get("history") || "[]")).slice(-24),
      };
      const file = form.get("file");
      if (file instanceof File && file.size) {
        if (
          file.size > 4 * 1024 * 1024 ||
          ![
            "application/pdf",
            "image/png",
            "image/jpeg",
            "text/plain",
          ].includes(file.type)
        )
          throw new ApiError(
            400,
            "Use a PDF, PNG, JPG or text file under 4 MB.",
          );
        attachment = {
          inlineData: {
            mimeType: file.type,
            data: Buffer.from(await file.arrayBuffer()).toString("base64"),
          },
        };
      }
    } else value = await readJson(r);
    const d = schema.parse(value);
    const parts: ({ text: string } | NonNullable<typeof attachment>)[] = [
      { text: d.message },
    ];
    if (attachment) parts.push(attachment);
    const message = await generateText(
      tutorInstructions(d.profile, d.subject, d.mode),
      [...d.history, { role: "user", parts }],
    );
    return NextResponse.json(
      { message },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    await refundUsage(lease);
    return apiFailure(e);
  }
}
