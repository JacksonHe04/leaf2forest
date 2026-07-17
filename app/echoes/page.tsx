import { Mic, Search } from "lucide-react";
import { listRecordings, ListRecordingsOptions } from "@/lib/db/recordings";
import { listClassmatesByIds } from "@/lib/db/classmates";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { BUCKET_RECORDINGS } from "@/lib/storage";
import type { Classmate } from "@/lib/db/types";
import RecordingCard from "@/components/features/RecordingCard";
import { PageHeader } from "@/components/site/PageHeader";
import { PageTransition } from "@/components/site/PageTransition";
import { LeafMotif } from "@/components/site/LeafMotif";
import { EchoesFilterBar } from "./EchoesFilterBar";

export const dynamic = "force-dynamic";

type ClassmateMap = Record<string, Classmate>;

async function resolveClassmates(groups: string[][]): Promise<ClassmateMap> {
  const allIds = new Set<string>();
  for (const ids of groups) ids.forEach((id) => allIds.add(id));
  const list = await listClassmatesByIds([...allIds]);
  return Object.fromEntries(list.map((c) => [c.id, c]));
}

interface SearchParams {
  q?: string;
  from?: string;
  to?: string;
  classmate?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function EchoesPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const listOpts: ListRecordingsOptions = {};
  if (sp.from) listOpts.from = sp.from;
  if (sp.to) listOpts.to = sp.to;
  if (sp.classmate) listOpts.classmateId = sp.classmate;

  const recordings = await listRecordings(listOpts);

  // Optional text filter (server-side substring match on title/description).
  let filtered = recordings;
  if (sp.q && sp.q.trim()) {
    const q = sp.q.trim().toLowerCase();
    filtered = recordings.filter((r) =>
      [r.title, r.description, r.background, r.location]
        .filter(Boolean)
        .some((t) => t!.toLowerCase().includes(q))
    );
  }

  const classmateMap = await resolveClassmates(
    filtered.map((r) => r.classmates ?? [])
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

  const playable = filtered.filter((r) => (sizeByName[r.audio_path] ?? 0) > 0);
  const emptyCount = filtered.length - playable.length;

  // Group recordings by year for an archive-style timeline feel.
  const byYear = new Map<number, typeof filtered>();
  for (const r of playable) {
    const year = new Date(r.date).getFullYear();
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(r);
  }
  const yearsDesc = [...byYear.keys()].sort((a, b) => b - a);

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

      {/* Filter bar */}
      <EchoesFilterBar total={filtered.length} playableCount={playable.length} />

      {/* Empty state */}
      {filtered.length === 0 ? (
        <PageTransition>
          <div className="surface-paper rounded-md px-8 py-16 text-center">
            <LeafMotif variant="sprig" className="mx-auto h-10 w-28 text-forest/50" />
            <h3 className="mt-6 display-heading text-2xl text-ink">
              未找到匹配的录音
            </h3>
            <p className="mx-auto mt-3 max-w-md font-serif text-ink-soft leading-7">
              调整筛选条件，或清空搜索框看看完整的声音档案。
            </p>
          </div>
        </PageTransition>
      ) : (
        <PageTransition delay={0.05}>
          <div className="mt-10 space-y-16">
            {yearsDesc.map((year) => (
              <section key={year}>
                <div className="flex items-baseline gap-4 mb-6">
                  <h2 className="display-heading text-5xl text-forest/80">
                    {year}
                  </h2>
                  <span className="font-serif text-sm text-ink-faint">
                    {byYear.get(year)!.length} 段录音
                  </span>
                  <span className="flex-1 h-px bg-gradient-to-r from-gold/60 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {byYear.get(year)!.map((rec, i) => (
                    <RecordingCard
                      key={rec.id}
                      recording={rec}
                      classmates={(rec.classmates ?? [])
                        .map((id) => classmateMap[id])
                        .filter(Boolean)}
                      sizeBytes={sizeByName[rec.audio_path] ?? 0}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            ))}

            {/* Hidden / missing recordings */}
            {emptyCount > 0 && (
              <section className="pt-8 border-t border-border/70">
                <div className="flex items-center gap-2 font-serif text-sm text-ink-faint">
                  <Search className="h-4 w-4 text-gold" />
                  另有 <span className="text-gold">{emptyCount}</span> 段录音源文件缺失，
                  暂时无法播放。
                </div>
              </section>
            )}
          </div>
        </PageTransition>
      )}
    </main>
  );
}
