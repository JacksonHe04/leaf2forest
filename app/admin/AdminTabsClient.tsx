"use client";

import { useState } from "react";
import { Users, Mic } from "lucide-react";
import type { Classmate, Recording } from "@/lib/db/types";
import { ClassmatesTable } from "./classmates/ClassmatesTable";
import { RecordingsTable } from "./RecordingsTable";

type Tab = "classmates" | "recordings";

interface Props {
  classmates: Classmate[];
  recordings: Recording[];
}

export function AdminTabsClient({ classmates, recordings }: Props) {
  const [tab, setTab] = useState<Tab>("classmates");

  return (
    <>
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border/70 mb-6">
        <TabButton
          active={tab === "classmates"}
          onClick={() => setTab("classmates")}
          icon={<Users className="h-3.5 w-3.5" />}
          label={`同学管理 (${classmates.length})`}
        />
        <TabButton
          active={tab === "recordings"}
          onClick={() => setTab("recordings")}
          icon={<Mic className="h-3.5 w-3.5" />}
          label={`录音管理 (${recordings.length})`}
        />
      </div>

      {/* Tab content */}
      {tab === "classmates" ? (
        <ClassmatesTable initialClassmates={classmates} />
      ) : (
        <RecordingsTable recordings={recordings} classmates={classmates} />
      )}
    </>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2.5 font-serif text-sm border-b-2 transition-colors -mb-px ${
        active
          ? "border-forest text-forest"
          : "border-transparent text-ink-faint hover:text-ink-soft hover:border-border"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
