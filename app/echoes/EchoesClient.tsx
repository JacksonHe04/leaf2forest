"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { Recording, Person } from "@/lib/db/types";
import RecordingCard from "@/components/features/RecordingCard";
import { PageTransition } from "@/components/site/PageTransition";
import { LeafMotif } from "@/components/site/LeafMotif";
import { EchoesFilterBar } from "./EchoesFilterBar";

type PeopleMap = Record<string, Person>;

interface Props {
  recordings: Recording[];
  peopleMap: PeopleMap;
  sizeByName: Record<string, number>;
  totalCount: number;
}

/**
 * EchoesClient — client-side search + month-grouped rendering.
 *
 * Recordings are filtered in real-time by a text query, then grouped
 * by month (ascending) so the earliest recordings appear first.
 */
export function EchoesClient({
  recordings,
  peopleMap,
  sizeByName,
  totalCount,
}: Props) {
  const [query, setQuery] = useState("");

  // Real-time client-side text filter
  const filtered = useMemo(() => {
    if (!query.trim()) return recordings;
    const q = query.trim().toLowerCase();
    return recordings.filter((r) =>
      [r.title, r.description, r.background, r.location]
        .filter(Boolean)
        .some((t) => t!.toLowerCase().includes(q))
    );
  }, [recordings, query]);

  // Only keep recordings with playable audio
  const playable = useMemo(
    () => filtered.filter((r) => (sizeByName[r.audio_path] ?? 0) > 0),
    [filtered, sizeByName]
  );

  const emptyCount = filtered.length - playable.length;

  // Group by month (YYYY-MM), ascending
  const months = useMemo(() => {
    const byMonth = new Map<string, Recording[]>();
    for (const r of playable) {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!byMonth.has(key)) byMonth.set(key, []);
      byMonth.get(key)!.push(r);
    }
    return [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [playable]);

  function formatMonth(key: string): string {
    const [year, month] = key.split("-");
    return `${year}年${Number(month)}月`;
  }

  return (
    <>
      {/* Filter bar */}
      <EchoesFilterBar query={query} onQueryChange={setQuery} />

      {/* Empty state */}
      {filtered.length === 0 ? (
        <PageTransition>
          <div className="surface-paper rounded-md px-8 py-16 text-center">
            <LeafMotif variant="sprig" className="mx-auto h-10 w-28 text-forest/50" />
            <h3 className="mt-6 display-heading text-2xl text-ink">
              未找到匹配的录音
            </h3>
            <p className="mx-auto mt-3 max-w-md font-serif text-ink-soft leading-7">
              调整搜索关键词，或清空搜索框看看完整的声音档案。
            </p>
          </div>
        </PageTransition>
      ) : (
        <PageTransition delay={0.05}>
          <div className="mt-10 space-y-16">
            {months.map(([key, recs]) => (
              <section key={key}>
                <div className="flex items-baseline gap-4 mb-6">
                  <h2 className="display-heading text-4xl text-forest/80">
                    {formatMonth(key)}
                  </h2>
                  <span className="font-serif text-sm text-ink-faint">
                    {recs.length} 段录音
                  </span>
                  <span className="flex-1 h-px bg-gradient-to-r from-gold/60 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {recs.map((rec, i) => (
                    <RecordingCard
                      key={rec.id}
                      recording={rec}
                      people={(rec.people ?? [])
                        .map((id) => peopleMap[id])
                        .filter(Boolean)}
                      sizeBytes={sizeByName[rec.audio_path] ?? 0}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            ))}

            {/* Missing source files */}
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
    </>
  );
}
