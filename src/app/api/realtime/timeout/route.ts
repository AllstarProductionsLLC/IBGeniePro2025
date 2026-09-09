import { z } from "zod";
import { apiFailure, readJson } from "@/lib/server/guard";
import { stopVoice } from "@/lib/server/voice";
export const runtime = "nodejs";
export const maxDuration = 30;
export async function POST(r: Request) {
  try {
    const { token } = z
      .object({ token: z.string().max(4000) })
      .strict()
      .parse(await readJson(r));
    await stopVoice(token, true);
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiFailure(e);
  }
}
