"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Lock,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeafMotif } from "@/components/site/LeafMotif";
import { PageHeader } from "@/components/site/PageHeader";
import { PageTransition } from "@/components/site/PageTransition";
import { ClassmateProfileClient } from "@/components/features/ClassmateProfileClient";
import { SITE } from "@/lib/site";
import { leafLogoutPath } from "@/lib/auth/paths";
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
        <p className="font-serif text-sm leading-7 text-ink-soft">
          用户名、密码、邮箱与登录设备由 iNon 统一账号管理。
        </p>
        <Button asChild className="mt-5 font-serif bg-forest hover:bg-forest-deep">
          <a href="https://inon.space/sso/account">
            管理 iNon 账号
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
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
    <Link
      href={leafLogoutPath("/")}
      className="group inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 font-serif text-sm text-ink-soft hover:text-red-600 hover:border-red-300 transition-colors"
    >
      <LogOut className="h-3.5 w-3.5" />
      退出 Leaf
    </Link>
  );
}
