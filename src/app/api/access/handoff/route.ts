import { NextResponse } from "next/server";
import { z } from "zod";
import { apiFailure, readJson, sameOrigin } from "@/lib/server/guard";
import {
  createHandoff,
  redeemHandoff,
  requireMember,
} from "@/lib/server/membership";
export const runtime = "nodejs";
export async function POST(r: Request) {
  try {
    sameOrigin(r);
    const input = z
      .discriminatedUnion("action", [
        z.object({ action: z.literal("create") }).strict(),
        z
          .object({ action: z.literal("redeem"), code: z.string().max(100) })
          .strict(),
      ])
      .parse(await readJson(r));
    const result =
      input.action === "create"
        ? { url: await createHandoff(await requireMember(r)) }
        : await redeemHandoff(input.code);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return apiFailure(e);
  }
}
