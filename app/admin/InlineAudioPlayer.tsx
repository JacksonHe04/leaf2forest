"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, VolumeX } from "lucide-react";

/**
 * InlineAudioPlayer — minimal audio player for admin table cells.
 *
 * Shows a play/pause button, a seekable progress bar,
 * current time and total duration.
 */
export function InlineAudioPlayer({
  src,
  sizeBytes,
}: {
  src: string;
  sizeBytes: number;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onLoaded = () => {
      setDuration(el.duration);
      setReady(true);
    };
    const onTime = () => setCurrent(el.currentTime);
    const onEnd = () => {
      setPlaying(false);
      setCurrent(0);
    };
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnd);
    };
  }, []);

  const seek = useCallback(
    (e: React.MouseEvent) => {
      const bar = barRef.current;
      const el = audioRef.current;
      if (!bar || !el || !duration) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      el.currentTime = ratio * duration;
    },
    [duration]
  );

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause();
    else el.play().catch(() => {});
    setPlaying(!playing);
  }, [playing]);

  const fmt = (s: number) => {
    if (!s || !isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (sizeBytes === 0) {
    return (
      <div className="flex items-center gap-1.5 text-ink-faint">
        <VolumeX className="h-3.5 w-3.5" />
        <span className="text-[10px] font-serif">无源文件</span>
      </div>
    );
  }

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-1.5 min-w-[140px]">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={toggle}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest hover:bg-forest/20 transition-colors"
      >
        {playing ? (
          <Pause className="h-3 w-3" />
        ) : (
          <Play className="h-3 w-3 ml-px" />
        )}
      </button>
      <div
        ref={barRef}
        onClick={seek}
        className="relative flex-1 h-1.5 bg-ink-faint/15 rounded-full cursor-pointer group"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-forest to-gold transition-[width] duration-100"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-forest opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          style={{ left: `calc(${pct}% - 5px)` }}
        />
      </div>
      <span className="text-[10px] font-serif text-ink-faint tabular-nums whitespace-nowrap w-10 text-right">
        {ready ? fmt(current) : "—"}
        {ready && duration > 0 && (
          <span className="text-ink-faint/50">/{fmt(duration)}</span>
        )}
      </span>
    </div>
  );
}
