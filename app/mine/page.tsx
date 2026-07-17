import { redirect } from "next/navigation";
import { getCurrentClassmate } from "@/lib/db/supabase-server";
import { MineClient } from "./MineClient";

/**
 * Mine page — the classmate's personal dashboard.
 *
 * If not authenticated → redirect to /login.
 * If authenticated → show tabbed interface:
 *   Tab 1 (default): Edit personal info + preview link
 *   Tab 2: Account management (change password)
 */
export default async function MinePage() {
  const classmate = await getCurrentClassmate();

  if (!classmate) {
    redirect("/login?redirect=/mine");
  }

  return <MineClient classmate={classmate} />;
}
