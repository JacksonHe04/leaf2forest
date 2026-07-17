"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, AlertCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Recording } from "@/lib/db/types";

interface ClassmateOption {
  id: string;
  name: string;
}

interface Props {
  classmates: ClassmateOption[];
  /** Existing recording; omit when creating a new one. */
  initial?: Recording;
}

export default function RecordingForm({ classmates, initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [time, setTime] = useState(initial?.time ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [background, setBackground] = useState(initial?.background ?? "");
  const [transcription, setTranscription] = useState(
    initial?.transcription ?? ""
  );
  const [location, setLocation] = useState(initial?.location ?? "");
  const [classmateIds, setClassmateIds] = useState<string[]>(
    initial?.classmates ?? []
  );
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleClassmate(id: string) {
    setClassmateIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isEdit && !audioFile) {
      setError("请选择音频文件");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      let audio_path = initial?.audio_path;

      // Upload new audio (only when user selected one)
      if (audioFile) {
        const fd = new FormData();
        fd.append("file", audioFile);
        const up = await fetch("/api/recordings/upload", {
          method: "POST",
          body: fd,
        });
        const upJson = await up.json();
        if (!upJson.success) throw new Error(upJson.error ?? "上传失败");
        audio_path = upJson.data.path;
      }

      const payload = {
        title,
        date,
        time: time || null,
        description: description || null,
        background: background || null,
        transcription: transcription || null,
        location: location || null,
        audio_path,
        classmates: classmateIds,
      };

      const url = isEdit
        ? `/api/recordings/${initial!.num}`
        : "/api/recordings";
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
        <Field label="标题" required>
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-serif bg-paper border-border"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label="日期" required>
            <Input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="font-serif bg-paper border-border"
            />
          </Field>
          <Field label="时间（可选）">
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="font-serif bg-paper border-border"
            />
          </Field>
        </div>

        <Field label="地点（可选）" className="mt-4">
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="font-serif bg-paper border-border"
            placeholder="录音发生的地方"
          />
        </Field>
      </FormSection>

      {/* Narrative */}
      <FormSection title="叙事" eyebrow="02 / Narrative">
        <Field label="背景">
          <Textarea
            rows={3}
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            className="font-serif bg-paper border-border leading-7"
            placeholder="这段录音是在什么情境下产生的？"
          />
        </Field>
        <Field label="描述" className="mt-4">
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="font-serif bg-paper border-border leading-7"
            placeholder="录音里发生了什么？"
          />
        </Field>
        <Field label="文字转录" className="mt-4">
          <Textarea
            rows={6}
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            className="font-serif bg-paper border-border leading-7"
            placeholder="把录音里说的话逐字记录下来…"
          />
        </Field>
      </FormSection>

      {/* Audio */}
      <FormSection
        title="音频文件"
        eyebrow="03 / Audio"
        description={
          isEdit
            ? "如需替换音频，选择新文件即可；留空将保留原文件。"
            : "支持 .wav / .mp3 / .m4a 等常见格式。"
        }
      >
        {isEdit && initial?.audio_path && (
          <div className="mb-4 rounded-md border border-gold/30 bg-paper-deep/40 px-4 py-3">
            <div className="eyebrow mb-1">当前音频对象</div>
            <code className="font-serif text-xs text-ink-soft break-all">
              {initial.audio_path}
            </code>
          </div>
        )}
        <label className="flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border bg-paper px-6 py-10 cursor-pointer hover:border-forest/40 hover:bg-paper-deep/30 transition-colors">
          <Upload className="h-6 w-6 text-forest" />
          <span className="font-serif text-sm text-ink-soft">
            {audioFile ? audioFile.name : "点击选择音频文件"}
          </span>
          <span className="font-serif text-xs text-ink-faint">
            {isEdit ? "可选 · 留空保留原文件" : "必填"}
          </span>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </label>
        {audioFile && (
          <button
            type="button"
            onClick={() => setAudioFile(null)}
            className="mt-2 inline-flex items-center gap-1 font-serif text-xs text-ink-faint hover:text-destructive transition-colors"
          >
            <X className="h-3 w-3" />
            清除已选文件
          </button>
        )}
      </FormSection>

      {/* Related classmates */}
      <FormSection
        title="关联同学"
        eyebrow="04 / Classmates"
        description="勾选出现在这段录音中的同学。"
      >
        {classmates.length === 0 ? (
          <p className="font-serif text-sm text-ink-faint italic">
            还没有同学。先到「同学管理」添加几位，再回来勾选。
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
            {classmates.map((c) => {
              const checked = classmateIds.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors font-serif text-sm ${
                    checked
                      ? "border-forest bg-forest/10 text-forest"
                      : "border-border bg-paper text-ink-soft hover:bg-paper-deep/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleClassmate(c.id)}
                    className="accent-forest"
                  />
                  {c.name}
                </label>
              );
            })}
          </div>
        )}
        {classmateIds.length > 0 && (
          <p className="mt-3 font-serif text-xs text-ink-faint">
            已选 {classmateIds.length} 位
          </p>
        )}
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
  description,
  children,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-paper rounded-md p-6 sm:p-7">
      <div className="mb-5">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="mt-1 display-heading text-xl text-ink">{title}</h2>
        {description && (
          <p className="mt-1.5 font-serif text-sm text-ink-soft leading-6">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
