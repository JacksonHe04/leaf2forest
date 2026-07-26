import { handleLeafPublicSsoRoute } from "@/lib/auth/public-route";

export function GET(request: Request): Response {
  return handleLeafPublicSsoRoute(request, "logout");
}
