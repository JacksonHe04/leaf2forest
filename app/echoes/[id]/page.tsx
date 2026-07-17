import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  FileText,
  Quote,
  Mic,
} from "lucide-react";
import AudioPlayer from "@/components/features/AudioPlayer";
import { getRecording, getRecordingByNum } from "@/lib/db/recordings";
import { listClassmatesByIds } from "@/lib/db/classmates";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { getPublicUrl, BUCKET_RECORDINGS } from "@/lib/storage";
import { PageTransition } from "@/components/site/PageTransition";
import { LeafMotif } from "@/components/site/LeafMotif";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const recording = (await getRecordingByNum(Number(id))) ?? (await getRecording(id));
  if (!recording) return { title: "录音未找到" };
  return {
    title: `${recording.title} · 声音档案`,
    description: recording.description ?? recording.background ?? undefined,
  };
}

export default async function RecordingPage({ params }: Props) {
  const { id } = await params;
  const recording = (await getRecordingByNum(Number(id))) ?? (await getRecording(id));
  if (!recording) notFound();

  const audioUrl = getPublicUrl(BUCKET_RECORDINGS, recording.audio_path);

  // Fetch object size to detect missing sources.
  const supabase = getSupabaseAdmin();
  const { data: objInfo } = await supabase.storage
    .from(BUCKET_RECORDINGS)
    .list(undefined, { limit: 1000, search: recording.audio_path });
  const matchedObj = (objInfo ?? []).find((o) => o.name === recording.audio_path);
  const sizeBytes = matchedObj
    ? (matchedObj.metadata?.size as number | undefined) ?? 0
    : 0;

  const classmateIds = recording.classmates ?? [];
  const classmates =
    classmateIds.length > 0 ? await listClassmatesByIds(classmateIds) : [];

  const dateLabel = new Date(recording.date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <main className="mx-auto max-w-4xl px-5 sm:px-8 py-12">
      {/* Back link */}
      <Link
        href="/echoes"
        className="group inline-flex items-center gap-1.5 font-serif text-sm text-ink-soft hover:text-forest transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
        返回 Echoes 声音档案
      </Link>

      <PageTransition>
        {/* ============ Header ============ */}
        <header className="mt-6 border-b border-border pb-8">
          <div className="flex items-center gap-3 font-serif text-sm text-ink-faint">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gold" />
              {dateLabel}
            </span>
            {recording.time && (
              <span className="inline-flex items-center gap-1.5">
                <span className="text-gold">·</span>
                <Clock className="h-4 w-4 text-gold" />
                {recording.time}
              </span>
            )}
          </div>

          <h1 className="mt-4 display-heading text-4xl sm:text-5xl text-ink leading-tight">
            {recording.title}
          </h1>

          {recording.location && (
            <p className="mt-4 inline-flex items-center gap-1.5 font-serif text-sm text-ink-soft">
              <MapPin className="h-4 w-4 text-forest" />
              {recording.location}
            </p>
          )}

          {/* Decorative rule */}
          <div className="mt-6 flex items-center gap-3 text-gold">
            <LeafMotif variant="mark" className="h-4 w-4" />
            <span className="h-px flex-1 bg-gradient-to-r from-gold via-gold/40 to-transparent" />
          </div>
        </header>

        {/* ============ Player ============ */}
        <section className="mt-8 surface-paper rounded-md p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Mic className="h-4 w-4 text-forest" />
            <span className="eyebrow">Play</span>
          </div>
          <AudioPlayer
            url={audioUrl}
            sizeBytes={sizeBytes}
            title={recording.title}
            variant="feature"
          />
        </section>

        {/* ============ Body ============ */}
        <div className="mt-10 grid grid-cols-1 gap-8">
          {/* Background */}
          {recording.background && (
            <DetailSection
              icon={<Quote className="h-4 w-4" />}
              title="背景"
              eyebrow="Context"
            >
              <p className="prose-archive whitespace-pre-wrap">
                {recording.background}
              </p>
            </DetailSection>
          )}

          {/* Description */}
          {recording.description && (
            <DetailSection
              icon={<FileText className="h-4 w-4" />}
              title="描述"
              eyebrow="Description"
            >
              <p className="prose-archive whitespace-pre-wrap">
                {recording.description}
              </p>
            </DetailSection>
          )}

          {/* Transcription */}
          {recording.transcription && (
            <DetailSection
              icon={<FileText className="h-4 w-4" />}
              title="文字转录"
              eyebrow="Transcript"
            >
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-0 top-0 bottom-0 w-0.5 bg-gold/40"
                  aria-hidden="true"
                />
                <p className="prose-archive whitespace-pre-wrap pl-5 italic">
                  {recording.transcription}
                </p>
              </div>
            </DetailSection>
          )}

          {/* Related classmates */}
          {classmates.length > 0 && (
            <DetailSection
              icon={<Users className="h-4 w-4" />}
              title="参与的同学"
              eyebrow="Present"
            >
              <ul className="flex flex-wrap gap-2">
                {classmates.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/forest/${c.user_id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-forest/30 bg-paper-soft px-3.5 py-1.5 font-serif text-sm text-ink-soft transition-all hover:border-forest hover:bg-forest hover:text-paper-soft"
                    >
                      <LeafMotif variant="mark" className="h-3 w-3" />
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}
        </div>

        {/* Closing colophon */}
        <div className="mt-16 flex items-center justify-center text-gold">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
          <LeafMotif variant="mark" className="mx-3 h-4 w-4" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
        </div>
        <p className="mt-3 text-center font-serif text-xs italic text-ink-faint">
          这段声音录制于 {dateLabel}
          {recording.time ? ` ${recording.time}` : ""}。
        </p>
      </PageTransition>
    </main>
  );
}

function DetailSection({
  icon,
  title,
  eyebrow,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-deep text-forest">
          {icon}
        </span>
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2 className="display-heading text-2xl text-ink leading-tight">
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}
