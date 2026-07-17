import {
  Mic,
  Users,
  HardDrive,
  Image as ImageIcon,
} from "lucide-react";
import { listRecordings } from "@/lib/db/recordings";
import { listClassmates } from "@/lib/db/classmates";
import { listTeachers } from "@/lib/db/teachers";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { BUCKET_IMAGES, BUCKET_RECORDINGS } from "@/lib/storage";
import { PageTransition } from "@/components/site/PageTransition";
import { LeafMotif } from "@/components/site/LeafMotif";
import { AdminTabsClient } from "./AdminTabsClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [classmates, teachers, recordings, supabase] = await Promise.all([
    listClassmates(),
    listTeachers(),
    listRecordings(),
    Promise.resolve(getSupabaseAdmin()),
  ]);

  const [recordingsCount, audioList, imageList] = await Promise.all([
    supabase.from("recordings").select("*", { count: "exact", head: true }),
    supabase.storage.from(BUCKET_RECORDINGS).list(undefined, { limit: 1000 }),
    supabase.storage.from(BUCKET_IMAGES).list(undefined, { limit: 1000 }),
  ]);

  const stats = {
    recordings: recordingsCount.count ?? 0,
    classmates: classmates.length,
    audioFiles: Array.isArray(audioList.data) ? audioList.data.length : 0,
    images: Array.isArray(imageList.data) ? imageList.data.length : 0,
  };

  return (
    <main className="mx-auto max-w-[95rem] px-5 sm:px-8 py-8">
      <PageTransition>
        {/* Compact stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatMini label="录音" value={stats.recordings} icon={<Mic className="h-3.5 w-3.5" />} />
          <StatMini label="同学" value={stats.classmates} icon={<Users className="h-3.5 w-3.5" />} />
          <StatMini label="音频" value={stats.audioFiles} icon={<HardDrive className="h-3.5 w-3.5" />} />
          <StatMini label="图片" value={stats.images} icon={<ImageIcon className="h-3.5 w-3.5" />} />
        </div>

        {/* Tabs */}
        <AdminTabsClient
          classmates={classmates}
          teachers={teachers}
          recordings={recordings}
        />

        {/* Closing mark */}
        <div className="mt-10 flex justify-center">
          <LeafMotif variant="sprig" className="h-7 w-20 text-forest/40" />
        </div>
      </PageTransition>
    </main>
  );
}

/* ── Stat card ── */

function StatMini({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="surface-paper rounded-md px-4 py-3 flex items-center gap-3">
      <span className="text-forest">{icon}</span>
      <div>
        <p className="display-heading text-2xl text-forest tabular-nums leading-none">
          {value}
        </p>
        <p className="font-serif text-[11px] text-ink-faint mt-0.5">{label}</p>
      </div>
    </div>
  );
}
