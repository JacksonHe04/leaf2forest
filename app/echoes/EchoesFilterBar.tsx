"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * EchoesFilterBar — a slim, paper-styled filter row for the archive.
 *
 * Supports: text search, date-from, date-to. All filters are URL-driven.
 * Each change updates the URL via a transition so the page re-renders
 * server-side.
 *
 * Implementation: the outer component reads the URL and passes the
 * current values as the `key` to the inner <FilterBarCore>, which
 * remounts whenever the URL changes. That gives us clean local state
 * (input values) without an effect that syncs state — satisfying
 * React 19's strict lint rules.
 */
export function EchoesFilterBar({
  total,
  playableCount,
}: {
  total: number;
  playableCount: number;
}) {
  const sp = useSearchParams();
  // Build a stable key so the inner form remounts when any param changes.
  const key = `q=${sp.get("q") ?? ""}|from=${sp.get("from") ?? ""}|to=${
    sp.get("to") ?? ""
  }`;

  return (
    <FilterBarCore
      key={key}
      initialQ={sp.get("q") ?? ""}
      initialFrom={sp.get("from") ?? ""}
      initialTo={sp.get("to") ?? ""}
      total={total}
      playableCount={playableCount}
    />
  );
}

function FilterBarCore({
  initialQ,
  initialFrom,
  initialTo,
  total,
  playableCount,
}: {
  initialQ: string;
  initialFrom: string;
  initialTo: string;
  total: number;
  playableCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(initialQ);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  function commit(nextQ: string, nextFrom: string, nextTo: string) {
    const params = new URLSearchParams();
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextFrom) params.set("from", nextFrom);
    if (nextTo) params.set("to", nextTo);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/echoes?${qs}` : `/echoes`);
    });
  }

  function clearAll() {
    setQ("");
    setFrom("");
    setTo("");
    commit("", "", "");
  }

  const hasFilter = Boolean(q || from || to);

  return (
    <div className="surface-paper rounded-md p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit(q, from, to);
            }}
            placeholder="搜索标题、描述、地点…"
            className={cn(
              "w-full rounded-md border border-border bg-paper px-9 py-2 font-serif text-sm text-ink",
              "placeholder:text-ink-faint/70",
              "focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/15"
            )}
          />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <DateInput
            label="起"
            value={from}
            onChange={(v) => {
              setFrom(v);
              commit(q, v, to);
            }}
          />
          <span className="font-serif text-sm text-ink-faint">—</span>
          <DateInput
            label="止"
            value={to}
            onChange={(v) => {
              setTo(v);
              commit(q, from, v);
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => commit(q, from, to)}
            disabled={isPending}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md bg-forest px-3.5 py-2 font-serif text-sm text-paper-soft",
              "hover:bg-forest-deep transition-colors",
              "disabled:opacity-50"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            {isPending ? "筛选中…" : "筛选"}
          </button>
          {hasFilter && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-paper px-3 py-2 font-serif text-sm text-ink-soft hover:text-forest hover:border-forest/40 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              清除
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between font-serif text-xs text-ink-faint">
        <span>
          {isPending
            ? "正在更新结果…"
            : `共 ${total} 段录音 · ${playableCount} 段可播放`}
        </span>
        {hasFilter && <span>已应用筛选条件</span>}
      </div>
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-1.5 rounded-md border border-border bg-paper px-2.5 py-1.5">
      <span className="font-serif text-xs text-ink-faint">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent font-serif text-sm text-ink focus:outline-none"
      />
    </label>
  );
}
