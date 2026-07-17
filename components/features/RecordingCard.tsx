"use client";

import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import type { Recording, Person } from "@/lib/db/types";
import { cn } from "@/lib/utils";

interface Props {
  recording: Recording;
  people: Person[];
  /**
   * Bytes in the recordings bucket. 0 ⇒ the local source was empty,
   * we render an explicit "missing" tag instead of a silent player.
   * null ⇒ unknown; player will ask the browser.
   */
  sizeBytes: number | null;
  /** Optional index for staggered entrance animations. */
  index?: number;
  /** "archive" : default grid card. "row" : compact horizontal row (admin). */
  variant?: "archive" | "row";
}

export default function RecordingCard({
  recording,
  people,
  sizeBytes,
  index = 0,
  variant = "archive",
}: Props) {
  const url = `https://lugszrtwvninbduskick.supabase.co/storage/v1/object/public/recordings/${recording.audio_path}`;
  const isEmpty = sizeBytes === 0;
  const isLoading = sizeBytes == null;

  const dateLabel = new Date(recording.date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (variant === "row") {
    return (
      <div className="surface-paper rounded-md p-4 lift-paper">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/echoes/${recording.num}`}
              className="font-serif text-base text-ink hover:text-forest transition-colors"
            >
              {recording.title}
            </Link>
            <span className="font-serif text-xs text-ink-faint whitespace-nowrap">
              {dateLabel}
            </span>
          </div>
          {recording.story && (
            <p className="font-serif text-sm text-ink-soft line-clamp-2">
              {recording.story}
            </p>
          )}
          {!isEmpty && !isLoading && (
            <AudioPlayer url={url} sizeBytes={sizeBytes} title={recording.title} />
          )}
        </div>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "group relative surface-paper rounded-md lift-paper overflow-hidden",
        isEmpty && "ring-1 ring-gold/40"
      )}
    >
      {/* Full-card click target */}
      <Link
        href={`/echoes/${recording.num}`}
        className="absolute inset-0 z-[1]"
        aria-label={recording.title}
      />

      {/* Top strip — date + location, like a card catalog header */}
      <div className="flex items-center justify-between border-b border-border/70 bg-paper-deep/40 px-5 py-2.5">
        <div className="flex items-center gap-1.5 font-serif text-xs text-ink-soft">
          <Calendar className="h-3.5 w-3.5 text-gold" />
          <span>{dateLabel}</span>
          {recording.time && (
            <>
              <span className="text-gold">·</span>
              <Clock className="h-3.5 w-3.5 text-gold" />
              <span>{recording.time}</span>
            </>
          )}
        </div>
        {isEmpty && (
          <span className="font-serif text-[10px] tracking-wider uppercase text-gold">
            源文件缺失
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="display-heading text-xl text-ink leading-tight group-hover:text-forest transition-colors">
          {recording.title}
        </h3>

        {recording.story && (
          <p className="mt-2 font-serif text-sm leading-7 text-ink-soft line-clamp-2">
            {recording.story}
          </p>
        )}

        {/* Player — z-10 to stay above the click overlay */}
        <div className="relative z-10 mt-4">
          {isEmpty ? (
            <div className="rounded-md border border-gold/40 bg-paper-deep/50 px-3 py-2 text-xs text-ink-faint font-serif">
              源文件是 0 字节，跳过播放。
            </div>
          ) : isLoading ? (
            <div className="h-10 rounded-md shimmer-paper" />
          ) : (
            <AudioPlayer
              url={url}
              sizeBytes={sizeBytes}
              title={recording.title}
            />
          )}
        </div>

        {/* Footer — location + participants */}
        {(recording.location || people.length > 0) && (
          <div className="relative z-10 mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/60 pt-3">
            {recording.location && (
              <span className="inline-flex items-center gap-1.5 font-serif text-xs text-ink-faint">
                <MapPin className="h-3.5 w-3.5 text-forest" />
                {recording.location}
              </span>
            )}
            {people.map((p) =>
              p.kind === 'classmate' ? (
                <Link
                  key={p.id}
                  href={`/forest/${p.user_id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-forest/25 bg-forest/5 px-2 py-0.5 font-serif text-[11px] text-ink-soft transition-colors hover:border-forest hover:bg-forest hover:text-paper-soft"
                >
                  {p.name}
                </Link>
              ) : (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-gold/5 px-2 py-0.5 font-serif text-[11px] text-ink-soft"
                >
                  {p.name}
                  <span className="text-ink-faint/60 text-[10px]">{p.subject}</span>
                </span>
              )
            )}
          </div>
        )}
      </div>
    </article>
  );
}
