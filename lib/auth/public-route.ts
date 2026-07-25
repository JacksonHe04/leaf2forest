import { getLeafSso } from "@/lib/auth/inon-sso";

export function handleLeafPublicSsoRoute(
  request: Request,
  action: "login" | "logout" | "refresh",
): Promise<Response> {
  const sso = getLeafSso();
  const url = new URL(request.url);
  url.pathname = `${sso.basePath}/${action}`;
  return sso.handler(new Request(url, request));
}
