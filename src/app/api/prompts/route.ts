import { NextResponse } from "next/server";
const retired = () =>
  NextResponse.json(
    {
      error:
        "This unfinished endpoint was retired. Resources are saved in the browser workspace.",
    },
    { status: 410 },
  );
export const GET = retired;
export const POST = retired;
