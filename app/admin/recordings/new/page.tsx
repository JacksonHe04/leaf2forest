import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listClassmates } from "@/lib/db/classmates";
import NewRecordingForm from "./RecordingForm";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewRecordingPage() {
  const classmates = await listClassmates();
  return (
    <main className="mx-auto max-w-3xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="Admin · Recordings · New"
        title="新增录音"
        subtitle="为声音档案添加一段新条目。带 * 的字段必填。"
        breadcrumb={[
          { label: "首页", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "新增录音" },
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
      <NewRecordingForm
        classmates={classmates.map((c) => ({ id: c.id, name: c.name }))}
      />
    </main>
  );
}
