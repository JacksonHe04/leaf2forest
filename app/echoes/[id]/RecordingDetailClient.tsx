"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Quote,
  Mic,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  X,
} from "lucide-react";
import AudioPlayer from "@/components/features/AudioPlayer";
import { LeafMotif } from "@/components/site/LeafMotif";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ClassmateTagSelector } from "@/components/features/ClassmateTagSelector";
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

/* ── Direct-edit field: click text to edit ── */

function DirectEditField({
  label,
  value,
  fieldKey,
  type = "text",
  multiline = false,
  onSave,
}: {
  label: string;
  value: string;
  fieldKey: string;
  type?: "text" | "date";
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
        <div className="relative">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              className="flex w-full rounded-lg border border-ring bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ring min-h-[80px] resize-y"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) commit();
                if (e.key === "Escape") cancel();
              }}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              className="flex w-full rounded-lg border border-ring bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ring"
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") cancel();
              }}
            />
          )}
          {/* Status indicator */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {status === "saving" && <Loader2 className="h-3 w-3 animate-spin text-gold" />}
            {status === "saved" && <Check className="h-3 w-3 text-forest" />}
            {status === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group/field">
      <label className="text-xs font-medium text-ink-faint">{label}</label>
      <div className="relative mt-1">
        <p
          onClick={() => setEditing(true)}
          className="text-sm text-ink whitespace-pre-wrap leading-relaxed cursor-pointer rounded-sm transition-colors hover:bg-forest/5 -mx-1 px-1"
          title="点击编辑"
        >
          {value || <span className="italic text-ink-faint/60">点击填写</span>}
        </p>
        {/* Status indicator */}
        <div className="absolute right-0 top-0 flex items-center gap-1">
          {status === "saving" && <Loader2 className="h-3 w-3 animate-spin text-gold" />}
          {status === "saved" && <Check className="h-3 w-3 text-forest" />}
          {status === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
        </div>
      </div>
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
  const [saveStatus, setSaveStatus] = useState<FieldStatus>("idle");
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(transcription);
  }, [transcription]);

  async function startTranscribe() {
    if (status === "streaming") {
      abortRef.current?.abort();
      setStatus("done");
      return;
    }

    setStatus("streaming");
    setText("");

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
            if (typeof parsed.text === "string") {
              setText(parsed.text);
              if (textareaRef.current) {
                textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
              }
            }
            if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (e) {
            if (e instanceof Error && e.message) throw e;
          }
        }
      }

      setStatus("done");
      // Auto-save after transcription completes
      if (text !== transcription) {
        setSaveStatus("saving");
        try {
          await onSave("transcription", text);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 1500);
        } catch {
          setSaveStatus("error");
          setTimeout(() => setSaveStatus("idle"), 2000);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setStatus("done");
      } else {
        console.error("Transcription failed:", err);
        setStatus("error");
      }
    }
  }

  async function saveText() {
    if (text === transcription) return;
    setSaveStatus("saving");
    try {
      await onSave("transcription", text);
      setSaveStatus("saved");
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
        </div>
      </div>

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
              : "点击「AI 转写」自动识别，或直接输入转录内容..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={saveText}
          disabled={status === "streaming"}
        />
      </div>
    </section>
  );
}

/* ── People editing section ── */

function PeopleSection({
  people,
  peopleIds,
  onSave,
}: {
  people: Person[];
  peopleIds: string[];
  onSave: (ids: string[]) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draftIds, setDraftIds] = useState(peopleIds);
  const [status, setStatus] = useState<FieldStatus>("idle");

  useEffect(() => {
    setDraftIds(peopleIds);
  }, [peopleIds]);

  async function commit() {
    if (JSON.stringify(draftIds) === JSON.stringify(peopleIds)) {
      setEditing(false);
      return;
    }
    setStatus("saving");
    try {
      await onSave(draftIds);
      setStatus("saved");
      setEditing(false);
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  if (editing) {
    return (
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
          <div className="ml-auto flex items-center gap-1.5">
            {status === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />}
            {status === "saved" && <Check className="h-3.5 w-3.5 text-forest" />}
            {status === "error" && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
            <Button size="sm" variant="ghost" onClick={commit}>
              <Check className="h-3.5 w-3.5" />
              完成
            </Button>
          </div>
        </div>
        <ClassmateTagSelector
          value={draftIds}
          onChange={setDraftIds}
          onFinish={commit}
        />
      </section>
    );
  }

  return (
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
        <div className="ml-auto flex items-center gap-1.5">
          {status === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />}
          {status === "saved" && <Check className="h-3.5 w-3.5 text-forest" />}
          {status === "error" && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            编辑
          </Button>
        </div>
      </div>
      {people.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {people.map((p) =>
            p.kind === "classmate" ? (
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
      ) : (
        <p
          onClick={() => setEditing(true)}
          className="italic text-ink-faint/60 text-sm cursor-pointer hover:text-forest transition-colors"
        >
          点击添加参与的人
        </p>
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
  const [currentPeople, setCurrentPeople] = useState(people);
  const [currentPeopleIds, setCurrentPeopleIds] = useState(recording.people ?? []);

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

  const savePeople = useCallback(
    async (ids: string[]) => {
      const res = await fetch(`/api/recordings/${data.num}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ people: ids }),
      });
      const json = await res.json();
      if (json.status !== "success") throw new Error("保存失败");
      setCurrentPeopleIds(ids);
      // Refetch people display — for now, reload the page data
      // A more elegant solution would be to resolve people client-side
      const peopleRes = await fetch(`/api/recordings/${data.num}`);
      const peopleJson = await peopleRes.json();
      if (peopleJson.data?.people_resolved) {
        setCurrentPeople(peopleJson.data.people_resolved);
      }
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

        <DirectEditField
          label="标题"
          value={data.title}
          fieldKey="title"
          onSave={saveField}
        />

        <div className="mt-2">
          <DirectEditField
            label="地点"
            value={data.location ?? ""}
            fieldKey="location"
            onSave={saveField}
          />
        </div>

        {/* Editable date/time */}
        <div className="mt-4 grid grid-cols-2 gap-4 max-w-md">
          <DirectEditField
            label="日期"
            value={data.date}
            fieldKey="date"
            type="date"
            onSave={saveField}
          />
          <DirectEditField
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
          <DirectEditField
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

        {/* Related people — editable */}
        <PeopleSection
          people={currentPeople}
          peopleIds={currentPeopleIds}
          onSave={savePeople}
        />
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
