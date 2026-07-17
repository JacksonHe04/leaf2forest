import Link from "next/link";
import {
  Mic,
  Users,
  HardDrive,
  Image as ImageIcon,
  ArrowRight,
  Clock,
} from "lucide-react";
import { listRecordings } from "@/lib/db/recordings";
import { listClassmates } from "@/lib/db/classmates";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { BUCKET_IMAGES, BUCKET_RECORDINGS } from "@/lib/storage";
import { PageHeader } from "@/components/site/PageHeader";
import { PageTransition } from "@/components/site/PageTransition";
import { LeafMotif } from "@/components/site/LeafMotif";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [recentRecordings, classmates, supabase] = await Promise.all([
    listRecordings({ limit: 6 }),
    listClassmates(),
    Promise.resolve(getSupabaseAdmin()),
  ]);

  const [recordingsCount, audioList, imageList] = await Promise.all([
    supabase.from("recordings").select("*", { count: "exact", head: true }),
    supabase.storage.from(BUCKET_RECORDINGS).list(undefined, { limit: 1000 }),
    supabase.storage.from(BUCKET_IMAGES).list(undefined, { limit: 1000 }),
  ]);

  const stats = {
    recordings: recordingsCount.count ?? 0,
    classmates: classmates.length,
    audioFiles: Array.isArray(audioList.data) ? audioList.data.length : 0,
    images: Array.isArray(imageList.data) ? imageList.data.length : 0,
  };

  return (
    <main className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="Admin · 管理后台"
        title="数据后台"
        subtitle="所有数据都在 Supabase（Postgres + Storage）中。这里是一个安静的入口，用于维护同学档案与声音档案。"
        breadcrumb={[{ label: "首页", href: "/" }, { label: "Admin" }]}
      />

      <PageTransition>
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="录音（DB 行）"
            value={stats.recordings}
            icon={<Mic className="h-4 w-4" />}
            href="/admin/recordings"
          />
          <StatCard
            label="同学（DB 行）"
            value={stats.classmates}
            icon={<Users className="h-4 w-4" />}
            href="/admin/classmates"
          />
          <StatCard
            label="音频对象"
            value={stats.audioFiles}
            icon={<HardDrive className="h-4 w-4" />}
            sublabel="recordings 桶"
          />
          <StatCard
            label="图片对象"
            value={stats.images}
            icon={<ImageIcon className="h-4 w-4" />}
            sublabel="images 桶"
          />
        </div>

        {/* Two main panels */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AdminPanel
            eyebrow="01 / Recordings"
            title="录音管理"
            description="在 recordings 表与 recordings 存储桶中。可以新增、查看、编辑每一档声音档案。"
            links={[
              { href: "/admin/recordings", label: "查看全部" },
              { href: "/admin/recordings/new", label: "新增录音" },
            ]}
          />
          <AdminPanel
            eyebrow="02 / Classmates"
            title="同学管理"
            description="在 classmates 表与 images 存储桶中（头像）。可以新增、查看、编辑每一位同学。"
            links={[
              { href: "/admin/classmates", label: "查看全部" },
              { href: "/admin/classmates/new", label: "新增同学" },
            ]}
          />
        </div>

        {/* Recent recordings */}
        <section className="mt-10 surface-paper rounded-md p-6 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-forest" />
              <h2 className="display-heading text-xl text-ink">最近的录音</h2>
            </div>
            <Link
              href="/admin/recordings"
              className="group inline-flex items-center gap-1 font-serif text-sm text-forest hover:text-forest-deep transition-colors"
            >
              查看全部
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {recentRecordings.length === 0 ? (
            <div className="py-10 text-center">
              <LeafMotif variant="sprig" className="mx-auto h-7 w-20 text-forest/40" />
              <p className="mt-4 font-serif text-sm text-ink-faint">
                还没有录音。
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/70">
              {recentRecordings.map((r) => (
                <li
                  key={r.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <Link
                    href={`/echoes/${r.id}`}
                    className="font-serif text-ink hover:text-forest transition-colors truncate"
                  >
                    {r.title}
                  </Link>
                  <span className="font-serif text-xs text-ink-faint whitespace-nowrap tabular-nums">
                    {r.date}
                    {r.time ? ` ${r.time}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </PageTransition>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
  sublabel,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  href?: string;
  sublabel?: string;
}) {
  const inner = (
    <div className="surface-paper rounded-md p-5 lift-paper h-full">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <span className="text-forest">{icon}</span>
      </div>
      <div className="mt-3 display-heading text-4xl text-forest tabular-nums">
        {value}
      </div>
      {sublabel && (
        <p className="mt-1 font-serif text-xs text-ink-faint">{sublabel}</p>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function AdminPanel({
  eyebrow,
  title,
  description,
  links,
}: {
  eyebrow: string;
  title: string;
  description: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="surface-paper rounded-md p-6 sm:p-7">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-2 display-heading text-2xl text-ink">{title}</h2>
      <p className="mt-2 font-serif text-sm text-ink-soft leading-7">
        {description}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {links.map((l, i) => (
          <Link
            key={l.href}
            href={l.href}
            className={
              i === 0
                ? "inline-flex items-center gap-1 rounded-md bg-forest px-3.5 py-2 font-serif text-sm text-paper-soft hover:bg-forest-deep transition-colors"
                : "inline-flex items-center gap-1 rounded-md border border-forest/40 bg-paper-soft px-3.5 py-2 font-serif text-sm text-forest hover:bg-paper-deep transition-colors"
            }
          >
            {l.label}
            <ArrowRight className="h-3 w-3" />
          </Link>
        ))}
      </div>
    </div>
  );
}
