import { redirect } from "next/navigation";

import { leafLoginPath } from "@/lib/auth/paths";

function safeReturnTo(value: string | undefined): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/mine";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  redirect(leafLoginPath(safeReturnTo((await searchParams).redirect)));
}
