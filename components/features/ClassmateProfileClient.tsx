"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Phone,
  Loader2,
  Check,
  AlertCircle,
  Upload,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeafMotif } from "@/components/site/LeafMotif";
import RecordingCard from "@/components/features/RecordingCard";
import type { Classmate, Recording, Person } from "@/lib/db/types";

/* ── Types ── */

type FieldStatus = "idle" | "saving" | "saved" | "error";

interface Props {
  classmate: Classmate;
  avatarUrl: string | null;
  recordings: Recording[];
  /** Whether the current viewer can edit this profile (admin or self). */
  canEdit: boolean;
  /** Whether the viewer IS this classmate (name stays read-only for self). */
  isSelf: boolean;
  /** Whether the viewer is admin (admin can edit name too). */
  isAdmin: boolean;
}

/* ── Inline editable text field ── */

function InlineField({
  value,
  fieldKey,
  type = "text",
  placeholder = "点击填写",
  canEdit,
  onSave,
  className,
}: {
  value: string;
  fieldKey: string;
  type?: "text" | "date";
  placeholder?: string;
  canEdit: boolean;
  onSave: (key: string, value: string) => Promise<void>;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState<FieldStatus>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  async function commit() {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setStatus("saving");
    try {
      await onSave(fieldKey, draft);
      setStatus("saved");
      setEditing(false);
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          className="flex w-full rounded border border-ring bg-paper px-2 py-1 font-serif text-sm text-ink outline-none focus:border-ring"
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {status === "saving" && <Loader2 className="h-3 w-3 animate-spin text-gold" />}
          {status === "saved" && <Check className="h-3 w-3 text-forest" />}
          {status === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
        </div>
      </div>
    );
  }

  return (
    <span
      onClick={() => canEdit && setEditing(true)}
      className={
        canEdit
          ? `cursor-pointer rounded-sm transition-colors hover:bg-forest/5 ${className ?? ""}`
          : className
      }
      title={canEdit ? "点击编辑" : undefined}
    >
      {value || <span className="italic text-ink-faint/60">{placeholder}</span>}
    </span>
  );
}

/* ── Inline editable textarea ── */

function InlineTextarea({
  value,
  fieldKey,
  placeholder = "点击填写",
  canEdit,
  onSave,
  className,
  rows = 3,
}: {
  value: string;
  fieldKey: string;
  placeholder?: string;
  canEdit: boolean;
  onSave: (key: string, value: string) => Promise<void>;
  className?: string;
  rows?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState<FieldStatus>("idle");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  async function commit() {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setStatus("saving");
    try {
      await onSave(fieldKey, draft);
      setStatus("saved");
      setEditing(false);
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="relative">
        <textarea
          ref={inputRef}
          className="flex w-full rounded border border-ring bg-paper px-2 py-1 font-serif text-sm text-ink outline-none focus:border-ring resize-y min-h-[60px]"
          rows={rows}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) commit();
            if (e.key === "Escape") cancel();
          }}
        />
        <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5">
          {status === "saving" && <Loader2 className="h-3 w-3 animate-spin text-gold" />}
          {status === "saved" && <Check className="h-3 w-3 text-forest" />}
          {status === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
        </div>
      </div>
    );
  }

  return (
    <p
      onClick={() => canEdit && setEditing(true)}
      className={
        canEdit
          ? `cursor-pointer rounded-sm transition-colors hover:bg-forest/5 -mx-1 px-1 ${className ?? ""}`
          : className
      }
      title={canEdit ? "点击编辑" : undefined}
    >
      {value || <span className="italic text-ink-faint/60">{placeholder}</span>}
    </p>
  );
}

/* ── Main component ── */

export function ClassmateProfileClient({
  classmate: initialClassmate,
  avatarUrl: initialAvatarUrl,
  recordings,
  canEdit,
  isSelf,
}: Props) {
  const [classmate, setClassmate] = useState(initialClassmate);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);

  const c = classmate;

  const saveField = useCallback(
    async (key: string, value: string) => {
      const payload: Record<string, unknown> = {
        [key]: value === "" ? null : value,
      };
      const res = await fetch(`/api/classmates/${c.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status !== "success") throw new Error("保存失败");
      setClassmate((prev) => ({ ...prev, [key]: value || null }));
    },
    [c.user_id]
  );

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/images/upload", { method: "POST", body: fd });
      const upJson = await up.json();
      if (!upJson.success) throw new Error(upJson.error ?? "上传失败");
      const path = upJson.data.path as string;
      // Update classmate record
      const res = await fetch(`/api/classmates/${c.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_path: path }),
      });
      const json = await res.json();
      if (json.status !== "success") throw new Error("保存失败");
      setClassmate((prev) => ({ ...prev, avatar_path: path }));
      // Use the public URL returned by the upload API
      setAvatarUrl(upJson.data.url as string);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  // Derived display data
  const initials = c.name.slice(0, 1);

  const educationRows: { label: string; university: string | null; major: string | null; uniKey: string; majorKey: string }[] = [
    { label: "本科", university: c.bachelor_university, major: c.bachelor_major, uniKey: "bachelor_university", majorKey: "bachelor_major" },
    { label: "硕士", university: c.master_university, major: c.master_major, uniKey: "master_university", majorKey: "master_major" },
    { label: "博士", university: c.doctor_university, major: c.doctor_major, uniKey: "doctor_university", majorKey: "doctor_major" },
  ];

  const contactRows: { label: string; value: string | null; icon: React.ReactNode; fieldKey: string }[] = [
    { label: "QQ", value: c.qq, icon: <MessageCircle className="h-4 w-4" />, fieldKey: "qq" },
    { label: "微信", value: c.wechat, icon: <MessageCircle className="h-4 w-4" />, fieldKey: "wechat" },
    { label: "电话", value: c.phone, icon: <Phone className="h-4 w-4" />, fieldKey: "phone" },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: portrait + meta */}
        <aside className="md:col-span-1">
          <div className="surface-paper rounded-md p-6 text-center">
            <div className="relative inline-block">
              <span
                className="absolute -inset-2 rounded-full bg-gold/10"
                aria-hidden="true"
              />
              <Avatar className="relative h-32 w-32 rounded-full border-2 border-gold/30 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={c.name} />}
                <AvatarFallback className="bg-paper-deep font-serif text-4xl text-forest">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {canEdit && (
                <label
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-forest text-paper shadow-md transition-colors hover:bg-forest-deep"
                  title="更换头像"
                >
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            <div className="mt-5 flex justify-center">
              <LeafMotif variant="mark" className="h-5 w-5 text-gold/60" />
            </div>

            <dl className="mt-5 space-y-2.5 text-left">
              <div className="flex items-center gap-3">
                <span className="text-forest"><MapPin className="h-4 w-4" /></span>
                <div className="flex-1 min-w-0">
                  <dt className="font-serif text-[10px] tracking-wider uppercase text-ink-faint">
                    所在城市
                  </dt>
                  <dd className="font-serif text-sm text-ink truncate">
                    <InlineField
                      value={c.city ?? ""}
                      fieldKey="city"
                      canEdit={canEdit}
                      onSave={saveField}
                      className="font-serif text-sm text-ink"
                    />
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-forest"><Briefcase className="h-4 w-4" /></span>
                <div className="flex-1 min-w-0">
                  <dt className="font-serif text-[10px] tracking-wider uppercase text-ink-faint">
                    工作单位
                  </dt>
                  <dd className="font-serif text-sm text-ink truncate">
                    <InlineField
                      value={c.employer ?? ""}
                      fieldKey="employer"
                      canEdit={canEdit}
                      onSave={saveField}
                      className="font-serif text-sm text-ink"
                    />
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-forest"><Briefcase className="h-4 w-4" /></span>
                <div className="flex-1 min-w-0">
                  <dt className="font-serif text-[10px] tracking-wider uppercase text-ink-faint">
                    所属行业
                  </dt>
                  <dd className="font-serif text-sm text-ink truncate">
                    <InlineField
                      value={c.industry ?? ""}
                      fieldKey="industry"
                      canEdit={canEdit}
                      onSave={saveField}
                      className="font-serif text-sm text-ink"
                    />
                  </dd>
                </div>
              </div>
              {!c.city && !c.employer && !c.industry && !canEdit && (
                <p className="text-center font-serif text-xs italic text-ink-faint">
                  基本资料待补充
                </p>
              )}
            </dl>
          </div>
        </aside>

        {/* Right: detailed panels */}
        <section className="md:col-span-2 space-y-6">
          {/* Education */}
          {(educationRows.some((r) => r.university || r.major) || canEdit) && (
            <Panel title="教育经历" icon={<GraduationCap className="h-4 w-4" />}>
              <ul className="space-y-3">
                {educationRows.map((row) => (
                  <li
                    key={row.label}
                    className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-l-2 border-gold/40 pl-4"
                  >
                    <span className="font-serif text-xs tracking-wider uppercase text-gold w-12 shrink-0">
                      {row.label}
                    </span>
                    <div className="flex-1">
                      <div className="font-serif text-ink">
                        <InlineField
                          value={row.university ?? ""}
                          fieldKey={row.uniKey}
                          placeholder="—"
                          canEdit={canEdit}
                          onSave={saveField}
                          className="font-serif text-ink"
                        />
                      </div>
                      <div className="font-serif text-sm text-ink-soft">
                        <InlineField
                          value={row.major ?? ""}
                          fieldKey={row.majorKey}
                          placeholder="—"
                          canEdit={canEdit}
                          onSave={saveField}
                          className="font-serif text-sm text-ink-soft"
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {/* Bio / 个人介绍 */}
          <Panel title="个人介绍" icon={<MessageCircle className="h-4 w-4" />}>
            <InlineTextarea
              value={c.bio ?? ""}
              fieldKey="bio"
              placeholder={canEdit ? "点击写一段自我介绍…" : "尚未填写个人介绍。"}
              canEdit={canEdit}
              onSave={saveField}
              className="prose-archive whitespace-pre-wrap text-sm leading-relaxed text-ink-soft"
              rows={4}
            />
          </Panel>

          {/* Contact */}
          {(contactRows.some((r) => r.value) || canEdit) && (
            <Panel title="联系方式" icon={<MessageCircle className="h-4 w-4" />}>
              <p className="mb-4 font-serif text-xs italic text-ink-faint">
                以下联系方式仅用于同学之间重新连接，请勿外传。
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {contactRows.map((row) => (
                  <li
                    key={row.label}
                    className="rounded-md border border-border bg-paper-deep/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-forest">
                      {row.icon}
                      <span className="font-serif text-xs tracking-wider uppercase">
                        {row.label}
                      </span>
                    </div>
                    <div className="mt-1 font-serif text-sm text-ink break-all">
                      <InlineField
                        value={row.value ?? ""}
                        fieldKey={row.fieldKey}
                        canEdit={canEdit}
                        onSave={saveField}
                        className="font-serif text-sm text-ink break-all"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {/* Recordings */}
          {recordings.length > 0 && (
            <Panel
              title={`出现在 ${recordings.length} 段录音中`}
              icon={<Calendar className="h-4 w-4" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recordings.slice(0, 6).map((r, i) => (
                  <RecordingCard
                    key={r.id}
                    recording={r}
                    people={[{ kind: "classmate", id: c.id, name: c.name, user_id: c.user_id }]}
                    sizeBytes={null}
                    variant="row"
                    index={i}
                  />
                ))}
              </div>
              {recordings.length > 6 && (
                <p className="mt-4 font-serif text-xs text-ink-faint">
                  仅显示前 6 段。完整列表见{" "}
                  <Link
                    href={`/echoes?classmate=${c.id}`}
                    className="link-archive"
                  >
                    Echoes 声音档案
                  </Link>
                  。
                </p>
              )}
            </Panel>
          )}

          {recordings.length === 0 &&
            educationRows.every((r) => !r.university && !r.major) &&
            contactRows.every((r) => !r.value) &&
            !canEdit && (
              <div className="surface-paper rounded-md p-10 text-center">
                <LeafMotif variant="sprig" className="mx-auto h-8 w-24 text-forest/40" />
                <p className="mt-5 font-serif text-ink-soft">
                  这片叶子还没有写下任何内容。
                </p>
                {isSelf && (
                  <p className="mt-1 font-serif text-sm text-ink-faint">
                    点击上方字段即可开始编辑你的资料。
                  </p>
                )}
              </div>
            )}
        </section>
      </div>
    </>
  );
}

/* ── Panel sub-component ── */

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-paper rounded-md p-6">
      <h3 className="flex items-center gap-2 display-heading text-lg text-ink">
        <span className="text-forest">{icon}</span>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
