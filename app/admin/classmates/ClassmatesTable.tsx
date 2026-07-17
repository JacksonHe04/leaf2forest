"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Classmate } from "@/lib/db/types";

/* ── Column definitions ── */

interface ColDef {
  key: string;
  label: string;
  width: string;
  type?: "text" | "date" | "select";
  options?: { value: string; label: string }[];
  group?: string;
}

const COLUMNS: ColDef[] = [
  { key: "name", label: "姓名", width: "w-28", type: "text", group: "基本" },
  {
    key: "gender",
    label: "性别",
    width: "w-20",
    type: "select",
    options: [
      { value: "", label: "—" },
      { value: "male", label: "男" },
      { value: "female", label: "女" },
      { value: "other", label: "其他" },
    ],
    group: "基本",
  },
  { key: "birth_date", label: "出生日期", width: "w-32", type: "date", group: "基本" },
  { key: "city", label: "城市", width: "w-24", type: "text", group: "基本" },
  { key: "phone", label: "电话", width: "w-28", type: "text", group: "联系" },
  { key: "qq", label: "QQ", width: "w-24", type: "text", group: "联系" },
  { key: "wechat", label: "微信", width: "w-28", type: "text", group: "联系" },
  { key: "employer", label: "工作单位", width: "w-32", type: "text", group: "工作" },
  { key: "industry", label: "行业", width: "w-24", type: "text", group: "工作" },
  { key: "bachelor_university", label: "本科院校", width: "w-32", type: "text", group: "教育" },
  { key: "bachelor_major", label: "本科专业", width: "w-28", type: "text", group: "教育" },
  { key: "master_university", label: "硕士院校", width: "w-32", type: "text", group: "教育" },
  { key: "master_major", label: "硕士专业", width: "w-28", type: "text", group: "教育" },
  { key: "doctor_university", label: "博士院校", width: "w-32", type: "text", group: "教育" },
  { key: "doctor_major", label: "博士专业", width: "w-28", type: "text", group: "教育" },
  { key: "bio", label: "简介", width: "w-48", type: "text", group: "其他" },
];

/* ── Sticky column pixel widths (must match Tailwind classes) ── */
const IDX_W = 40;   // # column
const NAME_W = 112;  // name column (w-28)
const ACT_W = 44;    // each action column

/* ── Cell status tracking ── */
type CellStatus = "idle" | "saving" | "saved" | "error";

function cellKey(rowId: string, colKey: string): string {
  return `${rowId}:${colKey}`;
}

/* ── Main component ── */

interface Props {
  initialClassmates: Classmate[];
}

