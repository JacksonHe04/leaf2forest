"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
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
  {
    key: "birth_date",
    label: "出生日期",
    width: "w-32",
    type: "date",
    group: "基本",
  },
  { key: "city", label: "城市", width: "w-24", type: "text", group: "基本" },
  { key: "phone", label: "电话", width: "w-28", type: "text", group: "联系" },
  { key: "qq", label: "QQ", width: "w-24", type: "text", group: "联系" },
  {
    key: "wechat",
    label: "微信",
    width: "w-28",
    type: "text",
    group: "联系",
  },
  {
    key: "employer",
    label: "工作单位",
    width: "w-32",
    type: "text",
    group: "工作",
  },
  {
    key: "industry",
    label: "行业",
    width: "w-24",
    type: "text",
    group: "工作",
  },
  {
    key: "bachelor_university",
    label: "本科院校",
    width: "w-32",
    type: "text",
    group: "教育",
  },
  {
    key: "bachelor_major",
    label: "本科专业",
    width: "w-28",
    type: "text",
    group: "教育",
  },
  {
    key: "master_university",
    label: "硕士院校",
    width: "w-32",
    type: "text",
    group: "教育",
  },
  {
    key: "master_major",
    label: "硕士专业",
    width: "w-28",
    type: "text",
    group: "教育",
  },
  {
    key: "doctor_university",
    label: "博士院校",
    width: "w-32",
    type: "text",
    group: "教育",
  },
  {
    key: "doctor_major",
    label: "博士专业",
    width: "w-28",
    type: "text",
    group: "教育",
  },
  {
    key: "bio",
    label: "简介",
    width: "w-48",
    type: "text",
    group: "其他",
  },
];

/* ── Cell status tracking ── */
type CellStatus = "idle" | "saving" | "saved" | "error";

interface CellKey {
  rowId: string;
  colKey: string;
}

function cellKey(rowId: string, colKey: string): string {
  return `${rowId}:${colKey}`;
}

/* ── Main component ── */

interface Props {
  initialClassmates: Classmate[];
}

export function ClassmatesTable({ initialClassmates }: Props) {
  const [classmates, setClassmates] = useState(initialClassmates);
  const [editing, setEditing] = useState<CellKey | null>(null);
  const [editValue, setEditValue] = useState("");
  const [cellStatuses, setCellStatuses] = useState<
    Record<string, CellStatus>
  >({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
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

  async function saveCell(
    classmate: Classmate,
    colKey: string,
    value: string
  ) {
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

      // Update local state
      setClassmates((prev) =>
        prev.map((c) =>
          c.id === classmate.id ? { ...c, [colKey]: value || null } : c
        )
      );
      setCellStatuses((prev) => ({ ...prev, [ck]: "saved" }));

      // Clear "saved" status after 2s
      setTimeout(() => {
        setCellStatuses((prev) => {
          const next = { ...prev };
          delete next[ck];
          return next;
        });
      }, 2000);
    } catch {
      setCellStatuses((prev) => ({ ...prev, [ck]: "error" }));
      setTimeout(() => {
        setCellStatuses((prev) => {
          const next = { ...prev };
          delete next[ck];
          return next;
        });
      }, 3000);
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
    if (editValue !== oldValue) {
      saveCell(c, col.key, editValue);
    }
    setEditing(null);
  }

  function cancelEdit() {
    setEditing(null);
    setEditValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  }

  // Group columns for header rendering
  const groups = Array.from(new Set(COLUMNS.map((c) => c.group)));

  return (
    <div className="surface-paper rounded-md overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/70 bg-paper-deep/40 px-5 py-3">
        <span className="font-serif text-sm text-ink-soft">
          共 {classmates.length} 位同学 · 点击单元格即可编辑，失焦自动保存
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-max min-w-full">
          {/* Group header row */}
          <thead>
            <tr className="border-b border-border/50 bg-paper-deep/60">
              <th
                className="sticky left-0 z-10 bg-paper-deep/90 backdrop-blur-sm px-3 py-1.5 font-serif text-xs text-ink-faint border-r border-border/40"
                colSpan={1}
              >
                #
              </th>
              {groups.map((group) => {
                const cols = COLUMNS.filter((c) => c.group === group);
                return (
                  <th
                    key={group}
                    colSpan={cols.length}
                    className="px-2 py-1.5 font-serif text-xs uppercase tracking-wider text-forest/70 border-l border-border/30 text-center"
                  >
                    {group}
                  </th>
                );
              })}
            </tr>
            {/* Column header row */}
            <tr className="border-b border-border/70 bg-paper-deep/40">
              <th className="sticky left-0 z-10 bg-paper-deep/90 backdrop-blur-sm px-3 py-2 font-serif text-xs text-ink-faint border-r border-border/40 w-10">
                #
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`${col.width} px-2 py-2 font-serif text-xs uppercase tracking-wider text-ink-faint border-l border-border/20 whitespace-nowrap`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {classmates.map((classmate, idx) => (
              <tr
                key={classmate.id}
                className="border-b border-border/40 hover:bg-paper-deep/30 transition-colors"
              >
                {/* Row number — sticky */}
                <td className="sticky left-0 z-10 bg-paper/90 backdrop-blur-sm px-3 py-1.5 font-serif text-xs text-ink-faint border-r border-border/40">
                  {idx + 1}
                </td>

                {/* Data cells */}
                {COLUMNS.map((col) => {
                  const isEditing =
                    editing?.rowId === classmate.id &&
                    editing?.colKey === col.key;
                  const ck = cellKey(classmate.id, col.key);
                  const status = cellStatuses[ck] || "idle";
                  const value = getCellValue(classmate, col.key);

                  return (
                    <td
                      key={col.key}
                      className={`${col.width} px-1 py-1 border-l border-border/15`}
                    >
                      {isEditing ? (
                        <div className="relative">
                          {col.type === "select" && col.options ? (
                            <Select
                              value={editValue || "none"}
                              onValueChange={(v) => {
                                setEditValue(v === "none" ? "" : v);
                              }}
                              onOpenChange={(open) => {
                                if (!open) {
                                  // Commit on close
                                  setTimeout(() => commitEdit(), 50);
                                }
                              }}
                            >
                              <SelectTrigger className="h-7 px-2 font-serif text-xs bg-paper border-forest/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {col.options.map((opt) => (
                                  <SelectItem
                                    key={opt.value || "none"}
                                    value={opt.value || "none"}
                                  >
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
                            col.key === "name"
                              ? "text-ink font-medium"
                              : "text-ink-soft"
                          } hover:bg-paper-deep/60`}
                          title="点击编辑"
                        >
                          {status === "saving" && (
                            <Loader2 className="h-3 w-3 animate-spin text-forest mr-1 shrink-0" />
                          )}
                          {status === "saved" && (
                            <CheckCircle className="h-3 w-3 text-forest mr-1 shrink-0" />
                          )}
                          {status === "error" && (
                            <AlertCircle className="h-3 w-3 text-red-500 mr-1 shrink-0" />
                          )}
                          <span
                            className={
                              status === "saving" ? "text-ink-faint" : ""
                            }
                          >
                            {value || (
                              <span className="text-ink-faint/50 italic">
                                —
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
