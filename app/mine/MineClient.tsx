"use client";

import { useState } from "react";
import {
  Lock,
  LogOut,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeafMotif } from "@/components/site/LeafMotif";
import { PageHeader } from "@/components/site/PageHeader";
import { PageTransition } from "@/components/site/PageTransition";
import { ClassmateProfileClient } from "@/components/features/ClassmateProfileClient";
import { SITE } from "@/lib/site";
import type { Classmate, Recording } from "@/lib/db/types";

type Tab = "profile" | "account";

interface Props {
  classmate: Classmate;
  avatarUrl: string | null;
  recordings: Recording[];
}

export function MineClient({ classmate, avatarUrl, recordings }: Props) {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <main className="mx-auto max-w-5xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="My Leaf · 我的叶子"
        title={`${classmate.name}，你好`}
        subtitle="这是你在 Leaf2Forest 的个人页面。点击字段即可直接编辑。"
        breadcrumb={[{ label: "首页", href: "/" }, { label: "我的叶子" }]}
        actions={
          <div className="flex items-center gap-1 border-b border-border/70">
            <TabButton
              active={tab === "profile"}
              onClick={() => setTab("profile")}
              icon={<User className="h-3.5 w-3.5" />}
              label="我的资料"
            />
            <TabButton
              active={tab === "account"}
              onClick={() => setTab("account")}
              icon={<Lock className="h-3.5 w-3.5" />}
              label="账号管理"
            />
          </div>
        }
      />

      <PageTransition>
        {tab === "profile" && (
          <ClassmateProfileClient
            classmate={classmate}
            avatarUrl={avatarUrl}
            recordings={recordings}
            canEdit={true}
            isSelf={true}
            isAdmin={false}
          />
        )}

        {tab === "account" && <AccountTab classmate={classmate} />}

        {/* Closing mark */}
        <div className="mt-10 flex justify-center">
          <LeafMotif variant="sprig" className="h-7 w-20 text-forest/40" />
        </div>
        <p className="mt-4 text-center font-serif text-xs italic text-ink-faint">
          每一位同学都是独立成长的一片叶子。
        </p>
      </PageTransition>

      <p className="mt-6 text-center font-serif text-xs text-ink-faint">
        &copy; {SITE.graduatingYear - 3}–{new Date().getFullYear()} ·{" "}
        {SITE.name}
      </p>
    </main>
  );
}

/* ── Account management tab ── */

function AccountTab({ classmate }: { classmate: Classmate }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwError("两次输入的密码不一致");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("密码至少需要 6 个字符");
      return;
    }

    setChangingPw(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "修改失败");
        setChangingPw(false);
        return;
      }
      setPwSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPwError("网络错误，请稍后重试");
    } finally {
      setChangingPw(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="surface-paper rounded-md p-6 sm:p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-medium text-ink">
              {classmate.name}
            </h3>
            <p className="font-serif text-xs text-ink-faint">
              @{classmate.user_id}
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5">
          <h3 className="font-serif text-sm font-medium text-ink">
            修改密码
          </h3>

          {pwError && (
            <div className="flex items-start gap-2 rounded-md border border-red-300/50 bg-red-50/50 px-3 py-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="font-serif text-xs text-red-700 leading-6">
                {pwError}
              </p>
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-start gap-2 rounded-md border border-forest/30 bg-forest/5 px-3 py-2.5">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
              <p className="font-serif text-xs text-forest leading-6">
                密码修改成功。
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-serif text-ink-soft">新密码</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
              <Input
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
            <Label className="font-serif text-ink-soft">确认新密码</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
              <Input
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
            disabled={changingPw || pwSuccess}
            className="h-10 px-5 font-serif bg-forest hover:bg-forest-deep"
          >
            {changingPw ? "提交中…" : "修改密码"}
          </Button>
        </form>
      </div>

      {/* Logout */}
      <div className="flex justify-center pt-2">
        <LogoutButton />
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2.5 font-serif text-sm border-b-2 transition-colors -mb-px ${
        active
          ? "border-forest text-forest"
          : "border-transparent text-ink-faint hover:text-ink-soft hover:border-border"
      }`}
    >
      {icon}
      {label}
    </button>
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
