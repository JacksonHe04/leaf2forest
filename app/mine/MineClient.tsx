"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Lock,
  Eye,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeafMotif } from "@/components/site/LeafMotif";
import { PageHeader } from "@/components/site/PageHeader";
import { PageTransition } from "@/components/site/PageTransition";
import { SITE } from "@/lib/site";
import type { Classmate } from "@/lib/db/types";

const FIELDS = [
  "name",
  "gender",
  "birth_date",
  "city",
  "qq",
  "wechat",
  "phone",
  "employer",
  "industry",
  "bachelor_university",
  "bachelor_major",
  "master_university",
  "master_major",
  "doctor_university",
  "doctor_major",
  "bio",
] as const;

type FieldKey = (typeof FIELDS)[number];

const LABELS: Record<FieldKey, string> = {
  name: "姓名",
  gender: "性别",
  birth_date: "出生日期",
  city: "所在城市",
  qq: "QQ",
  wechat: "微信号",
  phone: "电话",
  employer: "工作单位",
  industry: "所属行业",
  bachelor_university: "本科院校",
  bachelor_major: "本科专业",
  master_university: "硕士院校",
  master_major: "硕士专业",
  doctor_university: "博士院校",
  doctor_major: "博士专业",
  bio: "简介",
};

const EDUCATION_GROUPS: { title: string; fields: FieldKey[] }[] = [
  { title: "本科", fields: ["bachelor_university", "bachelor_major"] },
  { title: "硕士", fields: ["master_university", "master_major"] },
  { title: "博士", fields: ["doctor_university", "doctor_major"] },
];

type Tab = "edit" | "account";

interface Props {
  classmate: Classmate;
}

