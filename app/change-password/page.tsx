"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeafMotif } from "@/components/site/LeafMotif";
import { SITE } from "@/lib/site";

/**
 * Change password page — authenticated users only.
 *
 * Calls /api/auth/change-password to update the password.
 */
export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (newPassword.length < 6) {
      setError("密码至少需要 6 个字符");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "修改失败");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);
    } catch {
      setError("网络错误，请稍后重试");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 sm:px-8 py-12">
      <Link
        href="/mine"
        className="group inline-flex items-center gap-1.5 font-serif text-sm text-ink-soft hover:text-forest transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
        返回我的叶子
      </Link>

      <div className="mt-6 text-center">
        <LeafMotif variant="mark" className="mx-auto h-8 w-8 text-forest" />
        <h1 className="mt-4 display-heading text-3xl text-ink">修改密码</h1>
        <p className="mt-2 font-serif text-sm text-ink-soft">
          修改你的登录密码。
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

        {success && (
          <div className="flex items-start gap-2 rounded-md border border-forest/30 bg-forest/5 px-3 py-2.5">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
            <p className="font-serif text-xs text-forest leading-6">
              密码修改成功。
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="font-serif text-ink-soft">
            新密码
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-9 bg-paper border-border font-serif"
              placeholder="至少 6 个字符"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="font-serif text-ink-soft">
            确认新密码
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-9 bg-paper border-border font-serif"
              placeholder="再输入一次"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting || success}
          className="w-full h-10 bg-forest hover:bg-forest-deep font-serif"
        >
          {submitting ? "提交中…" : "修改密码"}
        </Button>
      </form>

      <p className="mt-6 text-center font-serif text-xs text-ink-faint">
        &copy; {SITE.graduatingYear - 3}–{new Date().getFullYear()} ·{" "}
        {SITE.name}
      </p>
    </main>
  );
}
