"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  FileText,
  Quote,
  Mic,
  Pencil,
  Save,
  X,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import AudioPlayer from "@/components/features/AudioPlayer";
import { PageTransition } from "@/components/site/PageTransition";
import { LeafMotif } from "@/components/site/LeafMotif";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Recording, Person } from "@/lib/db/types";

/* ── Types ── */

interface Props {
  recording: Recording;
  audioUrl: string;
  sizeBytes: number;
  people: Person[];
  dateLabel: string;
}

type FieldStatus = "idle" | "saving" | "saved" | "error";
type TranscribeStatus = "idle" | "streaming" | "done" | "error";

/* ── Editable field ── */

function EditableField({
  label,
  value,
  fieldKey,
  multiline = false,
  onSave,
}: {
  label: string;
  value: string;
  fieldKey: string;
  multiline?: boolean;
  onSave: (key: string, value: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState<FieldStatus>("idle");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) inputRef.current.select();
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
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink-faint">{label}</label>
        <div className="flex gap-1.5">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              className="flex w-full rounded-lg border border-ring bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ring min-h-[80px] resize-y"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) commit();
                if (e.key === "Escape") cancel();
              }}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              className="flex w-full rounded-lg border border-ring bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ring"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") cancel();
              }}
            />
          )}
          <div className="flex flex-col gap-1">
            <button
              onClick={commit}
              className="rounded p-1 text-forest hover:bg-forest/10 transition-colors"
              title="保存 (⌘+Enter)"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={cancel}
              className="rounded p-1 text-ink-faint hover:bg-ink-faint/10 transition-colors"
              title="取消 (Esc)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group/field">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-ink-faint">{label}</label>
        <div className="flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity">
          {status === "saving" && <Loader2 className="h-3 w-3 animate-spin text-gold" />}
          {status === "saved" && <Check className="h-3 w-3 text-forest" />}
          {status === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
          <button
            onClick={() => setEditing(true)}
            className="rounded p-1 text-ink-faint hover:text-forest hover:bg-forest/10 transition-colors"
            title="编辑"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
      </div>
      <p className="mt-1 text-sm text-ink whitespace-pre-wrap leading-relaxed">
        {value || <span className="italic text-ink-faint/60">未填写</span>}
      </p>
    </div>
  );
}

/* ── Transcription section with streaming ── */

function TranscriptionSection({
  transcription,
  recordingNum,
  onSave,
}: {
  transcription: string;
  recordingNum: number;
  onSave: (key: string, value: string) => Promise<void>;
}) {
  const [text, setText] = useState(transcription);
  const [status, setStatus] = useState<TranscribeStatus>("idle");
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<FieldStatus>("idle");
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(transcription);
  }, [transcription]);

  async function startTranscribe() {
    if (status === "streaming") {
      // Cancel
      abortRef.current?.abort();
      setStatus("done");
      return;
    }

    setStatus("streaming");
    setText("");
    setEditing(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/recordings/${recordingNum}/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "未知错误" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("无法读取响应流");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload);
            // Volcengine ASR format: cumulative text
            if (typeof parsed.text === "string") {
              setText(parsed.text);
              if (textareaRef.current) {
                textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
              }
            }
            // Progress indicator (dot)
            if (parsed.progress) {
              // Just keep the streaming indicator visible
            }
            // Error from server
            if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (e) {
            if (e instanceof Error && e.message) throw e;
            // skip malformed JSON
          }
        }
      }

      setStatus("done");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setStatus("done");
      } else {
        console.error("Transcription failed:", err);
        setStatus("error");
      }
    }
  }

  async function saveTranscription() {
    if (text === transcription) {
      setEditing(false);
      return;
    }
    setSaveStatus("saving");
    try {
      await onSave("transcription", text);
      setSaveStatus("saved");
      setEditing(false);
      setTimeout(() => setSaveStatus("idle"), 1500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-deep text-forest">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <div className="eyebrow">Transcript</div>
            <h2 className="display-heading text-2xl text-ink leading-tight">
              文字转录
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === "streaming" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gold animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              转写中...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="inline-flex items-center gap-1 text-xs text-forest">
              <Check className="h-3 w-3" /> 已保存
            </span>
          )}
          <Button
            size="sm"
            variant={status === "streaming" ? "destructive" : "outline"}
            onClick={startTranscribe}
            disabled={status === "done" && text === transcription}
          >
            {status === "streaming" ? (
              <>
                <X className="h-3.5 w-3.5" />
                停止
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                AI 转写
              </>
            )}
          </Button>
          {editing && status !== "streaming" && (
            <>
              <Button size="sm" onClick={saveTranscription}>
                <Save className="h-3.5 w-3.5" />
                保存
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setText(transcription);
                  setEditing(false);
                }}
              >
                取消
              </Button>
            </>
          )}
          {!editing && status !== "streaming" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(true);
                setStatus("idle");
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              编辑
            </Button>
          )}
        </div>
      </div>

      {editing || status === "streaming" ? (
        <div className="relative">
          <span
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-0.5 bg-gold/40"
            aria-hidden="true"
          />
          <Textarea
            ref={textareaRef}
            className="min-h-[200px] pl-5 italic text-sm leading-relaxed resize-y"
            placeholder={
              status === "streaming"
                ? "正在识别音频内容..."
                : "点击「AI 转写」开始识别，或手动输入转录内容..."
            }
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (!editing) setEditing(true);
            }}
            disabled={status === "streaming"}
          />
        </div>
      ) : text ? (
        <div className="relative">
          <span
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-0.5 bg-gold/40"
            aria-hidden="true"
          />
          <p className="prose-archive whitespace-pre-wrap pl-5 italic">
            {text}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-ink-faint/40" />
          <p className="mt-2 text-sm text-ink-faint">
            暂无转录内容，点击「AI 转写」自动识别音频
          </p>
        </div>
      )}
    </section>
  );
}