export function MineClient({ classmate }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("edit");

  // ── Edit tab state ──
  const [values, setValues] = useState<Record<FieldKey, string>>(
    Object.fromEntries(
      FIELDS.map((k) => [k, (classmate?.[k] ?? "") as string])
    ) as Record<FieldKey, string>
  );
  const [avatar, setAvatar] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // ── Account tab state ──
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  function set(k: FieldKey, v: string) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim()) {
      setEditError("姓名必填");
      return;
    }
    setSaving(true);
    setEditError(null);
    setEditSuccess(false);
    try {
      let avatar_path: string | undefined;
      if (avatar) {
        const fd = new FormData();
        fd.append("file", avatar);
        const up = await fetch("/api/images/upload", {
          method: "POST",
          body: fd,
        });
        const upJson = await up.json();
        if (!upJson.success) throw new Error(upJson.error ?? "头像上传失败");
        avatar_path = upJson.data.path;
      }

      const payload: Record<string, string | null | string[]> = {
        name: values.name,
      };
      for (const k of FIELDS) {
        if (k === "name") continue;
        const v = values[k].trim();
        if (v) payload[k] = v;
      }
      if (avatar_path) payload.avatar_path = avatar_path;

      const res = await fetch(`/api/classmates/${classmate.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status !== "success") throw new Error("保存失败");
      setEditSuccess(true);
      router.refresh();
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

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
    <main className="mx-auto max-w-3xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="My Leaf · 我的叶子"
        title={`${classmate.name}，你好`}
        subtitle="这是你在 Leaf2Forest 的个人页面。你可以在这里编辑自己的信息、管理账号。"
        breadcrumb={[{ label: "首页", href: "/" }, { label: "我的叶子" }]}
      />

      <PageTransition>
        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b border-border/70 mb-8">
          <TabButton
            active={tab === "edit"}
            onClick={() => setTab("edit")}
            icon={<User className="h-3.5 w-3.5" />}
            label="信息编辑"
          />
          <TabButton
            active={tab === "account"}
            onClick={() => setTab("account")}
            icon={<Lock className="h-3.5 w-3.5" />}
            label="账号管理"
          />
        </div>

        {/* ── Tab 1: Edit info ── */}
        {tab === "edit" && (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Preview link */}
            <div className="flex items-center justify-between surface-paper rounded-md px-5 py-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-forest" />
                <span className="font-serif text-sm text-ink-soft">
                  在 Forest 中查看你的公开档案
                </span>
              </div>
              <Link
                href={`/forest/${classmate.user_id}`}
                className="inline-flex items-center gap-1 rounded-md border border-forest/40 bg-paper-soft px-3 py-1.5 font-serif text-xs text-forest hover:bg-forest hover:text-paper-soft transition-colors"
              >
                预览
              </Link>
            </div>

            {/* Basic info */}
            <FormSection title="基本信息" eyebrow="01 / Identity">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={LABELS.name}>
                  <Input
                    readOnly
                    value={values.name}
                    className="font-serif bg-paper-deep/50 border-border text-ink-faint cursor-not-allowed"
                  />
                  <p className="mt-1 font-serif text-[11px] text-ink-faint">
                    姓名由管理员统一维护，不可自行修改
                  </p>
                </Field>
                <Field label={LABELS.gender}>
                  <Select
                    value={values.gender || "none"}
                    onValueChange={(v) =>
                      set("gender", v === "none" ? "" : v)
                    }
                  >
                    <SelectTrigger className="font-serif bg-paper border-border">
                      <SelectValue placeholder="未填" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">未填</SelectItem>
                      <SelectItem value="male">男</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={LABELS.birth_date}>
                  <Input
                    type="date"
                    value={values.birth_date}
                    onChange={(e) => set("birth_date", e.target.value)}
                    className="font-serif bg-paper border-border"
                  />
                </Field>
                <Field label={LABELS.city}>
                  <Input
                    value={values.city}
                    onChange={(e) => set("city", e.target.value)}
                    className="font-serif bg-paper border-border"
                  />
                </Field>
              </div>

              <Field label="头像（可选，jpg/png/webp/gif）" className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm font-serif text-ink-soft file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:font-serif file:bg-paper-deep file:text-ink hover:file:bg-paper-deep/70 cursor-pointer"
                />
                {classmate.avatar_path && !avatar && (
                  <p className="mt-1.5 font-serif text-xs text-ink-faint">
                    当前已有头像，上传新头像将替换原图。
                  </p>
                )}
              </Field>
            </FormSection>

            {/* Contact */}
            <FormSection title="联系方式" eyebrow="02 / Contact">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label={LABELS.qq}>
                  <Input
                    type="tel"
                    value={values.qq}
                    onChange={(e) => set("qq", e.target.value)}
                    className="font-serif bg-paper border-border"
                  />
                </Field>
                <Field label={LABELS.wechat}>
                  <Input
                    value={values.wechat}
                    onChange={(e) => set("wechat", e.target.value)}
                    className="font-serif bg-paper border-border"
                  />
                </Field>
                <Field label={LABELS.phone}>
                  <Input
                    type="tel"
                    value={values.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className="font-serif bg-paper border-border"
                  />
                </Field>
              </div>
            </FormSection>

            {/* Work */}
            <FormSection title="工作" eyebrow="03 / Work">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={LABELS.employer}>
                  <Input
                    value={values.employer}
                    onChange={(e) => set("employer", e.target.value)}
                    className="font-serif bg-paper border-border"
                  />
                </Field>
                <Field label={LABELS.industry}>
                  <Input
                    value={values.industry}
                    onChange={(e) => set("industry", e.target.value)}
                    className="font-serif bg-paper border-border"
                  />
                </Field>
              </div>
            </FormSection>

            {/* Education */}
            <FormSection title="教育经历" eyebrow="04 / Education">
              <div className="space-y-5">
                {EDUCATION_GROUPS.map((group) => (
                  <div key={group.title} className="border-l-2 border-gold/40 pl-4">
                    <h3 className="eyebrow mb-3">{group.title}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {group.fields.map((f) => (
                        <Field key={f} label={LABELS[f]}>
                          <Input
                            value={values[f]}
                            onChange={(e) => set(f, e.target.value)}
                            className="font-serif bg-paper border-border"
                          />
                        </Field>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </FormSection>

            {/* Bio */}
            <FormSection title="个人介绍" eyebrow="05 / Bio">
              <Field label={LABELS.bio}>
                <Textarea
                  rows={5}
                  value={values.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  className="font-serif bg-paper border-border leading-7"
                  placeholder="一句话介绍你自己 —— 现在在哪里，正在做什么…"
                />
              </Field>
            </FormSection>

            {/* Error / Success */}
            {editError && (
              <div className="flex items-start gap-2 rounded-md border border-red-300/50 bg-red-50/50 px-3 py-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="font-serif text-xs text-red-700 leading-6">
                  {editError}
                </p>
              </div>
            )}
            {editSuccess && (
              <div className="flex items-start gap-2 rounded-md border border-forest/30 bg-forest/5 px-3 py-2.5">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                <p className="font-serif text-xs text-forest leading-6">
                  信息保存成功。
                </p>
              </div>
            )}

            {/* Save + Logout */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="h-10 px-5 font-serif bg-forest hover:bg-forest-deep"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    保存中…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    保存修改
                  </>
                )}
              </Button>
              <LogoutButton />
            </div>
          </form>
        )}

        {/* ── Tab 2: Account ── */}
        {tab === "account" && (
          <div className="space-y-6">
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
        )}

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

/* ── Sub-components ── */

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

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block font-serif text-xs tracking-wider uppercase text-ink-faint">
        {label}
        {required && <span className="ml-0.5 text-gold">*</span>}
      </Label>
      {children}
    </div>
  );
}

function FormSection({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-paper rounded-md p-6 sm:p-7">
      <div className="mb-5">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="mt-1 display-heading text-xl text-ink">{title}</h2>
      </div>
      {children}
    </section>
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
