import Link from 'next/link';
import { listRecordings } from '@/lib/db/recordings';
import { listClassmatesByIds } from '@/lib/db/classmates';
import { getPublicUrl, BUCKET_RECORDINGS } from '@/lib/storage';
import type { Classmate } from '@/lib/db/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ClassmateMap = Record<string, Classmate>;

async function resolveClassmates(groups: string[][]): Promise<ClassmateMap> {
  const allIds = new Set<string>();
  for (const ids of groups) ids.forEach((id) => allIds.add(id));
  const list = await listClassmatesByIds([...allIds]);
  return Object.fromEntries(list.map((c) => [c.id, c]));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function HomePage() {
  const recordings = await listRecordings();
  const classmateMap = await resolveClassmates(
    recordings.map((r) => r.classmates ?? [])
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">高中记忆录</h1>
        <div className="flex gap-3">
          <Link
            href="/admin"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            后台管理
          </Link>
        </div>
      </div>

      {recordings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">还没有任何录音记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((rec) => {
            const url = getPublicUrl(BUCKET_RECORDINGS, rec.audio_path);
            const classmates = (rec.classmates ?? [])
              .map((id) => classmateMap[id])
              .filter(Boolean);
            return (
              <Link
                key={rec.id}
                href={`/recordings/${rec.id}`}
                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-sm text-gray-500 mb-2">
                  {formatDate(rec.date)}
                  {rec.time && (
                    <span className="ml-2 text-gray-400">{rec.time}</span>
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2">{rec.title}</h2>
                <p className="text-gray-600 line-clamp-2">{rec.description ?? rec.background ?? ''}</p>
                <audio src={url} controls preload="none" className="mt-4 w-full" />
                {classmates.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {classmates.map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
