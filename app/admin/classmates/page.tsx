import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { listClassmates } from "@/lib/db/classmates";
import { PageHeader } from "@/components/site/PageHeader";
import { PageTransition } from "@/components/site/PageTransition";
import { LeafMotif } from "@/components/site/LeafMotif";
import { Button } from "@/components/ui/button";
import { ClassmatesTable } from "./ClassmatesTable";

export const dynamic = "force-dynamic";

export default async function AdminClassmatesPage() {
  const classmates = await listClassmates();

  return (
    <main className="mx-auto max-w-[95rem] px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="Admin · Classmates"
        title="同学管理"
        subtitle={`共 ${classmates.length} 位同学。点击表格中的单元格即可直接编辑，失焦后自动保存。`}
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
          <ClassmatesTable initialClassmates={classmates} />
        )}
      </PageTransition>
    </main>
  );
}
