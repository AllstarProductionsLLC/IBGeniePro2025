import "server-only";
import {NextResponse} from "next/server";import {ZodError} from "zod";import {ApiError} from "./errors";import {appOrigin,accessConfigured} from "./config";import {requireMember} from "./membership";import {assertEntitlement,reserveUsage,type Capability} from "./quota";
export {ApiError} from "./errors";export {accessConfigured} from "./config";export {rateLimit} from "./redis";
export function sameOrigin(r:Request){if(!appOrigin()||r.headers.get("origin")!==appOrigin())throw new ApiError(403,"Open this action from your IB Genie workspace.");}
export async function requireAI(r:Request,capability:Capability="chat"){sameOrigin(r);if(!accessConfigured())throw new ApiError(503,"Account services are not connected yet.");const session=await requireMember(r);assertEntitlement(session,capability);if(!(capability==="voice"?process.env.OPENAI_API_KEY&&process.env.QSTASH_TOKEN:process.env.GEMINI_API_KEY))throw new ApiError(503,"This AI service is not connected yet.");return reserveUsage(session,capability);}
export async function refundUsage(lease:Awaited<ReturnType<typeof requireAI>>|undefined){if(lease)try{await lease.refund();}catch{console.warn("AI request refund could not be saved");}}
export async function readLimited(r: Request, maxBytes = 100000) {
  const length = Number(r.headers.get("content-length"));
  if (Number.isFinite(length) && length > maxBytes)
    throw new ApiError(413, "Use a shorter selection.");
  if (!r.body) throw new ApiError(400, "Add content to your request.");
  const reader = r.body.getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const v = await reader.read();
      if (v.done) break;
      size += v.value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new ApiError(413, "Use a shorter selection.");
      }
      chunks.push(v.value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}
export async function readJson(r: Request) {
  try {
    return JSON.parse((await readLimited(r)).toString("utf8"));
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(400, "The request was not valid JSON.");
  }
}
export function apiFailure(e: unknown) {
  const status =
    e instanceof ApiError
      ? e.status
      : e instanceof ZodError || e instanceof SyntaxError
        ? 400
        : 502;
  return NextResponse.json(
    {
      code: e instanceof ApiError ? e.code : undefined,
      error:
        e instanceof ApiError
          ? e.message
          : status === 400
            ? "Check the fields and try again."
            : "The AI service could not complete this request. Your work is still here.",
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(status === 429 ? { "Retry-After": "60" } : {}),
      },
    },
  );
}