export function ClassmatesTable({ initialClassmates }: Props) {
  const [classmates, setClassmates] = useState(initialClassmates);
  const [editing, setEditing] = useState<{ rowId: string; colKey: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [cellStatuses, setCellStatuses] = useState<Record<string, CellStatus>>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const getCellValue = useCallback(
    (classmate: Classmate, key: string): string => {
      const val = (classmate as unknown as Record<string, unknown>)[key];
      if (val === null || val === undefined) return "";
      return String(val);
    },
    []
  );

  async function saveCell(classmate: Classmate, colKey: string, value: string) {
    const ck = cellKey(classmate.id, colKey);
    setCellStatuses((prev) => ({ ...prev, [ck]: "saving" }));
    try {
      const payload: Record<string, string | null> = {};
      payload[colKey] = value === "" ? null : value;
      const res = await fetch(`/api/classmates/${classmate.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status !== "success") throw new Error("保存失败");
      setClassmates((prev) =>
        prev.map((c) => (c.id === classmate.id ? { ...c, [colKey]: value || null } : c))
      );
      setCellStatuses((prev) => ({ ...prev, [ck]: "saved" }));
      setTimeout(() => setCellStatuses((prev) => { const n = { ...prev }; delete n[ck]; return n; }), 2000);
    } catch {
      setCellStatuses((prev) => ({ ...prev, [ck]: "error" }));
      setTimeout(() => setCellStatuses((prev) => { const n = { ...prev }; delete n[ck]; return n; }), 3000);
    }
  }

  async function handleDelete(classmate: Classmate) {
    if (!confirm(`确定要删除同学「${classmate.name}」吗？此操作不可撤销。`)) return;
    setDeleting(classmate.id);
    try {
      const res = await fetch(`/api/classmates/${classmate.user_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      setClassmates((prev) => prev.filter((c) => c.id !== classmate.id));
    } catch {
      alert("删除失败，请重试");
    } finally {
      setDeleting(null);
    }
  }

  function startEditing(classmate: Classmate, col: ColDef) {
    setEditing({ rowId: classmate.id, colKey: col.key });
    setEditValue(getCellValue(classmate, col.key));
  }

  function commitEdit() {
    if (!editing) return;
    const c = classmates.find((c) => c.id === editing.rowId);
    const col = COLUMNS.find((col) => col.key === editing.colKey);
    if (!c || !col) return;
    const oldValue = getCellValue(c, col.key);
    if (editValue !== oldValue) saveCell(c, col.key, editValue);
    setEditing(null);
  }

  function cancelEdit() {
    setEditing(null);
    setEditValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
    if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
  }

  const groups = Array.from(new Set(COLUMNS.map((c) => c.group)));

  /* ── Shared sticky bg classes ── */
  const stickyBg = "bg-paper/95 backdrop-blur-sm";
  const stickyBgHeader = "bg-paper-deep/95 backdrop-blur-sm";

  return (
    <div className="surface-paper rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border/70 bg-paper-deep/40 px-5 py-3">
        <span className="font-serif text-sm text-ink-soft">
          共 {classmates.length} 位同学 · 点击单元格即可编辑，失焦自动保存
        </span>
        <Button asChild size="sm" className="font-serif bg-forest hover:bg-forest-deep h-7 text-xs">
          <Link href="/admin/classmates/new">
            <Plus className="h-3 w-3" />
            新增同学
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-max min-w-full">
          {/* Group header */}
          <thead>
            <tr className="border-b border-border/50 bg-paper-deep/60">
              <th className={`sticky left-0 z-20 ${stickyBgHeader} px-3 py-1.5 font-serif text-xs text-ink-faint border-r border-border/40`} style={{ width: IDX_W }}>
                #
              </th>
              {groups.map((group, gi) => {
                const cols = COLUMNS.filter((c) => c.group === group);
                const isNameGroup = group === "基本";
                return (
                  <th
                    key={group}
                    colSpan={cols.length}
                    className={`px-2 py-1.5 font-serif text-xs uppercase tracking-wider text-forest/70 border-l border-border/30 text-center ${isNameGroup && gi === 0 ? "" : ""}`}
                  >
                    {group}
                  </th>
                );
              })}
              <th className={`sticky right-0 z-20 ${stickyBgHeader} px-1 py-1.5 font-serif text-xs text-ink-faint border-l border-border/40 text-center`} style={{ width: ACT_W * 2 }}>
                操作
              </th>
            </tr>
            {/* Column header */}
            <tr className="border-b border-border/70 bg-paper-deep/40">
              <th className={`sticky left-0 z-20 ${stickyBgHeader} px-3 py-2 font-serif text-xs text-ink-faint border-r border-border/40`} style={{ width: IDX_W }}>
                #
              </th>
              {COLUMNS.map((col, ci) => {
                const isName = col.key === "name";
                return (
                  <th
                    key={col.key}
                    className={`${col.width} px-2 py-2 font-serif text-xs uppercase tracking-wider text-ink-faint border-l border-border/20 whitespace-nowrap ${isName ? `sticky z-10 ${stickyBgHeader} border-r border-border/30` : ""}`}
                    style={isName ? { left: IDX_W } : undefined}
                  >
                    {col.label}
                  </th>
                );
              })}
              {/* Sticky right: preview + delete */}
              <th className={`sticky right-0 z-20 ${stickyBgHeader} px-1 py-2 font-serif text-xs text-ink-faint border-l border-border/40`} style={{ width: ACT_W }}>
                <ExternalLink className="h-3 w-3 inline-block" />
              </th>
              <th className={`sticky right-[${ACT_W}px] z-20 ${stickyBgHeader} px-1 py-2 font-serif text-xs text-ink-faint border-l border-border/40`} style={{ width: ACT_W, right: ACT_W }}>
                <Trash2 className="h-3 w-3 inline-block" />
              </th>
            </tr>
          </thead>

          <tbody>
            {classmates.map((classmate, idx) => {
              const isDeleting = deleting === classmate.id;
              return (
                <tr
                  key={classmate.id}
                  className={`border-b border-border/40 hover:bg-paper-deep/30 transition-colors ${isDeleting ? "opacity-50" : ""}`}
                >
                  {/* Sticky #: idx */}
                  <td className={`sticky left-0 z-10 ${stickyBg} px-3 py-1.5 font-serif text-xs text-ink-faint border-r border-border/40 tabular-nums`} style={{ width: IDX_W }}>
                    {idx + 1}
                  </td>

                  {/* Data cells */}
                  {COLUMNS.map((col) => {
                    const isEditing = editing?.rowId === classmate.id && editing?.colKey === col.key;
                    const ck = cellKey(classmate.id, col.key);
                    const status = cellStatuses[ck] || "idle";
                    const value = getCellValue(classmate, col.key);
                    const isName = col.key === "name";

                    return (
                      <td
                        key={col.key}
                        className={`${col.width} px-1 py-1 border-l border-border/15 ${isName ? `sticky z-10 ${stickyBg} border-r border-border/30 font-medium` : ""}`}
                        style={isName ? { left: IDX_W } : undefined}
                      >
                        {isEditing ? (
                          <div className="relative">
                            {col.type === "select" && col.options ? (
                              <Select
                                value={editValue || "none"}
                                onValueChange={(v) => setEditValue(v === "none" ? "" : v)}
                                onOpenChange={(open) => { if (!open) setTimeout(() => commitEdit(), 50); }}
                              >
                                <SelectTrigger className="h-7 px-2 font-serif text-xs bg-paper border-forest/50">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {col.options.map((opt) => (
                                    <SelectItem key={opt.value || "none"} value={opt.value || "none"}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                ref={inputRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={handleKeyDown}
                                type={col.type === "date" ? "date" : "text"}
                                className="h-7 px-2 font-serif text-xs bg-paper border-forest/50"
                              />
                            )}
                          </div>
                        ) : (
                          <div
                            onClick={() => startEditing(classmate, col)}
                            className={`cursor-pointer px-2 py-1 rounded text-xs font-serif min-h-[28px] flex items-center transition-colors ${
                              isName ? "text-ink" : "text-ink-soft"
                            } hover:bg-paper-deep/60`}
                            title="点击编辑"
                          >
                            {status === "saving" && <Loader2 className="h-3 w-3 animate-spin text-forest mr-1 shrink-0" />}
                            {status === "saved" && <CheckCircle className="h-3 w-3 text-forest mr-1 shrink-0" />}
                            {status === "error" && <AlertCircle className="h-3 w-3 text-red-500 mr-1 shrink-0" />}
                            <span className={status === "saving" ? "text-ink-faint" : ""}>
                              {value || <span className="text-ink-faint/50 italic">—</span>}
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Sticky right: preview */}
                  <td className={`sticky right-0 z-10 ${stickyBg} px-1 py-1 border-l border-border/30 text-center`} style={{ width: ACT_W }}>
                    <Link
                      href={`/forest/${classmate.user_id}`}
                      target="_blank"
                      className="inline-flex items-center justify-center h-7 w-7 rounded text-ink-faint hover:text-forest hover:bg-forest/10 transition-colors"
                      title="预览公开页"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </td>

                  {/* Sticky right: delete */}
                  <td className={`sticky z-10 ${stickyBg} px-1 py-1 border-l border-border/30 text-center`} style={{ width: ACT_W, right: ACT_W }}>
                    <button
                      type="button"
                      onClick={() => handleDelete(classmate)}
                      disabled={isDeleting}
                      className="inline-flex items-center justify-center h-7 w-7 rounded text-ink-faint hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="删除"
                    >
                      {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
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
