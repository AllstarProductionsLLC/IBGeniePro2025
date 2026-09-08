import {NextResponse} from "next/server";
import {z} from "zod";
import {accessConfigured,apiFailure,ApiError,clearAccessCookie,createAccessCookie,rateLimit,readJson,sameOrigin,secureEqual,sessionIdentity} from "@/lib/server/guard";
export const runtime="nodejs";
export async function GET(r:Request){const configured=accessConfigured();return NextResponse.json({configured,authenticated:!!sessionIdentity(r),text:configured&&!!process.env.GEMINI_API_KEY,voice:configured&&!!process.env.OPENAI_API_KEY},{headers:{"Cache-Control":"no-store"}});}
export async function POST(r:Request){try{sameOrigin(r);if(!accessConfigured())throw new ApiError(503,"AI tools are not connected yet.");await rateLimit("access-attempts",20,60);const{code}=z.object({code:z.string().min(1).max(256)}).parse(await readJson(r));if(!secureEqual(code,process.env.AI_ACCESS_CODE!))throw new ApiError(401,"That access code was not recognized.");const response=NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});createAccessCookie(response);return response;}catch(e){return apiFailure(e);}}
export async function DELETE(r:Request){try{sameOrigin(r);const response=NextResponse.json({ok:true});clearAccessCookie(response);return response;}catch(e){return apiFailure(e);}}
