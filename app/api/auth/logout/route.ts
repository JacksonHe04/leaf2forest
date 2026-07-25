import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.redirect(
    new URL("/api/auth/inon/logout?returnTo=%2F", request.url),
    303,
  );
}
