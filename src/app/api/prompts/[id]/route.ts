import { NextResponse } from "next/server";
const retired = () =>
  NextResponse.json(
    {
      error: "This unfinished endpoint was retired. Use the resource library.",
    },
    { status: 410 },
  );
export const GET = retired;
export const PUT = retired;
export const DELETE = retired;
