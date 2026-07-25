import { leafLoginPath } from "@/lib/auth/paths";

export async function POST() {
  return Response.json(
    {
      error: "Leaf 已改用 iNon 统一账号登录。",
      loginUrl: leafLoginPath("/mine"),
    },
    { status: 410 },
  );
}
