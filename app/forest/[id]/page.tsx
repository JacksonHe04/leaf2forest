import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getClassmateByIdOrUserId } from "@/lib/db/classmates";
import { listRecordings } from "@/lib/db/recordings";
import { getPublicUrl, BUCKET_IMAGES } from "@/lib/storage";
import { getCurrentUser, getCurrentClassmate } from "@/lib/db/supabase-server";
import { PageHeader } from "@/components/site/PageHeader";
import { PageTransition } from "@/components/site/PageTransition";
import { ClassmateProfileClient } from "@/components/features/ClassmateProfileClient";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = await getClassmateByIdOrUserId(id);
  if (!c) return { title: "未找到同学" };
  return {
    title: `${c.name} · 同学档案`,
    description: c.bio ?? `${c.name} 的同学档案`,
  };
}

export default async function ClassmateProfilePage({ params }: Props) {
  const { id } = await params;
  const c = await getClassmateByIdOrUserId(id);
  if (!c) notFound();

  const avatarUrl = c.avatar_path
    ? getPublicUrl(BUCKET_IMAGES, c.avatar_path)
    : null;

  // Recordings this classmate appears in.
  const recordings = await listRecordings({ peopleId: c.id });

  // Auth: determine if viewer can edit
  const user = await getCurrentUser();
  const isAdmin = user?.user_metadata?.is_admin === true;
  const currentClassmate = user ? await getCurrentClassmate() : null;
  const isSelf = currentClassmate?.id === c.id;
  const canEdit = isAdmin || isSelf;

  const genderLabel =
    c.gender === "male"
      ? "男"
      : c.gender === "female"
      ? "女"
      : c.gender === "other"
      ? "其他"
      : null;

  return (
    <main className="mx-auto max-w-5xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="Leaf · 一片叶子"
        title={
          <span className="flex items-baseline gap-3 flex-wrap">
            {c.name}
            {genderLabel && (
              <span className="font-serif text-base text-ink-faint">
                · {genderLabel}
              </span>
            )}
          </span>
        }
        subtitle={c.bio ?? (canEdit ? "点击个人介绍即可编辑" : "尚未填写个人介绍。")}
        breadcrumb={[
          { label: "首页", href: "/" },
          { label: "Forest", href: "/forest" },
          { label: c.name },
        ]}
      />

      <PageTransition>
        <ClassmateProfileClient
          classmate={c}
          avatarUrl={avatarUrl}
          recordings={recordings}
          canEdit={canEdit}
          isSelf={isSelf}
          isAdmin={isAdmin}
        />
      </PageTransition>
    </main>
  );
}
