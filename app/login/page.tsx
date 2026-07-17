"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeafMotif } from "@/components/site/LeafMotif";
import { SITE } from "@/lib/site";

/**
 * Login page — authenticates via /api/auth/login.
 *
 * Username is the classmate's pinyin slug (e.g. "chenhao").
 * On success, redirects to the `redirect` query param or /mine.
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/mine";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登录失败");
        setSubmitting(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 sm:px-8 py-12">
      <div className="text-center">
        <LeafMotif variant="mark" className="mx-auto h-8 w-8 text-forest" />
        <h1 className="mt-4 display-heading text-3xl text-ink">登录</h1>
        <p className="mt-2 font-serif text-sm text-ink-soft">
          使用你的拼音用户名登录，登录后可以维护自己的叶子。
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 surface-paper rounded-md p-6 sm:p-7 space-y-5"
      >
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-300/50 bg-red-50/50 px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="font-serif text-xs text-red-700 leading-6">
              {error}
            </p>
          </div>
        )}

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
              placeholder="例如：hejincheng"
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
              placeholder="••••••"
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

        <p className="text-center font-serif text-xs text-ink-faint">
          初始密码为 123456，登录后请及时修改。
        </p>
      </form>

      <p className="mt-6 text-center font-serif text-xs text-ink-faint">
        &copy; {SITE.graduatingYear - 3}–{new Date().getFullYear()} ·{" "}
        {SITE.name}
      </p>
    </main>
  );
}
