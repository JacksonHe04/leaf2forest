import { leafAccountUrl } from "@/lib/auth/paths";

export async function POST() {
  return Response.json(
    {
      error: "密码由 iNon 统一账号管理。",
      accountUrl: leafAccountUrl,
    },
    { status: 410 },
  );
}
