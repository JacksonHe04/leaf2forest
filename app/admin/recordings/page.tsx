import Link from "next/link";
import { Plus, ArrowLeft, Mic, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listRecordings } from "@/lib/db/recordings";
import { listClassmatesByIds } from "@/lib/db/classmates";
import { BUCKET_RECORDINGS, getPublicUrl } from "@/lib/storage";
import type { Classmate } from "@/lib/db/types";
import { PageHeader } from "@/components/site/PageHeader";
import { PageTransition } from "@/components/site/PageTransition";
import { LeafMotif } from "@/components/site/LeafMotif";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function resolveClassmates(groups: string[][]) {
  const ids = new Set<string>();
  for (const g of groups) g.forEach((id) => ids.add(id));
  const list = await listClassmatesByIds([...ids]);
  return Object.fromEntries(list.map((c: Classmate) => [c.id, c]));
}

export default async function AdminRecordingsPage() {
  const recordings = await listRecordings();
  const classmateMap = await resolveClassmates(
    recordings.map((r) => r.classmates ?? [])
  );

  return (
    <main className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="Admin · Recordings"
        title="录音管理"
        subtitle={`共 ${recordings.length} 条录音 · 存储于 Supabase（DB + Storage）。`}
        breadcrumb={[
          { label: "首页", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Recordings" },
        ]}
        actions={
          <>
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
            <Button asChild className="font-serif bg-forest hover:bg-forest-deep">
              <Link href="/admin/recordings/new">
                <Plus className="h-3.5 w-3.5" />
                新增录音
              </Link>
            </Button>
          </>
        }
      />

      <PageTransition>
        {recordings.length === 0 ? (
          <div className="surface-paper rounded-md px-8 py-16 text-center">
            <LeafMotif variant="sprig" className="mx-auto h-10 w-28 text-forest/50" />
            <h3 className="mt-6 display-heading text-2xl text-ink">还没有录音</h3>
            <p className="mt-3 font-serif text-ink-soft">
              开始添加第一段录音，把那段岁月的声音保存下来。
            </p>
            <Button
              asChild
              className="mt-6 font-serif bg-forest hover:bg-forest-deep"
            >
              <Link href="/admin/recordings/new">
                <Plus className="h-3.5 w-3.5" />
                添加录音
              </Link>
            </Button>
          </div>
        ) : (
          <div className="surface-paper rounded-md overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border/70 bg-paper-deep/40 px-5 py-3">
              <Mic className="h-4 w-4 text-forest" />
              <span className="font-serif text-sm text-ink-soft">
                共 {recordings.length} 段
              </span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/70 hover:bg-transparent">
                    <TableHead className="font-serif text-xs uppercase tracking-wider text-ink-faint">
                      日期 / 时间
                    </TableHead>
                    <TableHead className="font-serif text-xs uppercase tracking-wider text-ink-faint">
                      标题
                    </TableHead>
                    <TableHead className="font-serif text-xs uppercase tracking-wider text-ink-faint">
                      同学
                    </TableHead>
                    <TableHead className="font-serif text-xs uppercase tracking-wider text-ink-faint">
                      音频对象
                    </TableHead>
                    <TableHead className="font-serif text-xs uppercase tracking-wider text-ink-faint text-right">
                      操作
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordings.map((r) => {
                    const classmates = (r.classmates ?? [])
                      .map((id) => classmateMap[id])
                      .filter(Boolean);
                    return (
                      <TableRow
                        key={r.id}
                        className="border-border/60 hover:bg-paper-deep/40 transition-colors"
                      >
                        <TableCell className="font-serif text-xs text-ink-soft whitespace-nowrap tabular-nums">
                          {r.date}
                          {r.time ? ` ${r.time}` : ""}
                        </TableCell>
                        <TableCell className="font-serif text-ink">
                          {r.title}
                        </TableCell>
                        <TableCell className="font-serif text-sm text-ink-soft">
                          {classmates.length > 0
                            ? classmates.map((c) => c.name).join("、")
                            : "—"}
                        </TableCell>
                        <TableCell className="font-serif text-xs text-ink-faint">
                          <a
                            href={getPublicUrl(BUCKET_RECORDINGS, r.audio_path)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 hover:text-forest transition-colors break-all"
                          >
                            <span className="max-w-[180px] truncate">
                              {r.audio_path}
                            </span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Link
                            href={`/echoes/${r.id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-forest/40 bg-paper-soft px-2.5 py-1 font-serif text-xs text-forest hover:bg-paper-deep transition-colors mr-1.5"
                          >
                            查看
                          </Link>
                          <Link
                            href={`/admin/recordings/${r.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-md bg-forest px-2.5 py-1 font-serif text-xs text-paper-soft hover:bg-forest-deep transition-colors"
                          >
                            编辑
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </PageTransition>
    </main>
  );
}
