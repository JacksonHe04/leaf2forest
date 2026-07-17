import { Mic } from "lucide-react";
import { listRecordings } from "@/lib/db/recordings";
import { listClassmatesByIds } from "@/lib/db/classmates";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { BUCKET_RECORDINGS } from "@/lib/storage";
import type { Classmate } from "@/lib/db/types";
import { PageHeader } from "@/components/site/PageHeader";
import { PageTransition } from "@/components/site/PageTransition";
import { EchoesClient } from "./EchoesClient";

export const dynamic = "force-dynamic";

type ClassmateMap = Record<string, Classmate>;

async function resolveClassmates(groups: string[][]): Promise<ClassmateMap> {
  const allIds = new Set<string>();
  for (const ids of groups) ids.forEach((id) => allIds.add(id));
  const list = await listClassmatesByIds([...allIds]);
  return Object.fromEntries(list.map((c) => [c.id, c]));
}

export default async function EchoesPage() {
  const recordings = await listRecordings();

  const classmateMap = await resolveClassmates(
    recordings.map((r) => r.classmates ?? [])
  );

  // Object sizes from storage so cards can flag missing sources.
  const supabase = getSupabaseAdmin();
  const { data: objects } = await supabase.storage
    .from(BUCKET_RECORDINGS)
    .list(undefined, { limit: 1000 });
  const sizeByName: Record<string, number> = {};
  for (const o of objects ?? []) {
    sizeByName[o.name] = (o.metadata?.size as number | undefined) ?? 0;
  }

  return (
    <main className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="Echoes · 声音档案"
        title={
          <>
            高中岁月留下的声音 <span className="text-forest">·</span> Recordings
          </>
        }
        subtitle="保存高中时期录制的两百多条音频。这些音频不是普通媒体文件，而是一个时代留下来的声音样本 —— 让未来打开网站的人，可以重新回到那个时间节点。"
        breadcrumb={[{ label: "首页", href: "/" }, { label: "Echoes" }]}
        actions={
          <div className="flex items-center gap-2 rounded-md border border-border bg-paper-soft px-3 py-1.5 font-serif text-sm text-ink-soft">
            <Mic className="h-4 w-4 text-forest" />
            共 <span className="text-forest font-medium">{recordings.length}</span> 段
          </div>
        }
      />

      <EchoesClient
        recordings={recordings}
        classmateMap={classmateMap}
        sizeByName={sizeByName}
        totalCount={recordings.length}
      />
    </main>
  );
}
