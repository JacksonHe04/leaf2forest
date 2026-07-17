import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getCurrentClassmate } from "@/lib/db/supabase-server";
import { listRecordings } from "@/lib/db/recordings";
import { getPublicUrl, BUCKET_IMAGES } from "@/lib/storage";
import { MineClient } from "./MineClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "我的叶子 · Leaf2Forest",
};

/**
 * Mine page — the classmate's personal dashboard.
 *
 * Shows the same profile layout as /forest/[id] with inline editing,
 * plus an account management tab.
 */
export default async function MinePage() {
  const classmate = await getCurrentClassmate();

  if (!classmate) {
    redirect("/login?redirect=/mine");
  }

  const avatarUrl = classmate.avatar_path
    ? getPublicUrl(BUCKET_IMAGES, classmate.avatar_path)
    : null;

  const recordings = await listRecordings({ peopleId: classmate.id });

  return (
    <MineClient
      classmate={classmate}
      avatarUrl={avatarUrl}
      recordings={recordings}
    />
  );
}
