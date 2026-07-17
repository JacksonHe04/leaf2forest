"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  url: string;
  /** Optional hint: known object size in bytes (from storage metadata). */
  sizeBytes?: number | null;
  title?: string;
  /**
   * Visual variant:
   *  - "inline"  : compact, single row (used in archive card)
   *  - "feature" : larger, with waveform bars (used on recording detail)
   */
  variant?: "inline" | "feature";
}

/**
 * AudioPlayer — Leaf2Forest variant.
 *
 * Design notes:
 *  - Play button is a small forest-green disc, not a big blue CTA.
 *  - Progress track is a thin gold rule, like a manuscript line.
 *  - When playing, a row of gentle waveform bars animates (CLAUDE.md §6.7).
 *  - On error (0-byte object / 404 / unsupported), we show a quiet
 *    "源文件缺失" notice rather than a scary red banner.
 *
 * Implementation note:
 *  The actual audio wiring lives in the inner <PlayerCore> component,
 *  which is remounted via a `key` whenever the url/sizeBytes change.
 *  That way the initial useState already has the right defaults
 *  (loading=true, error=null) and we never need to reset state inside
 *  useEffect — which keeps the linter (and React 19 strict mode) happy.
 */
export default function AudioPlayer({
  url,
  sizeBytes,
  title,
  variant = "inline",
}: Props) {
  // If the source is known to be empty, skip the player entirely.
  if (sizeBytes === 0) {
    return <ErrorNotice title="源文件缺失" url={url} />;
  }

  return (
    <PlayerCore
      key={`${url}|${sizeBytes ?? ""}`}
      url={url}
      title={title}
      variant={variant}
    />
  );
}

function PlayerCore({
  url,
  title,
  variant,
}: {
  url: string;
  title?: string;
  variant: "inline" | "feature";
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      setIsLoading(false);
      if (audio.duration && Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);
    const onError = () => {
      setIsLoading(false);
      const code = audio.error?.code;
      setError(
        code === MediaError.MEDIA_ERR_NETWORK
          ? "网络错误，无法加载音频"
          : code === MediaError.MEDIA_ERR_DECODE
          ? "音频解码失败（文件可能损坏）"
          : code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
          ? "浏览器不支持该音频格式"
          : "音频加载失败"
      );
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.load();

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  async function toggle() {
    const a = audioRef.current;
    if (!a || error) return;
    if (isPlaying) {
      a.pause();
    } else {
      try {
        await a.play();
      } catch {
        setError("播放失败，请稍后重试");
        return;
      }
    }
    setIsPlaying(!isPlaying);
  }

  function seekTo(clientX: number) {
    const bar = barRef.current;
    const a = audioRef.current;
    if (!bar || !a || !duration || !Number.isFinite(duration)) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    a.currentTime = ratio * duration;
    setCurrentTime(a.currentTime);
  }

  function onBarMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    seekTo(e.clientX);
    setIsDragging(true);
  }

  // Global drag handlers — attached when isDragging becomes true
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => seekTo(e.clientX);
    const onUp = () => setIsDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, duration]);

  function fmt(t: number) {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const progressPct =
    duration && duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return <ErrorNotice title={error} url={url} />;
  }

  const isFeature = variant === "feature";

  return (
    <div className={cn("flex flex-col gap-2", isFeature && "gap-3")}>
      <audio ref={audioRef} src={url} preload="metadata" />

      <div className="flex items-center gap-3">
        {/* Play button */}
        <button
          type="button"
          onClick={toggle}
          disabled={isLoading}
          aria-label={isPlaying ? "暂停" : "播放"}
          title={title ? `播放 ${title}` : undefined}
          className={cn(
            "group relative inline-flex shrink-0 items-center justify-center rounded-full text-paper-soft transition-all duration-300",
            isFeature ? "h-12 w-12" : "h-10 w-10",
            isLoading
              ? "bg-ink-faint/60 cursor-wait"
              : isPlaying
              ? "bg-forest-deep hover:bg-forest shadow-[0_0_0_4px_rgba(83,101,74,0.12)]"
              : "bg-forest hover:bg-forest-deep shadow-[0_0_0_4px_rgba(83,101,74,0.10)]"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          )}
        </button>

        {/* Track + times */}
        <div className="flex-1 min-w-0">
          {/* Waveform / progress track */}
          {isFeature ? (
            <Waveform
              isPlaying={isPlaying}
              progressPct={progressPct}
              onSeek={(pct) => {
                const a = audioRef.current;
                if (a && duration && Number.isFinite(duration)) {
                  a.currentTime = (pct / 100) * duration;
                }
              }}
            />
          ) : (
            <div
              ref={barRef}
              onMouseDown={onBarMouseDown}
              className="relative h-1.5 rounded-full bg-paper-deep cursor-pointer group"
              role="slider"
              aria-label="音频进度"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressPct)}
            >
              <motion.div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-forest to-gold rounded-full"
                style={{ width: `${progressPct}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-forest shadow-sm transition-opacity",
                  isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                style={{ left: `calc(${progressPct}% - 6px)` }}
              />
            </div>
          )}

          <div className="mt-1.5 flex justify-between font-serif text-xs text-ink-faint tabular-nums">
            <span>{fmt(currentTime)}</span>
            <span>
              {duration != null
                ? fmt(duration)
                : isLoading
                ? "读取中…"
                : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorNotice({ title, url }: { title: string; url: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-gold/40 bg-paper-deep/60 px-3 py-2.5 text-sm text-ink-soft">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
      <div className="min-w-0">
        <div className="font-serif">{title}</div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block break-all text-xs text-ink-faint underline link-archive"
        >
          直接打开源文件
        </a>
      </div>
    </div>
  );
}

/**
 * Waveform — a row of gentle vertical bars. When playing, the bars
 * around the playhead animate subtly to suggest sound. Click to seek.
 *
 * The bar heights are computed once via useState's lazy initializer
 * (deterministic pseudo-random envelope) so they stay stable across
 * renders without violating the "no refs in render" lint rule.
 */
function Waveform({
  isPlaying,
  progressPct,
  onSeek,
}: {
  isPlaying: boolean;
  progressPct: number;
  onSeek: (pct: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barCount = 48;
  const [heights] = useState<number[]>(() =>
    Array.from({ length: barCount }, (_, i) => {
      // Pseudo-random but deterministic — a soft envelope.
      const env = Math.sin((i / barCount) * Math.PI);
      const noise = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      return 0.25 + Math.abs(noise) * 0.6 + env * 0.15;
    })
  );

  function handleClick(e: React.MouseEvent) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    onSeek(Math.max(0, Math.min(100, pct)));
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="relative flex h-10 items-center gap-[2px] cursor-pointer"
      role="slider"
      aria-label="音频进度"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progressPct)}
    >
      {heights.map((h, i) => {
        const barPct = (i / barCount) * 100;
        const played = barPct <= progressPct;
        return (
          <div
            key={i}
            className="relative flex-1 rounded-full overflow-hidden"
            style={{
              height: `${h * 100}%`,
              backgroundColor: played ? "var(--forest)" : "var(--paper-deep)",
              transition: "background-color 200ms ease",
            }}
          >
            {isPlaying && played && (
              <AnimatePresence>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: "var(--gold)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: (i % 6) * 0.08,
                    ease: "easeInOut",
                  }}
                />
              </AnimatePresence>
            )}
          </div>
        );
      })}
    </div>
  );
}
