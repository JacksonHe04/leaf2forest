import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getLeafViewer } from "@/lib/auth/viewer";
import { listRecordings } from "@/lib/db/recordings";
import { getPublicUrl, BUCKET_IMAGES } from "@/lib/storage";
import { MineClient } from "./MineClient";
import { PageHeader } from "@/components/site/PageHeader";
import { LeafMotif } from "@/components/site/LeafMotif";
import { Button } from "@/components/ui/button";

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
  const viewer = await getLeafViewer();
  if (!viewer) redirect("/login?redirect=/mine");

  const classmate = viewer.classmate;
  if (!classmate) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <PageHeader
          eyebrow="Leaf member · 普通成员"
          title="欢迎来到这片森林"
          subtitle="你的 iNon 账号已经可以访问 Leaf，但尚未关联到同学档案。"
          breadcrumb={[{ label: "首页", href: "/" }, { label: "我的叶子" }]}
        />
        <div className="surface-paper mt-8 rounded-md p-6 font-serif sm:p-8">
          <p className="leading-8 text-ink-soft">
            如果你是 2019 级 2 班同学，请联系 Leaf 管理员，将你的 iNon
            邮箱分配到对应档案。分配后再次打开本页即可自动确认身份。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="font-serif bg-forest hover:bg-forest-deep">
              <a href="https://inon.space/sso/account">查看 iNon 账号</a>
            </Button>
            <Button asChild variant="outline" className="font-serif">
              <Link href="/api/auth/inon/logout?returnTo=%2F">退出 Leaf</Link>
            </Button>
          </div>
        </div>
        <LeafMotif variant="sprig" className="mx-auto mt-10 h-7 w-20 text-forest/40" />
      </main>
    );
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
