import { redirect } from "next/navigation";

import { leafAccountUrl } from "@/lib/auth/paths";

export default function ChangePasswordPage() {
  redirect(leafAccountUrl);
}
