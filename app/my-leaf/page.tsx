import Link from "next/link";
import { Lock, Leaf, ArrowRight, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { PageTransition } from "@/components/site/PageTransition";
import { LeafMotif } from "@/components/site/LeafMotif";

/**
 * My Leaf — placeholder for the classmate profile editor.
 *
 * Per CLAUDE.md §4.2, login exists so a classmate can maintain
 * their own information. Auth is not yet wired up (see /login),
 * so this page explains the intent and routes visitors to the
 * appropriate places.
 */
export default async function MyLeafPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="My Leaf · 我的叶子"
        title="维护你自己的那片叶子"
        subtitle="登录之后，你可以在这里编辑自己的个人信息、头像、个人介绍、学校与工作信息 —— 让二十年后回来的人，还能找到你。"
        breadcrumb={[{ label: "首页", href: "/" }, { label: "我的叶子" }]}
      />

      <PageTransition>
        <div className="surface-paper rounded-md p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-deep text-gold">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h2 className="display-heading text-xl text-ink">
                需要登录后访问
              </h2>
              <p className="font-serif text-sm text-ink-soft">
                同学用户身份认证尚未启用。
              </p>
            </div>
          </div>

          <p className="mt-6 font-serif text-ink-soft leading-7">
            根据 CLAUDE.md，同学用户登录后可以：
          </p>

          <ul className="mt-4 space-y-2.5">
            {[
              "编辑自己的个人信息",
              "修改头像",
              "更新个人介绍",
              "更新学校 / 工作信息",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 font-serif text-sm text-ink-soft"
              >
                <Leaf className="mt-1 h-3.5 w-3.5 shrink-0 text-forest" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-md bg-forest px-4 py-2.5 font-serif text-sm text-paper-soft hover:bg-forest-deep transition-colors"
            >
              <Lock className="h-3.5 w-3.5" />
              前往登录
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/forest"
              className="group inline-flex items-center gap-2 rounded-md border border-forest/40 bg-paper-soft px-4 py-2.5 font-serif text-sm text-forest hover:bg-paper-deep transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              先逛逛 Forest
            </Link>
          </div>
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
