"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeafMotif } from "@/components/site/LeafMotif";
import { SITE } from "@/lib/site";

/**
 * Login page.
 *
 * NOTE: Real auth (Supabase Auth, by classmate username) is not yet
 * wired up — the admin role currently relies on Supabase RLS being
 * disabled (per project memory 2026-07-18). This page exists so the
 * information architecture in CLAUDE.md §5 is fully represented.
 *
 * It accepts a username + password, displays a friendly "not yet
 * available" notice, and links to /admin as a fallback for now.
 */
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // No real auth yet — just route to /my-leaf so the flow is testable.
    setTimeout(() => {
      setSubmitting(false);
      router.push("/my-leaf");
    }, 400);
  }

  return (
    <main className="mx-auto max-w-md px-5 sm:px-8 py-12">
      <Link
        href="/"
        className="group inline-flex items-center gap-1.5 font-serif text-sm text-ink-soft hover:text-forest transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
        返回首页
      </Link>

      <div className="mt-6 text-center">
        <LeafMotif variant="mark" className="mx-auto h-8 w-8 text-forest" />
        <h1 className="mt-4 display-heading text-3xl text-ink">登录</h1>
        <p className="mt-2 font-serif text-sm text-ink-soft">
          登录后可以维护自己在档案中的叶子。
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 surface-paper rounded-md p-6 sm:p-7 space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="username" className="font-serif text-ink-soft">
            用户名
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
            <Input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-9 bg-paper border-border font-serif"
              placeholder="your name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="font-serif text-ink-soft">
            密码
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 bg-paper border-border font-serif"
              placeholder="••••••••"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-10 bg-forest hover:bg-forest-deep font-serif"
        >
          {submitting ? "登录中…" : "登录"}
        </Button>

        <div className="flex items-start gap-2 rounded-md border border-gold/30 bg-paper-deep/40 px-3 py-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <p className="font-serif text-xs text-ink-soft leading-6">
            真实身份认证尚未接入。目前管理员可以通过{" "}
            <Link href="/admin" className="link-archive">
              管理后台
            </Link>{" "}
            维护全部数据，同学自助编辑入口将随后开放。
          </p>
        </div>
      </form>

      <p className="mt-6 text-center font-serif text-xs text-ink-faint">
        © {SITE.graduatingYear - 3}–{new Date().getFullYear()} ·{" "}
        {SITE.name}
      </p>
    </main>
  );
}
