import { handleLeafPublicSsoRoute } from "@/lib/auth/public-route";

export function GET(request: Request): Promise<Response> {
  return handleLeafPublicSsoRoute(request, "logout");
}
