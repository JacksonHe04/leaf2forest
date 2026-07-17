import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getRecording, getRecordingByNum } from "@/lib/db/recordings";
import { listClassmates } from "@/lib/db/classmates";
import { getPublicUrl, BUCKET_RECORDINGS } from "@/lib/storage";
import RecordingForm from "../../new/RecordingForm";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditRecordingPage({ params }: Props) {
  const { id } = await params;
  const r = (await getRecordingByNum(Number(id))) ?? (await getRecording(id));
  if (!r) notFound();

  const classmates = await listClassmates();

  return (
    <main className="mx-auto max-w-3xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="Admin · Recordings · Edit"
        title={`编辑：${r.title}`}
        subtitle={`日期 ${r.date}${r.time ? ` ${r.time}` : ""} · 修改后点击保存即生效。`}
        breadcrumb={[
          { label: "首页", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Recordings", href: "/admin/recordings" },
          { label: r.title },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              asChild
              className="font-serif border-forest/40 text-forest hover:bg-paper-deep"
            >
              <Link href="/admin/recordings">
                <ArrowLeft className="h-3.5 w-3.5" />
                返回列表
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="font-serif border-gold/40 text-gold hover:bg-paper-deep"
            >
              <Link href={`/echoes/${r.num}`} target="_blank">
                <ExternalLink className="h-3.5 w-3.5" />
                在前台查看
              </Link>
            </Button>
          </>
        }
      />

      <RecordingForm
        classmates={classmates.map((c) => ({ id: c.id, name: c.name }))}
        initial={r}
      />

      {/* Object reference footer */}
      <div className="mt-8 surface-paper rounded-md p-5">
        <div className="eyebrow mb-2">音频对象</div>
        <code className="font-serif text-xs text-ink-soft break-all block">
          {r.audio_path}
        </code>
        <a
          href={getPublicUrl(BUCKET_RECORDINGS, r.audio_path)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 font-serif text-xs text-forest hover:text-forest-deep transition-colors link-archive"
        >
          <ExternalLink className="h-3 w-3" />
          直接打开源文件
        </a>
      </div>
    </main>
  );
}
