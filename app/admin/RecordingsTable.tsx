"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineAudioPlayer } from "./InlineAudioPlayer";
import { ClassmateTagSelector } from "./ClassmateTagSelector";
import type { Recording, Classmate, Teacher } from "@/lib/db/types";

/* ── Constants ── */

function audioUrl(path: string) {
  return `https://lugszrtwvninbduskick.supabase.co/storage/v1/object/public/recordings/${path}`;
}

function fmtDuration(s: number | null) {
  if (!s || !isFinite(s)) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ── Sticky column pixel widths ── */
const IDX_W = 48;    // # column
const TITLE_W = 144;  // title column (w-36)
const ACT_W = 44;     // each action column

/* ── Column definitions ── */

interface ColDef {
  key: string;
  label: string;
  width: string;
  type?: "text" | "date" | "time";
  group?: string;
  editable?: boolean;
}

const DATA_COLUMNS: ColDef[] = [
  { key: "date", label: "日期", width: "w-40", type: "date", group: "基本信息", editable: true },
  { key: "time", label: "时间", width: "w-20", type: "time", group: "基本信息", editable: true },
  { key: "title", label: "标题", width: "w-36", type: "text", group: "基本信息", editable: true },
  { key: "location", label: "地点", width: "w-24", type: "text", group: "内容", editable: true },
  { key: "description", label: "描述", width: "w-40", type: "text", group: "内容", editable: true },
  { key: "background", label: "背景", width: "w-40", type: "text", group: "内容", editable: true },
  { key: "transcription", label: "转录", width: "w-48", type: "text", group: "内容", editable: true },
  { key: "audio_path", label: "音频路径", width: "w-40", group: "音频", editable: false },
  { key: "duration_seconds", label: "时长", width: "w-16", group: "音频", editable: false },
  { key: "people", label: "参与人员", width: "w-36", type: "text", group: "关联", editable: true },
];

/* ── Cell status ── */

type CellStatus = "idle" | "saving" | "saved" | "error";

function ck(rowId: string, col: string) {
  return `${rowId}:${col}`;
}

/* ── Helpers ── */

function getVal(rec: Recording, key: string): string {
  const v = (rec as unknown as Record<string, unknown>)[key];
  if (v === null || v === undefined) return "";
  return String(v);
}

function resolvePeopleNames(ids: string[], classmates: Classmate[], teachers: Teacher[]): string {
  const map = new Map<string, string>();
  for (const c of classmates) map.set(c.id, c.name);
  for (const t of teachers) map.set(t.id, t.name);
  return ids.map((id) => map.get(id) ?? id).join("、");
}

function parsePeopleNames(input: string, classmates: Classmate[], teachers: Teacher[]): string[] {
  const names = input.split(/[,，、;\s]+/).map((n) => n.trim()).filter(Boolean);
  const nameMap = new Map<string, string>();
  for (const c of classmates) nameMap.set(c.name, c.id);
  for (const t of teachers) nameMap.set(t.name, t.id);
  const ids: string[] = [];
  for (const name of names) {
    const id = nameMap.get(name);
    if (id) ids.push(id);
  }
  return ids;
}

/* ── Main component ── */

interface Props {
  recordings: Recording[];
  classmates: Classmate[];
  teachers: Teacher[];
}

export function RecordingsTable({ recordings: initialRecs, classmates, teachers }: Props) {
  const [recordings, setRecordings] = useState(initialRecs);
  const [editing, setEditing] = useState<{ rowId: string; col: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editClassmateIds, setEditClassmateIds] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<Record<string, CellStatus>>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const displayValue = useCallback(
    (rec: Recording, key: string): string => {
      if (key === "people") return resolvePeopleNames(rec.people, classmates, teachers);
      if (key === "duration_seconds") return fmtDuration(rec.duration_seconds);
      if (key === "date" && rec.date && rec.time) {
        return `${rec.date} ${rec.time.slice(0, 5)}`;
      }
      return getVal(rec, key);
    },
    [classmates, teachers]
  );

  async function saveCell(rec: Recording, col: string, rawValue: string) {
    const key = ck(rec.id, col);
    setStatuses((p) => ({ ...p, [key]: "saving" }));
    try {
      const payload: Record<string, unknown> = {};
      if (col === "people") {
        payload.people = parsePeopleNames(rawValue, classmates, teachers);
      } else {
        payload[col] = rawValue === "" ? null : rawValue;
      }
      const res = await fetch(`/api/recordings/${rec.num}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status !== "success") throw new Error("保存失败");
      setRecordings((prev) =>
        prev.map((r) => {
          if (r.id !== rec.id) return r;
          if (col === "people") return { ...r, people: parsePeopleNames(rawValue, classmates, teachers) };
          return { ...r, [col]: rawValue || null };
        })
      );
      setStatuses((p) => ({ ...p, [key]: "saved" }));
      setTimeout(() => setStatuses((p) => { const n = { ...p }; delete n[key]; return n; }), 2000);
    } catch {
      setStatuses((p) => ({ ...p, [key]: "error" }));
      setTimeout(() => setStatuses((p) => { const n = { ...p }; delete n[key]; return n; }), 3000);
    }
  }

  function startEdit(rec: Recording, col: ColDef) {
    setEditing({ rowId: rec.id, col: col.key });
    if (col.key === "people") {
      setEditClassmateIds(rec.people ?? []);
    } else {
      setEditValue(getVal(rec, col.key));
    }
  }

  async function savePeople(rec: Recording, ids: string[]) {
    const key = ck(rec.id, "people");
    setStatuses((p) => ({ ...p, [key]: "saving" }));
    try {
      const res = await fetch(`/api/recordings/${rec.num}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ people: ids }),
      });
      const json = await res.json();
      if (json.status !== "success") throw new Error("保存失败");
      setRecordings((prev) =>
        prev.map((r) => (r.id === rec.id ? { ...r, people: ids } : r))
      );
      setStatuses((p) => ({ ...p, [key]: "saved" }));
      setTimeout(() => setStatuses((p) => { const n = { ...p }; delete n[key]; return n; }), 2000);
    } catch {
      setStatuses((p) => ({ ...p, [key]: "error" }));
      setTimeout(() => setStatuses((p) => { const n = { ...p }; delete n[key]; return n; }), 3000);
    }
  }

  function commitEdit() {
    if (!editing) return;
    // People column is handled by ClassmateTagSelector onFinish
    if (editing.col === "people") return;
    const rec = recordings.find((r) => r.id === editing.rowId);
    const col = DATA_COLUMNS.find((c) => c.key === editing.col);
    if (!rec || !col) return;
    const old = displayValue(rec, col.key);
    if (editValue !== old) saveCell(rec, col.key, editValue);
    setEditing(null);
  }

  function cancelEdit() {
    setEditing(null);
    setEditValue("");
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
    if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
  }

  async function handleDelete(rec: Recording) {
    if (!confirm(`确定要删除录音「${rec.title}」吗？此操作不可撤销。`)) return;
    setDeleting(rec.id);
    try {
      const res = await fetch(`/api/recordings/${rec.num}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      setRecordings((prev) => prev.filter((r) => r.id !== rec.id));
    } catch {
      alert("删除失败，请重试");
    } finally {
      setDeleting(null);
    }
  }

  const groups = Array.from(new Set(DATA_COLUMNS.map((c) => c.group)));

  const stickyBg = "bg-paper";
  const stickyBgHeader = "bg-paper-deep";

  return (
    <div className="surface-paper rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border/70 bg-paper-deep/40 px-5 py-3">
        <span className="font-serif text-sm text-ink-soft">
          共 {recordings.length} 条录音 · 点击单元格编辑，失焦自动保存
        </span>
        <Button asChild size="sm" className="font-serif bg-forest hover:bg-forest-deep h-7 text-xs">
          <Link href="/admin/recordings/new">
            <Plus className="h-3 w-3" />
            新增录音
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-max min-w-full">
          <thead>
            {/* Group header */}
            <tr className="border-b border-border/50 bg-paper-deep/60">
              <th className={`sticky left-0 z-20 ${stickyBgHeader} px-2 py-1.5 font-serif text-xs text-ink-faint border-r border-border/40`} style={{ width: IDX_W }}>
                #
              </th>
              <th className="px-1 py-1.5" style={{ width: 0 }} />
              {groups.map((g) => {
                const cols = DATA_COLUMNS.filter((c) => c.group === g);
                return (
                  <th key={g} colSpan={cols.length} className="px-2 py-1.5 font-serif text-xs uppercase tracking-wider text-forest/70 border-l border-border/30 text-center">
                    {g}
                  </th>
                );
              })}
              <th className={`sticky right-0 z-20 ${stickyBgHeader} px-1 py-1.5 font-serif text-xs text-ink-faint border-l border-border/40 text-center`} style={{ width: ACT_W * 2 }}>
                操作
              </th>
            </tr>
            {/* Column header */}
            <tr className="border-b border-border/70 bg-paper-deep/40">
              <th className={`sticky left-0 z-20 ${stickyBgHeader} px-2 py-2 font-serif text-xs text-ink-faint border-r border-border/40 tabular-nums`} style={{ width: IDX_W }}>
                #
              </th>
              <th className="px-1 py-2" style={{ width: 0 }} />
              {DATA_COLUMNS.map((col) => {
                const isTitle = col.key === "title";
                return (
                  <th
                    key={col.key}
                    className={`${col.width} px-2 py-2 font-serif text-xs uppercase tracking-wider text-ink-faint border-l border-border/20 whitespace-nowrap ${isTitle ? `sticky z-10 ${stickyBgHeader} border-r border-border/30` : ""}`}
                    style={isTitle ? { left: IDX_W } : undefined}
                  >
                    {col.label}
                  </th>
                );
              })}
              {/* Sticky right: preview + delete headers */}
              <th className={`sticky right-0 z-20 ${stickyBgHeader} px-1 py-2 font-serif text-xs text-ink-faint border-l border-border/40`} style={{ width: ACT_W }}>
                <ExternalLink className="h-3 w-3 inline-block" />
              </th>
              <th className={`sticky z-20 ${stickyBgHeader} px-1 py-2 font-serif text-xs text-ink-faint border-l border-border/40`} style={{ width: ACT_W, right: ACT_W }}>
                <Trash2 className="h-3 w-3 inline-block" />
              </th>
            </tr>
          </thead>

          <tbody>
            {recordings.map((rec, idx) => {
              const isDeleting = deleting === rec.id;
              return (
                <tr
                  key={rec.id}
                  className={`border-b border-border/40 hover:bg-paper-deep/30 transition-colors ${isDeleting ? "opacity-50" : ""}`}
                >
                  {/* Sticky #: num */}
                  <td className={`sticky left-0 z-10 ${stickyBg} px-2 py-1.5 font-serif text-xs text-ink-faint border-r border-border/40 tabular-nums`} style={{ width: IDX_W }}>
                    {rec.num}
                  </td>

                  {/* Audio player (non-sticky, scrolls with content) */}
                  <td className="px-1 py-1 border-l border-border/15">
                    <InlineAudioPlayer src={audioUrl(rec.audio_path)} sizeBytes={rec.audio_path ? 1 : 0} />
                  </td>

                  {/* Data cells */}
                  {DATA_COLUMNS.map((col) => {
                    const isEditing = editing?.rowId === rec.id && editing?.col === col.key;
                    const key = ck(rec.id, col.key);
                    const status = statuses[key] || "idle";
                    const value = displayValue(rec, col.key);
                    const isEditable = col.editable;
                    const isTitle = col.key === "title";

                    return (
                      <td
                        key={col.key}
                        className={`${col.width} px-1 py-1 border-l border-border/15 ${isTitle ? `sticky z-10 ${stickyBg} border-r border-border/30 font-medium` : ""}`}
                        style={isTitle ? { left: IDX_W } : undefined}
                      >
                        {isEditing && isEditable && col.key === "people" ? (
                          <ClassmateTagSelector
                            value={editClassmateIds}
                            allClassmates={classmates}
                            allTeachers={teachers}
                            onChange={setEditClassmateIds}
                            onFinish={() => {
                              const rec = recordings.find((r) => r.id === editing?.rowId);
                              if (rec) {
                                const origIds = rec.people ?? [];
                                const newIds = editClassmateIds;
                                if (JSON.stringify(origIds) !== JSON.stringify(newIds)) {
                                  savePeople(rec, newIds);
                                }
                              }
                              setEditing(null);
                            }}
                          />
                        ) : isEditing && isEditable ? (
                          <Input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={onKey}
                            type={col.type === "date" ? "date" : col.type === "time" ? "text" : "text"}
                            className="h-7 px-2 font-serif text-xs bg-paper border-forest/50"
                            placeholder={col.type === "time" ? "HH:MM:SS" : undefined}
                          />
                        ) : (
                          <div
                            onClick={() => isEditable && startEdit(rec, col)}
                            className={`px-2 py-1 rounded text-xs font-serif min-h-[28px] flex items-center transition-colors truncate ${
                              isEditable
                                ? "cursor-pointer text-ink-soft hover:bg-paper-deep/60"
                                : "text-ink-faint cursor-default"
                            } ${isTitle ? "font-medium text-ink" : ""}`}
                            title={isEditable ? "点击编辑" : value}
                          >
                            {status === "saving" && <Loader2 className="h-3 w-3 animate-spin text-forest mr-1 shrink-0" />}
                            {status === "saved" && <CheckCircle className="h-3 w-3 text-forest mr-1 shrink-0" />}
                            {status === "error" && <AlertCircle className="h-3 w-3 text-red-500 mr-1 shrink-0" />}
                            <span className={`truncate ${status === "saving" ? "text-ink-faint" : ""}`}>
                              {value || <span className="text-ink-faint/50 italic">—</span>}
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Sticky right: preview + delete (combined to match header) */}
                  <td className={`sticky right-0 z-10 ${stickyBg} px-1 py-1 border-l border-border/30 text-center`} style={{ width: ACT_W * 2 }}>
                    <div className="flex items-center justify-center gap-0.5">
                      <Link
                        href={`/echoes/${rec.num}`}
                        target="_blank"
                        className="inline-flex items-center justify-center h-7 w-7 rounded text-ink-faint hover:text-forest hover:bg-forest/10 transition-colors"
                        title="预览公开页"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(rec)}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center h-7 w-7 rounded text-ink-faint hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="删除"
                      >
                        {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
