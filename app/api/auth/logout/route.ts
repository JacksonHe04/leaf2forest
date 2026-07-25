import { NextResponse } from "next/server";
import { leafLogoutPath } from "@/lib/auth/paths";

export async function POST(request: Request) {
  return NextResponse.redirect(
    new URL(leafLogoutPath("/"), request.url),
    303,
  );
}
