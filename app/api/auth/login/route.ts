import { getLeafSso } from "@/lib/auth/inon-sso";

export async function POST() {
  return Response.json(
    {
      error: "Leaf 已改用 iNon 统一账号登录。",
      loginUrl: getLeafSso().loginUrl("/mine"),
    },
    { status: 410 },
  );
}
