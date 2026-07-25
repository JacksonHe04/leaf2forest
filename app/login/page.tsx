import { redirect } from "next/navigation";

import { getLeafSso } from "@/lib/auth/inon-sso";

function safeReturnTo(value: string | undefined): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/mine";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  redirect(getLeafSso().loginUrl(safeReturnTo((await searchParams).redirect)));
}
