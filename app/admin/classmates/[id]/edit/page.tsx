import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getClassmateByIdOrUserId } from "@/lib/db/classmates";
import { getPublicUrl, BUCKET_IMAGES } from "@/lib/storage";
import ClassmateForm from "../../new/ClassmateForm";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditClassmatePage({ params }: Props) {
  const { id } = await params;
  const c = await getClassmateByIdOrUserId(id);
  if (!c) notFound();

  const avatarUrl = c.avatar_path
    ? getPublicUrl(BUCKET_IMAGES, c.avatar_path)
    : null;

  return (
    <main className="mx-auto max-w-3xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow={`Admin · Classmates · Edit`}
        title={`编辑：${c.name}`}
        subtitle="修改后点击保存即生效。带 * 的字段必填。"
        breadcrumb={[
          { label: "首页", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: c.name },
        ]}
        actions={
          <Button
            variant="outline"
            asChild
            className="font-serif border-forest/40 text-forest hover:bg-paper-deep"
          >
            <Link href="/admin">
              <ArrowLeft className="h-3.5 w-3.5" />
              返回
            </Link>
          </Button>
        }
      />

      {/* Current avatar preview (read-only; upload in form replaces it) */}
      {avatarUrl && (
        <div className="surface-paper rounded-md p-5 mb-6 flex items-center gap-4">
          <Avatar className="h-14 w-14 rounded-full border border-gold/30">
            <AvatarImage src={avatarUrl} alt={c.name} />
            <AvatarFallback className="bg-paper-deep font-serif text-forest">
              {c.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="eyebrow">当前头像</div>
            <p className="font-serif text-sm text-ink-soft">
              如需更换，请在表单中选择新文件。
            </p>
          </div>
        </div>
      )}

      <ClassmateForm initial={c} />
    </main>
  );
}
