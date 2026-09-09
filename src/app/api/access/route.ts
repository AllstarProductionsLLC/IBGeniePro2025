import { NextResponse } from "next/server";
import { z } from "zod";
import { apiFailure, readJson, sameOrigin } from "@/lib/server/guard";
import { publicAccessConfig } from "@/lib/server/config";
import {
  exchangeAssertion,
  readSession,
  revokeSession,
  memberKey,
} from "@/lib/server/membership";
import { usageStatus } from "@/lib/server/quota";
import { rateLimit } from "@/lib/server/redis";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(r: Request) {
  try {
    const config = publicAccessConfig(),
      session = await readSession(r);
    return NextResponse.json(
      {
        ...config,
        authenticated: !!session,
        tier: session?.tier || "guest",
        memberKey: session ? memberKey(session.sub) : null,
        expiresAt: session ? session.exp * 1000 : null,
        usage: session ? await usageStatus(session) : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiFailure(e);
  }
}
export async function POST(r: Request) {
  try {
    sameOrigin(r);
    const { assertion, nonce } = z
      .object({
        assertion: z.string().max(30000),
        nonce: z.string().regex(/^[A-Za-z0-9_-]{32,100}$/),
      })
      .strict()
      .parse(await readJson(r));
    await rateLimit("wix-exchange", 300, 60);
    return NextResponse.json(await exchangeAssertion(assertion, nonce), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return apiFailure(e);
  }
}
export async function DELETE(r: Request) {
  try {
    sameOrigin(r);
    const session = await readSession(r);
    if (session) await revokeSession(session);
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiFailure(e);
  }
}
