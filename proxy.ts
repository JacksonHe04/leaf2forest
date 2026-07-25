import { NextResponse, type NextRequest } from "next/server";

import { getLeafSso } from "@/lib/auth/inon-sso";

export async function proxy(request: NextRequest) {
  const session = await getLeafSso().getSession(request);
  if (!session) {
    return NextResponse.redirect(
      new URL(
        getLeafSso().loginUrl(request.nextUrl.pathname),
        request.url,
      ),
    );
  }
  if (session.projectRole !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
