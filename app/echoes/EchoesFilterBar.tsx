"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * EchoesFilterBar — search-only filter bar for the echoes archive.
 *
 * Search is real-time: the current query is passed up via onSearch
 * so the parent can filter recordings client-side instantly.
 */
export function EchoesFilterBar({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (q: string) => void;
}) {
  return (
    <div className="surface-paper rounded-md p-4 sm:p-5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="搜索标题、描述、地点…"
          className={cn(
            "w-full rounded-md border border-border bg-paper px-9 py-2 font-serif text-sm text-ink",
            "placeholder:text-ink-faint/70",
            "focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/15"
          )}
        />
      </div>
    </div>
  );
}
