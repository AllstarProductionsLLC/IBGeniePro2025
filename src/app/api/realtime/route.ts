import { z } from "zod";
import { contextSchema, coachModes, tutorInstructions } from "@/lib/server/ai";
import { apiFailure, ApiError, readJson, requireAI } from "@/lib/server/guard";
export const runtime = "nodejs";
const schema = z.object({
  profile: contextSchema,
  subject: z.string().min(1).max(100),
  mode: z.enum(coachModes),
  sdp: z
    .string()
    .min(10)
    .max(50000)
    .refine((s) => s.startsWith("v=0")),
});
export async function POST(r: Request) {
  try {
    const identity = await requireAI(r, "voice");
    const d = schema.parse(await readJson(r));
    const form = new FormData();
    form.set("sdp", d.sdp);
    form.set(
      "session",
      JSON.stringify({
        type: "realtime",
        model: process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2.1",
        instructions:
          tutorInstructions(d.profile, d.subject, d.mode) +
          "\nThis is live voice. Keep answers short, identify yourself as an AI coach, let the learner finish, and ask one question at a time.",
        max_output_tokens: 1024,
        audio: {
          input: {
            transcription: { model: "gpt-4o-mini-transcribe" },
            turn_detection: {
              type: "server_vad",
              create_response: true,
              interrupt_response: true,
            },
          },
          output: { voice: "marin" },
        },
      }),
    );
    const response = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.OPENAI_API_KEY,
        "OpenAI-Safety-Identifier": identity,
      },
      body: form,
      signal: AbortSignal.timeout(25000),
      cache: "no-store",
    });
    if (!response.ok)
      throw new ApiError(
        response.status === 429 ? 429 : 502,
        "The voice service could not connect. Try again or use text.",
      );
    const sdp = await response.text();
    if (!sdp.startsWith("v=0"))
      throw new ApiError(502, "The voice connection was invalid.");
    return new Response(sdp, {
      headers: {
        "Content-Type": "application/sdp",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return apiFailure(e);
  }
}
