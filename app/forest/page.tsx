import { Users, Leaf } from "lucide-react";
import { listClassmates } from "@/lib/db/classmates";
import { getPublicUrl, BUCKET_IMAGES } from "@/lib/storage";
import { ClassmateCard } from "@/components/features/ClassmateCard";
import { PageHeader } from "@/components/site/PageHeader";
import { PageTransition } from "@/components/site/PageTransition";
import { LeafMotif } from "@/components/site/LeafMotif";

export const dynamic = "force-dynamic";

export default async function ForestPage() {
  const classmates = await listClassmates();

  // Build avatar URLs once on the server.
  const avatarUrls = new Map(
    classmates.map((c) => [
      c.id,
      c.avatar_path ? getPublicUrl(BUCKET_IMAGES, c.avatar_path) : null,
    ])
  );

  return (
    <main className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="Forest · 一片森林"
        title={
          <>
            同学档案 <span className="text-forest">·</span> Classmates
          </>
        }
        subtitle="六十多位同学，每一片叶子都在独立生长，共同构成这片森林。点击任意一张卡片，可以读到这位同学现在在哪里、正在做什么、从哪里出发。"
        breadcrumb={[{ label: "首页", href: "/" }, { label: "Forest" }]}
        actions={
          <div className="flex items-center gap-2 rounded-md border border-border bg-paper-soft px-3 py-1.5 font-serif text-sm text-ink-soft">
            <Users className="h-4 w-4 text-forest" />
            共 <span className="text-forest font-medium">{classmates.length}</span> 位
          </div>
        }
      />

      {classmates.length === 0 ? (
        <PageTransition>
          <EmptyState />
        </PageTransition>
      ) : (
        <PageTransition delay={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {classmates.map((c, i) => (
              <ClassmateCard
                key={c.id}
                classmate={c}
                avatarUrl={avatarUrls.get(c.id) ?? null}
                index={i}
              />
            ))}
          </div>
        </PageTransition>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="surface-paper rounded-md px-8 py-16 text-center">
      <LeafMotif variant="sprig" className="mx-auto h-10 w-28 text-forest/50" />
      <h3 className="mt-6 display-heading text-2xl text-ink">
        森林尚未长出
      </h3>
      <p className="mx-auto mt-3 max-w-md font-serif text-ink-soft leading-7">
        还没有同学档案。这片森林等待每一位同学通过「我的叶子」补全自己的资料，
        让二十年后回来的人，还能找到你。
      </p>
      <div className="mt-6 inline-flex items-center gap-2 font-serif text-sm text-ink-faint">
        <Leaf className="h-4 w-4 text-gold" />
        资料维护入口将在登录后开放
      </div>
    </div>
  );
}
