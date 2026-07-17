"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import type { Classmate } from "@/lib/db/types";
import { cn } from "@/lib/utils";

interface Props {
  /** Currently selected classmate UUIDs */
  value: string[];
  /** Full list of classmates (pre-loaded) */
  allClassmates: Classmate[];
  /** Called when selection changes */
  onChange: (ids: string[]) => void;
  /** Called when user wants to commit (blur/enter on empty) */
  onFinish?: () => void;
}

/**
 * ClassmateTagSelector — search + tag multi-select for classmates.
 *
 * Shows selected classmates as removable tags. Typing in the input
 * filters the dropdown by name match. Arrow keys navigate, Enter
 * selects, Backspace on empty removes the last tag.
 */
export function ClassmateTagSelector({
  value,
  allClassmates,
  onChange,
  onFinish,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build ID→name map once
  const idMap = useMemo(
    () => new Map(allClassmates.map((c) => [c.id, c])),
    [allClassmates]
  );

  // Filter candidates: exclude already-selected, match query
  const candidates = useMemo(() => {
    const selected = new Set(value);
    const q = query.trim().toLowerCase();
    const filtered = q
      ? allClassmates.filter((c) => c.name.toLowerCase().includes(q))
      : allClassmates;
    return filtered.filter((c) => !selected.has(c.id));
  }, [allClassmates, value, query]);

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

  const selectedClassmates = value.map((id) => idMap.get(id)).filter(Boolean) as Classmate[];

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
        {selectedClassmates.map((c) => (
          <span
            key={c.id}
            className="inline-flex items-center gap-0.5 rounded bg-forest/10 px-1.5 py-0.5 font-serif text-[11px] text-forest whitespace-nowrap"
          >
            {c.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeId(c.id);
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
          placeholder={selectedClassmates.length > 0 ? "继续添加…" : "搜索同学…"}
        />
      </div>

      {/* Dropdown */}
      {open && candidates.length > 0 && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded border border-border bg-paper shadow-lg"
        >
          {candidates.map((c, i) => (
            <div
              key={c.id}
              onMouseDown={(e) => {
                e.preventDefault();
                addId(c.id);
              }}
              onMouseEnter={() => setActiveIdx(i)}
              className={cn(
                "px-3 py-1.5 font-serif text-xs cursor-pointer transition-colors",
                i === activeIdx
                  ? "bg-forest/10 text-forest"
                  : "text-ink-soft hover:bg-paper-deep/60"
              )}
            >
              {c.name}
              {c.city && (
                <span className="ml-2 text-ink-faint/60 text-[10px]">{c.city}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
