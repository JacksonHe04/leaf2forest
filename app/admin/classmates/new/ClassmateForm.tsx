"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, AlertCircle } from "lucide-react";
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

interface Props {
  /** Existing classmate; omit when creating a new one. */
  initial?: Classmate;
}

export default function ClassmateForm({ initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [values, setValues] = useState<Record<FieldKey, string>>(
    Object.fromEntries(
      FIELDS.map((k) => [k, (initial?.[k] ?? "") as string])
    ) as Record<FieldKey, string>
  );
  const [avatar, setAvatar] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: FieldKey, v: string) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim()) {
      setError("姓名必填");
      return;
    }
    setSubmitting(true);
    setError(null);
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

      const url = isEdit
        ? `/api/classmates/${initial!.user_id}`
        : "/api/classmates";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status !== "success") throw new Error("保存失败");
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <FormSection title="基本信息" eyebrow="01 / Identity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={LABELS.name} required>
            <Input
              required
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              className="font-serif bg-paper border-border"
            />
          </Field>
          <Field label={LABELS.gender}>
            <Select
              value={values.gender || "none"}
              onValueChange={(v) => set("gender", v === "none" ? "" : v)}
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
          {isEdit && initial?.avatar_path && !avatar && (
            <p className="mt-1.5 font-serif text-xs text-ink-faint">
              当前已有头像，留空将保留原图。
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

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="font-serif">{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={submitting}
          className="h-10 px-5 font-serif bg-forest hover:bg-forest-deep"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              保存中…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              保存
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="h-10 px-5 font-serif border-forest/40 text-forest hover:bg-paper-deep"
        >
          取消
        </Button>
      </div>
    </form>
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
