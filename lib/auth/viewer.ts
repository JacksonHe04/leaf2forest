import { InonSsoError, type InonProjectSession } from "@inon-ai/inon-sso";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getLeafSso } from "@/lib/auth/inon-sso";
import { leafLoginPath, leafRefreshPath } from "@/lib/auth/paths";
import { resolveTeamMember } from "@/lib/auth/team-members";
import type { Classmate } from "@/lib/db/types";

export type LeafViewer = {
  session: InonProjectSession;
  classmate: Classmate | null;
  isAdmin: boolean;
};

function origin(): string {
  return (
    process.env.INON_SSO_PUBLIC_ORIGIN ??
    (process.env.NODE_ENV === "production"
      ? "https://leaf.inon.space"
      : "http://localhost:3000")
  );
}

export async function currentRequest(): Promise<Request> {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie");
  return new Request(origin(), cookie ? { headers: { cookie } } : undefined);
}

export async function viewerFromRequest(
  request: Request,
): Promise<LeafViewer | null> {
  const session = await getLeafSso().getSession(request);
  if (!session) return null;
  return {
    session,
    classmate: await resolveTeamMember(session),
    isAdmin: session.projectRole === "admin",
  };
}

export async function getLeafViewer(): Promise<LeafViewer | null> {
  return viewerFromRequest(await currentRequest());
}

export async function requireLeafAdminRequest(
  request: Request,
): Promise<LeafViewer> {
  const session = await getLeafSso().requireProjectAdmin(request);
  return {
    session,
    classmate: await resolveTeamMember(session),
    isAdmin: true,
  };
}

export async function isLeafAdminRequest(request: Request): Promise<boolean> {
  try {
    await requireLeafAdminRequest(request);
    return true;
  } catch {
    return false;
  }
}

export async function requireLeafAdminPage(
  returnTo: string,
): Promise<LeafViewer> {
  const request = await currentRequest();
  try {
    return await requireLeafAdminRequest(request);
  } catch (error) {
    if (error instanceof InonSsoError) {
      if (error.code === "UNAUTHENTICATED") {
        redirect(leafLoginPath(returnTo));
      }
      if (error.code === "REFRESH_REQUIRED") {
        redirect(leafRefreshPath(returnTo));
      }
      if (error.code === "FORBIDDEN") redirect("/");
    }
    throw error;
  }
}

export function unauthorized(): Response {
  return Response.json({ error: "请先登录" }, { status: 401 });
}

export function forbidden(): Response {
  return Response.json({ error: "没有权限执行此操作" }, { status: 403 });
}
