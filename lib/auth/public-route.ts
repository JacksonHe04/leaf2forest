import { getLeafSso } from "@/lib/auth/inon-sso";

export function handleLeafPublicSsoRoute(
  request: Request,
  action: "login" | "logout" | "refresh",
): Response {
  const sso = getLeafSso();
  return sso.transition(request, action);
}
