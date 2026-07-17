"use client";

import { useState, useMemo } from "react";
import { Users, FolderOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassmateCard } from "@/components/features/ClassmateCard";
import type { Classmate } from "@/lib/db/types";

interface Group {
  name: string;
  classmates: Classmate[];
}

interface Props {
  classmates: Classmate[];
  avatarUrls: Record<string, string | null>;
  totalCount: number;
}

/** Cities pinned to the top of the group list for prominence. */
const PINNED_CITIES = ["北京", "上海", "杭州", "合肥", "南京", "深圳"];

export function ForestClient({
  classmates,
  avatarUrls,
  totalCount,
}: Props) {
  const [groupBy, setGroupBy] = useState<"none" | "city" | "industry">("city");

  const groups = useMemo<Group[]>(() => {
    if (groupBy === "none") return [];

    const map = new Map<string, Classmate[]>();
    for (const c of classmates) {
      const key =
        (groupBy === "city" ? c.city : c.industry) || "未知";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => {
        // "未知" always last
        if (a === "未知") return 1;
        if (b === "未知") return -1;

        // When grouping by city, honour the pinned-city order
        if (groupBy === "city") {
          const ai = PINNED_CITIES.indexOf(a);
          const bi = PINNED_CITIES.indexOf(b);
          if (ai !== -1 && bi !== -1) return ai - bi;
          if (ai !== -1) return -1;
          if (bi !== -1) return 1;
        }

        return a.localeCompare(b, "zh-CN");
      })
      .map(([name, members]) => ({ name, classmates: members }));
  }, [classmates, groupBy]);

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 rounded-md border border-border bg-paper-soft px-3 py-1.5 font-serif text-sm text-ink-soft">
          <Users className="h-4 w-4 text-forest" />
          共{" "}
          <span className="text-forest font-medium">{totalCount}</span> 位
        </div>

        <Select
          value={groupBy}
          onValueChange={(v) =>
            setGroupBy(v as "none" | "city" | "industry")
          }
        >
          <SelectTrigger className="w-[140px] font-serif text-sm bg-paper-soft border-border">
            <FolderOpen className="h-3.5 w-3.5 text-forest mr-1.5" />
            <SelectValue placeholder="分组方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">不分组</SelectItem>
            <SelectItem value="city">按城市分组</SelectItem>
            <SelectItem value="industry">按行业分组</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {groupBy === "none" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {classmates.map((c) => (
            <ClassmateCard
              key={c.id}
              classmate={c}
              avatarUrl={avatarUrls[c.id] ?? null}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.name}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="display-heading text-xl text-ink">
                  {group.name}
                </h2>
                <span className="font-serif text-xs text-ink-faint">
                  {group.classmates.length} 位同学
                </span>
                <div className="flex-1 border-b border-border/40" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {group.classmates.map((c) => (
                  <ClassmateCard
                    key={c.id}
                    classmate={c}
                    avatarUrl={avatarUrls[c.id] ?? null}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
