import Link from 'next/link';
import { listRecordings } from '@/lib/db/recordings';
import { listClassmates } from '@/lib/db/classmates';
import { getSupabaseAdmin } from '@/lib/db/supabase';
import { BUCKET_IMAGES, BUCKET_RECORDINGS } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [recordings, classmates, supabase] = await Promise.all([
    listRecordings({ limit: 5 }),
    listClassmates(),
    Promise.resolve(getSupabaseAdmin()),
  ]);

  const [recordingsCount, audioCount, imageCount] = await Promise.all([
    supabase.from('recordings').select('*', { count: 'exact', head: true }),
    supabase.storage
      .from(BUCKET_RECORDINGS)
      .list(undefined, { limit: 1 })
      .then((r) => (Array.isArray(r.data) ? r.data.length : 0)),
    supabase.storage
      .from(BUCKET_IMAGES)
      .list(undefined, { limit: 1 })
      .then((r) => (Array.isArray(r.data) ? r.data.length : 0)),
  ]);

  const stats = {
    recordings: recordingsCount.count ?? 0,
    classmates: classmates.length,
    audioFiles: audioCount, // best-effort; bucket has its own pagination
    images: imageCount,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数据后台</h1>
          <p className="text-gray-600">
            所有数据都在 Supabase（Postgres + Storage）中，可公开访问。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Stat label="录音（DB 行）" value={stats.recordings} />
          <Stat label="同学（DB 行）" value={stats.classmates} />
          <Stat label="音频对象（桶预览）" value={stats.audioFiles} />
          <Stat label="图片对象（桶预览）" value={stats.images} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Panel
            title="录音"
            subtitle="在 recordings 表与 recordings 存储桶中"
            links={[
              { href: '/admin/recordings', label: '查看全部' },
              { href: '/admin/recordings/new', label: '新增录音' },
            ]}
          />
          <Panel
            title="同学"
            subtitle="在 classmates 表与 images 存储桶中（头像）"
            links={[
              { href: '/admin/classmates', label: '查看全部' },
              { href: '/admin/classmates/new', label: '新增同学' },
            ]}
          />
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">最近的录音</h2>
          {recordings.length === 0 ? (
            <p className="text-gray-500">还没有录音。</p>
          ) : (
            <ul className="divide-y">
              {recordings.map((r) => (
                <li key={r.id} className="py-3 flex justify-between">
                  <Link
                    href={`/recordings/${r.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {r.title}
                  </Link>
                  <span className="text-gray-500 text-sm">
                    {r.date}
                    {r.time ? ` ${r.time}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  links,
}: {
  title: string;
  subtitle: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-gray-500 text-sm mb-4">{subtitle}</p>
      <div className="flex flex-wrap gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
