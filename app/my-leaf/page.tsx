import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LogOut,
  Key,
  Leaf,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { PageTransition } from "@/components/site/PageTransition";
import { LeafMotif } from "@/components/site/LeafMotif";
import { getCurrentClassmate } from "@/lib/db/supabase-server";

/**
 * My Leaf — the classmate's personal dashboard.
 *
 * If not authenticated → redirect to /login.
 * If authenticated → show profile summary and action links.
 */
export default async function MyLeafPage() {
  const classmate = await getCurrentClassmate();

  if (!classmate) {
    redirect("/login?redirect=/my-leaf");
  }

  return (
    <main className="mx-auto max-w-3xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="My Leaf · 我的叶子"
        title={`${classmate.name}，你好`}
        subtitle="这是你在 Leaf2Forest 的个人页面。你可以在这里管理自己的信息。"
        breadcrumb={[{ label: "首页", href: "/" }, { label: "我的叶子" }]}
      />

      <PageTransition>
        {/* Profile card */}
        <div className="surface-paper rounded-md p-8 sm:p-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-forest">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h2 className="display-heading text-2xl text-ink">
                {classmate.name}
              </h2>
              <p className="font-serif text-sm text-ink-faint">
                @{classmate.user_id}
              </p>
            </div>
          </div>

          {/* Profile summary */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classmate.city && (
              <InfoItem label="所在城市" value={classmate.city} />
            )}
            {classmate.employer && (
              <InfoItem label="工作单位" value={classmate.employer} />
            )}
            {classmate.industry && (
              <InfoItem label="所属行业" value={classmate.industry} />
            )}
            {classmate.bachelor_university && (
              <InfoItem label="本科院校" value={classmate.bachelor_university} />
            )}
            {classmate.bachelor_major && (
              <InfoItem label="本科专业" value={classmate.bachelor_major} />
            )}
          </div>

          {classmate.bio && (
            <div className="mt-6">
              <p className="eyebrow mb-2">个人介绍</p>
              <p className="font-serif text-sm text-ink-soft leading-7">
                {classmate.bio}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionCard
            href={`/forest/${classmate.user_id}`}
            icon={<BookOpen className="h-5 w-5" />}
            title="查看我的档案"
            description="在 Forest 中查看你的公开档案页"
          />
          <ActionCard
            href="/change-password"
            icon={<Key className="h-5 w-5" />}
            title="修改密码"
            description="修改你的登录密码"
          />
        </div>

        {/* Logout */}
        <div className="mt-8 flex justify-center">
          <LogoutButton />
        </div>

        {/* Closing mark */}
        <div className="mt-10 flex justify-center">
          <LeafMotif variant="sprig" className="h-7 w-20 text-forest/40" />
        </div>
        <p className="mt-4 text-center font-serif text-xs italic text-ink-faint">
          每一位同学都是独立成长的一片叶子。
        </p>
      </PageTransition>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow mb-0.5">{label}</p>
      <p className="font-serif text-sm text-ink-soft">{value}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group surface-paper rounded-md p-5 transition-all hover:shadow-paper"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-deep text-forest shrink-0">
          {icon}
        </span>
        <div className="flex-1">
          <h3 className="font-serif text-sm font-medium text-ink">
            {title}
          </h3>
          <p className="mt-1 font-serif text-xs text-ink-faint">
            {description}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="group inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 font-serif text-sm text-ink-soft hover:text-red-600 hover:border-red-300 transition-colors"
      >
        <LogOut className="h-3.5 w-3.5" />
        退出登录
      </button>
    </form>
  );
}
