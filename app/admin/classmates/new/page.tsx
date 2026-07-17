import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewClassmateForm from "./ClassmateForm";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";

export default function NewClassmatePage() {
  return (
    <main className="mx-auto max-w-3xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="Admin · Classmates · New"
        title="新增同学"
        subtitle="为森林添一片新叶子。带 * 的字段必填。"
        breadcrumb={[
          { label: "首页", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "新增同学" },
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
      <NewClassmateForm />
    </main>
  );
}
