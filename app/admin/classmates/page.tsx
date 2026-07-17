import Link from "next/link";
import { Plus, ArrowLeft, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { listClassmates } from "@/lib/db/classmates";
import { getPublicUrl, BUCKET_IMAGES } from "@/lib/storage";
import { PageHeader } from "@/components/site/PageHeader";
import { PageTransition } from "@/components/site/PageTransition";
import { LeafMotif } from "@/components/site/LeafMotif";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminClassmatesPage() {
  const classmates = await listClassmates();

  return (
    <main className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="Admin · Classmates"
        title="同学管理"
        subtitle={`共 ${classmates.length} 位同学。点击编辑可查看 / 修改每一位同学的档案。`}
        breadcrumb={[
          { label: "首页", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Classmates" },
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
              <Link href="/admin/classmates/new">
                <Plus className="h-3.5 w-3.5" />
                新增同学
              </Link>
            </Button>
          </>
        }
      />

      <PageTransition>
        {classmates.length === 0 ? (
          <div className="surface-paper rounded-md px-8 py-16 text-center">
            <LeafMotif variant="sprig" className="mx-auto h-10 w-28 text-forest/50" />
            <h3 className="mt-6 display-heading text-2xl text-ink">还没有同学</h3>
            <p className="mt-3 font-serif text-ink-soft">
              开始添加第一位同学，让这片森林生长起来。
            </p>
            <Button
              asChild
              className="mt-6 font-serif bg-forest hover:bg-forest-deep"
            >
              <Link href="/admin/classmates/new">
                <Plus className="h-3.5 w-3.5" />
                添加同学
              </Link>
            </Button>
          </div>
        ) : (
          <div className="surface-paper rounded-md overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border/70 bg-paper-deep/40 px-5 py-3">
              <Users className="h-4 w-4 text-forest" />
              <span className="font-serif text-sm text-ink-soft">
                共 {classmates.length} 位
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-border/70 hover:bg-transparent">
                  <TableHead className="font-serif text-xs uppercase tracking-wider text-ink-faint">
                    头像
                  </TableHead>
                  <TableHead className="font-serif text-xs uppercase tracking-wider text-ink-faint">
                    姓名
                  </TableHead>
                  <TableHead className="font-serif text-xs uppercase tracking-wider text-ink-faint">
                    性别
                  </TableHead>
                  <TableHead className="font-serif text-xs uppercase tracking-wider text-ink-faint">
                    所在城市
                  </TableHead>
                  <TableHead className="font-serif text-xs uppercase tracking-wider text-ink-faint">
                    工作单位 / 行业
                  </TableHead>
                  <TableHead className="font-serif text-xs uppercase tracking-wider text-ink-faint text-right">
                    操作
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classmates.map((c) => (
                  <TableRow
                    key={c.id}
                    className="border-border/60 hover:bg-paper-deep/40 transition-colors"
                  >
                    <TableCell>
                      <Avatar className="h-9 w-9 rounded-full border border-gold/20">
                        {c.avatar_path && (
                          <AvatarImage
                            src={getPublicUrl(BUCKET_IMAGES, c.avatar_path)}
                            alt={c.name}
                          />
                        )}
                        <AvatarFallback className="bg-paper-deep font-serif text-xs text-forest">
                          {c.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-serif text-ink">
                      {c.name}
                    </TableCell>
                    <TableCell className="font-serif text-ink-soft">
                      {c.gender === "male"
                        ? "男"
                        : c.gender === "female"
                        ? "女"
                        : c.gender === "other"
                        ? "其他"
                        : "—"}
                    </TableCell>
                    <TableCell className="font-serif text-ink-soft">
                      {c.city ?? "—"}
                    </TableCell>
                    <TableCell className="font-serif text-ink-soft">
                      {[c.employer, c.industry].filter(Boolean).join(" · ") ||
                        "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/classmates/${c.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-md border border-forest/40 bg-paper-soft px-3 py-1.5 font-serif text-xs text-forest hover:bg-forest hover:text-paper-soft transition-colors"
                      >
                        编辑
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </PageTransition>
    </main>
  );
}
