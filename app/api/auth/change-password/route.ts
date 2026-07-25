export async function POST() {
  return Response.json(
    {
      error: "密码由 iNon 统一账号管理。",
      accountUrl: "https://inon.space/sso/account",
    },
    { status: 410 },
  );
}
