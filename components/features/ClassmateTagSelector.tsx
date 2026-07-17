"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import type { Classmate, Teacher } from "@/lib/db/types";
import { usePeopleData } from "@/components/providers/PeopleDataContext";
import { cn } from "@/lib/utils";

/** Unified item for display in the selector. */
interface SelectorItem {
  id: string;
  name: string;
  kind: "classmate" | "teacher";
  city?: string | null;
  subject?: string;
}

interface Props {
  /** Currently selected UUIDs (classmates + teachers) */
  value: string[];
  /** Called when selection changes */
  onChange: (ids: string[]) => void;
  /** Called when user wants to commit (blur/enter on empty) */
  onFinish?: () => void;
  /**
   * Explicit data props for backward compatibility (admin tables
   * pass data from server). When omitted, the component reads from
   * the global PeopleDataContext and auto-triggers loading.
   */
  allClassmates?: Classmate[];
  allTeachers?: Teacher[];
}

/**
 * ClassmateTagSelector — search + tag multi-select for classmates and teachers.
 *
 * Shows selected people as removable tags. Typing in the input
 * filters the dropdown by name match. Arrow keys navigate, Enter
 * selects, Backspace on empty removes the last tag.
 *
 * Can work in two modes:
 * 1. With explicit props (allClassmates + allTeachers) — used by admin tables
 * 2. Without props — reads from global PeopleDataContext, auto-triggers load
 */
export function ClassmateTagSelector({
  value,
  onChange,
  onFinish,
  allClassmates: explicitClassmates,
  allTeachers: explicitTeachers,
}: Props) {
  const ctx = usePeopleData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resolve data source: explicit props or context
  const rawClassmates = explicitClassmates ?? ctx.classmates;
  const rawTeachers = explicitTeachers ?? ctx.teachers;
  const isLoading = !explicitClassmates && ctx.loading;

  // Auto-trigger load when using context
  useEffect(() => {
    if (!explicitClassmates) {
      ctx.load();
    }
  }, [explicitClassmates, ctx.load]);

  // Merge classmates + teachers into a unified list
  const allItems = useMemo<SelectorItem[]>(() => {
    const classmates: SelectorItem[] = rawClassmates.map((c) => ({
      id: c.id,
      name: c.name,
      kind: "classmate" as const,
      city: c.city,
    }));
    const teachers: SelectorItem[] = rawTeachers.map((t) => ({
      id: t.id,
      name: t.name,
      kind: "teacher" as const,
      subject: t.subject,
    }));
    return [...classmates, ...teachers];
  }, [rawClassmates, rawTeachers]);

  // Build ID→item map once
  const idMap = useMemo(
    () => new Map(allItems.map((c) => [c.id, c])),
    [allItems]
  );

  // Filter candidates: exclude already-selected, match query
  const candidates = useMemo(() => {
    const selected = new Set(value);
    const q = query.trim().toLowerCase();
    const filtered = q
      ? allItems.filter((c) => c.name.toLowerCase().includes(q))
      : allItems;
    return filtered.filter((c) => !selected.has(c.id));
  }, [allItems, value, query]);

  // Reset active index when candidates change
  useEffect(() => {
    setActiveIdx(0);
  }, [candidates.length]);

  // Scroll active item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[activeIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  // Close on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        onFinish?.();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onFinish]);

  const addId = useCallback(
    (id: string) => {
      onChange([...value, id]);
      setQuery("");
      inputRef.current?.focus();
    },
    [value, onChange]
  );

  const removeId = useCallback(
    (id: string) => {
      onChange(value.filter((v) => v !== id));
    },
    [value, onChange]
  );

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.min(i + 1, candidates.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (candidates[activeIdx]) {
        addId(candidates[activeIdx].id);
      } else if (!query.trim()) {
        onFinish?.();
      }
    } else if (e.key === "Backspace" && !query && value.length > 0) {
      removeId(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setOpen(false);
      onFinish?.();
    }
  }

  const selectedItems = value.map((id) => idMap.get(id)).filter(Boolean) as SelectorItem[];

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex flex-wrap items-center gap-1 rounded border border-forest/50 bg-paper px-2 py-1.5 min-h-[32px]",
          open && "ring-2 ring-forest/15"
        )}
        onClick={() => {
          inputRef.current?.focus();
          setOpen(true);
        }}
      >
        {/* Selected tags */}
        {selectedItems.map((item) => (
          <span
            key={item.id}
            className={cn(
              "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-serif text-[11px] whitespace-nowrap",
              item.kind === "teacher"
                ? "bg-gold/10 text-gold"
                : "bg-forest/10 text-forest"
            )}
          >
            {item.name}
            {item.kind === "teacher" && item.subject && (
              <span className="text-[10px] opacity-60">{item.subject}</span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeId(item.id);
              }}
              className="ml-0.5 hover:text-red-500 transition-colors"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}

        {/* Search input */}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          className="flex-1 min-w-[60px] bg-transparent font-serif text-xs text-ink outline-none placeholder:text-ink-faint/60"
          placeholder={
            isLoading
              ? "加载中…"
              : selectedItems.length > 0
              ? "继续添加…"
              : "搜索同学或老师…"
          }
          disabled={isLoading}
        />

        {isLoading && (
          <Loader2 className="h-3 w-3 animate-spin text-ink-faint shrink-0" />
        )}
      </div>

      {/* Dropdown */}
      {open && candidates.length > 0 && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded border border-border bg-paper shadow-lg"
        >
          {candidates.map((item, i) => (
            <div
              key={item.id}
              onMouseDown={(e) => {
                e.preventDefault();
                addId(item.id);
              }}
              onMouseEnter={() => setActiveIdx(i)}
              className={cn(
                "px-3 py-1.5 font-serif text-xs cursor-pointer transition-colors flex items-center gap-2",
                i === activeIdx
                  ? "bg-forest/10 text-forest"
                  : "text-ink-soft hover:bg-paper-deep/60"
              )}
            >
              <span>{item.name}</span>
              {item.kind === "teacher" && item.subject && (
                <span className="text-ink-faint/60 text-[10px]">老师 · {item.subject}</span>
              )}
              {item.kind === "classmate" && item.city && (
                <span className="text-ink-faint/60 text-[10px]">{item.city}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