/* ── Main component ── */

export function RecordingDetailClient({
  recording,
  audioUrl,
  sizeBytes,
  people,
  dateLabel,
}: Props) {
  const [data, setData] = useState(recording);

  const saveField = useCallback(
    async (key: string, value: string) => {
      const payload: Record<string, unknown> = {
        [key]: value === "" ? null : value,
      };
      const res = await fetch(`/api/recordings/${data.num}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status !== "success") throw new Error("保存失败");
      setData((prev) => ({ ...prev, [key]: value || null }));
    },
    [data.num]
  );

  return (
    <>
      {/* ============ Header ============ */}
      <header className="mt-6 border-b border-border pb-8">
        <div className="flex items-center gap-3 font-serif text-sm text-ink-faint">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-gold" />
            {dateLabel}
          </span>
          {data.time && (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-gold">·</span>
              <Clock className="h-4 w-4 text-gold" />
              {data.time}
            </span>
          )}
        </div>

        <EditableField
          label="标题"
          value={data.title}
          fieldKey="title"
          onSave={saveField}
        />

        {data.location && (
          <p className="mt-4 inline-flex items-center gap-1.5 font-serif text-sm text-ink-soft">
            <MapPin className="h-4 w-4 text-forest" />
            {data.location}
          </p>
        )}

        {/* Editable location */}
        <div className="mt-2">
          <EditableField
            label="地点"
            value={data.location ?? ""}
            fieldKey="location"
            onSave={saveField}
          />
        </div>

        {/* Editable date/time */}
        <div className="mt-4 grid grid-cols-2 gap-4 max-w-md">
          <EditableField
            label="日期"
            value={data.date}
            fieldKey="date"
            onSave={saveField}
          />
          <EditableField
            label="时间"
            value={data.time ?? ""}
            fieldKey="time"
            onSave={saveField}
          />
        </div>

        {/* Decorative rule */}
        <div className="mt-6 flex items-center gap-3 text-gold">
          <LeafMotif variant="mark" className="h-4 w-4" />
          <span className="h-px flex-1 bg-gradient-to-r from-gold via-gold/40 to-transparent" />
        </div>
      </header>

      {/* ============ Player ============ */}
      <section className="mt-8 surface-paper rounded-md p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          <Mic className="h-4 w-4 text-forest" />
          <span className="eyebrow">Play</span>
        </div>
        <AudioPlayer
          url={audioUrl}
          sizeBytes={sizeBytes}
          title={data.title}
          variant="feature"
        />
      </section>

      {/* ============ Body ============ */}
      <div className="mt-10 grid grid-cols-1 gap-8">
        {/* Story */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-deep text-forest">
              <Quote className="h-4 w-4" />
            </span>
            <div>
              <div className="eyebrow">Story</div>
              <h2 className="display-heading text-2xl text-ink leading-tight">
                故事
              </h2>
            </div>
          </div>
          <EditableField
            label="故事"
            value={data.story ?? ""}
            fieldKey="story"
            multiline
            onSave={saveField}
          />
        </section>

        {/* Transcription with AI streaming */}
        <TranscriptionSection
          transcription={data.transcription ?? ""}
          recordingNum={data.num}
          onSave={saveField}
        />

        {/* Related people */}
        {people.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-deep text-forest">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <div className="eyebrow">Present</div>
                <h2 className="display-heading text-2xl text-ink leading-tight">
                  参与的人
                </h2>
              </div>
            </div>
            <ul className="flex flex-wrap gap-2">
              {people.map((p) =>
                p.kind === 'classmate' ? (
                  <li key={p.id}>
                    <Link
                      href={`/forest/${p.user_id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-forest/30 bg-paper-soft px-3.5 py-1.5 font-serif text-sm text-ink-soft transition-all hover:border-forest hover:bg-forest hover:text-paper-soft"
                    >
                      <LeafMotif variant="mark" className="h-3 w-3" />
                      {p.name}
                    </Link>
                  </li>
                ) : (
                  <li key={p.id}>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-paper-soft px-3.5 py-1.5 font-serif text-sm text-ink-soft">
                      {p.name}
                      <span className="text-ink-faint/60 text-xs">{p.subject}</span>
                    </span>
                  </li>
                )
              )}
            </ul>
          </section>
        )}
      </div>

      {/* Closing colophon */}
      <div className="mt-16 flex items-center justify-center text-gold">
        <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
        <LeafMotif variant="mark" className="mx-3 h-4 w-4" />
        <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
      </div>
      <p className="mt-3 text-center font-serif text-xs italic text-ink-faint">
        这段声音录制于 {dateLabel}
        {data.time ? ` ${data.time}` : ""}。
      </p>
    </>
  );
}
