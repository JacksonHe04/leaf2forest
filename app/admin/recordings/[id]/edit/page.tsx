import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecording } from '@/lib/db/recordings';
import { getPublicUrl, BUCKET_RECORDINGS } from '@/lib/storage';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Read-only audit view that doubles as the "/edit" entry. Full edit form
 * is intentionally minimal here — extend as the workflow matures.
 */
export default async function EditRecordingPage({ params }: Props) {
  const { id } = await params;
  const r = await getRecording(id);
  if (!r) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">查看录音</h1>
          <Link href="/admin/recordings" className="text-gray-600">
            ← 返回
          </Link>
        </div>
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <Row k="标题" v={r.title} />
          <Row k="日期 / 时间" v={`${r.date}${r.time ? ' ' + r.time : ''}`} />
          {r.description && <Row k="描述" v={r.description} />}
          {r.background && <Row k="背景" v={r.background} />}
          {r.transcription && <Row k="转录" v={r.transcription} />}
          {r.location && <Row k="地点" v={r.location} />}
          <Row k="音频对象" v={r.audio_path} />
          <Row
            k="音频链接"
            v={
              <a
                href={getPublicUrl(BUCKET_RECORDINGS, r.audio_path)}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 break-all"
              >
                {getPublicUrl(BUCKET_RECORDINGS, r.audio_path)}
              </a>
            }
          />
          <Row k="关联同学数" v={String(r.classmates?.length ?? 0)} />
        </div>
        <p className="text-xs text-gray-500 mt-4">
          需要就地编辑请走 <Link href="/admin/recordings" className="text-blue-600">管理列表</Link>；
          后续会接入 inline 表单。
        </p>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex">
      <div className="w-32 text-gray-500 text-sm">{k}</div>
      <div className="flex-1 text-sm whitespace-pre-wrap break-words">{v}</div>
    </div>
  );
}
