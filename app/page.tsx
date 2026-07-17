import Link from "next/link";
import { ArrowRight, Leaf, Mic, BookOpen } from "lucide-react";
import { listRecordings } from "@/lib/db/recordings";
import { listClassmatesByIds } from "@/lib/db/classmates";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { BUCKET_RECORDINGS } from "@/lib/storage";
import type { Classmate } from "@/lib/db/types";
import RecordingCard from "@/components/features/RecordingCard";
import { PageTransition } from "@/components/site/PageTransition";
import { LeafMotif } from "@/components/site/LeafMotif";
import { SectionTitle } from "@/components/site/SectionTitle";
import { SITE } from "@/lib/site";

export const revalidate = 60;

type ClassmateMap = Record<string, Classmate>;

async function resolveClassmates(groups: string[][]): Promise<ClassmateMap> {
  const allIds = new Set<string>();
  for (const ids of groups) ids.forEach((id) => allIds.add(id));
  const list = await listClassmatesByIds([...allIds]);
  return Object.fromEntries(list.map((c) => [c.id, c]));
}

export default async function HomePage() {
  const recordings = await listRecordings({ limit: 24 });
  const classmateMap = await resolveClassmates(
    recordings.map((r) => r.classmates ?? [])
  );

  // Resolve audio object sizes so cards can flag 0-byte sources.
  const supabase = getSupabaseAdmin();
  const { data: objects } = await supabase.storage
    .from(BUCKET_RECORDINGS)
    .list(undefined, { limit: 1000 });
  const sizeByName: Record<string, number> = {};
  for (const o of objects ?? []) {
    sizeByName[o.name] = (o.metadata?.size as number | undefined) ?? 0;
  }

  const playable = recordings
    .filter((r) => (sizeByName[r.audio_path] ?? 0) > 0)
    .slice(0, 6);

  return (
    <main className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16">
      {/* ============ Hero ============ */}
      <PageTransition>
        <section className="relative overflow-hidden">
          {/* Decorative leaf watermark */}
          <LeafMotif
            variant="frame"
            className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 h-10 w-72 text-gold/30"
          />

          <div className="relative flex flex-col items-center text-center pt-8 pb-12">
            <span className="eyebrow mb-6">{SITE.tagline}</span>

            <h1 className="display-heading text-6xl sm:text-7xl md:text-8xl text-ink leading-[1.05]">
              Leaf<span className="text-forest">2</span>Forest
            </h1>

            <p className="mt-6 max-w-2xl font-serif text-lg sm:text-xl leading-9 text-ink-soft">
              一片叶子，是一个人。
              <br className="hidden sm:block" />
              六十多片叶子，共同构成一片森林。
              <br />
              这里是青阳中学 2019 级 2 班的数字档案馆 ——
              长期保存，慢慢生长。
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/forest"
                className="group inline-flex items-center gap-2 rounded-md bg-forest px-5 py-2.5 font-serif text-sm text-paper-soft transition-all hover:bg-forest-deep hover:shadow-[0_4px_16px_rgba(83,101,74,0.18)]"
              >
                <Leaf className="h-4 w-4" />
                走进 Forest
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/echoes"
                className="group inline-flex items-center gap-2 rounded-md border border-forest/40 bg-paper-soft px-5 py-2.5 font-serif text-sm text-forest transition-all hover:bg-paper-deep hover:border-forest/60"
              >
                <Mic className="h-4 w-4" />
                翻开 Echoes
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Bottom gold rule */}
          <div className="mt-4 flex items-center justify-center text-gold">
            <span className="h-px w-24 bg-gradient-to-r from-transparent to-gold" />
            <LeafMotif variant="mark" className="mx-3 h-4 w-4" />
            <span className="h-px w-24 bg-gradient-to-l from-transparent to-gold" />
          </div>
        </section>
      </PageTransition>

      {/* ============ Two pillars: Forest & Echoes ============ */}
      <PageTransition delay={0.1}>
        <section className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
          <PillarCard
            eyebrow="01 / Forest"
            title="同学档案"
            description="记录每一位同学现在在哪里、正在做什么、从哪里出发。用于未来多年后重新连接彼此。"
            href="/forest"
            cta="翻开同学档案"
            icon={<Leaf className="h-5 w-5" />}
          />
          <PillarCard
            eyebrow="02 / Echoes"
            title="声音档案"
            description="保存高中时期录制的两百多条音频。每一条都是一个时代留下来的声音样本。"
            href="/echoes"
            cta="聆听那段岁月"
            icon={<Mic className="h-5 w-5" />}
          />
        </section>
      </PageTransition>

      {/* ============ Recent echoes ============ */}
      {playable.length > 0 && (
        <PageTransition delay={0.15}>
          <section className="mt-24">
            <SectionTitle
              eyebrow="近期回声"
              title="来自 Echoes 的几段声音"
              description="随意翻几页，听听 2019 到 2022 年间留下的声音样本。"
            />

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {playable.map((rec, i) => (
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

            <div className="mt-10 flex justify-center">
              <Link
                href="/echoes"
                className="group inline-flex items-center gap-2 font-serif text-sm text-forest hover:text-forest-deep transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                翻阅全部声音档案
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </section>
        </PageTransition>
      )}

      {/* ============ Closing colophon ============ */}
      <PageTransition delay={0.2}>
        <section className="mt-28 border-t border-border/70 pt-12">
          <div className="mx-auto max-w-3xl text-center">
            <LeafMotif variant="sprig" className="mx-auto h-7 w-20 text-forest/70" />
            <p className="mt-6 display-heading text-2xl sm:text-3xl text-ink italic">
              “一本二十年后依然愿意打开的数字纪念册。”
            </p>
            <p className="mt-4 font-serif text-sm text-ink-faint">
              Leaf2Forest 不追求成为一个社交社区，
              而是希望成为一个长期存在的数字纪念空间。
            </p>
          </div>
        </section>
      </PageTransition>
    </main>
  );
}

function PillarCard({
  eyebrow,
  title,
  description,
  href,
  cta,
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative block surface-paper rounded-md lift-paper overflow-hidden"
    >
      <div className="p-7 sm:p-9">
        <div className="flex items-start justify-between">
          <span className="eyebrow">{eyebrow}</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-deep text-forest transition-colors group-hover:bg-forest group-hover:text-paper-soft">
            {icon}
          </span>
        </div>

        <h3 className="mt-6 display-heading text-3xl text-ink group-hover:text-forest transition-colors">
          {title}
        </h3>
        <p className="mt-3 font-serif text-ink-soft leading-7">{description}</p>

        <div className="mt-6 inline-flex items-center gap-2 font-serif text-sm text-forest">
          {cta}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      {/* Bottom corner mark */}
      <div className="absolute right-5 top-5 text-gold/30">
        <LeafMotif variant="mark" className="h-6 w-6" />
      </div>
    </Link>
  );
}
