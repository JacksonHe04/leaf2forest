import Link from 'next/link';
import { listRecordings } from '@/lib/db/recordings';
import { listClassmatesByIds } from '@/lib/db/classmates';
import { BUCKET_RECORDINGS, getPublicUrl } from '@/lib/storage';
import type { Classmate } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

export default async function AdminRecordingsPage() {
  const recordings = await listRecordings();
  const classmateMap = await resolveClassmates(
    recordings.map((r) => r.classmates ?? [])
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">录音管理</h1>
            <p className="text-gray-600 text-sm">
              共 {recordings.length} 条记录 · 存储于 Supabase（DB + Storage）
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin" className="px-3 py-2 text-gray-600 hover:text-gray-900">
              ← 返回
            </Link>
            <Link
              href="/admin/recordings/new"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              新增录音
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase">日期 / 时间</th>
                <th className="px-4 py-3 text-left text-xs uppercase">标题</th>
                <th className="px-4 py-3 text-left text-xs uppercase">同学</th>
                <th className="px-4 py-3 text-left text-xs uppercase">音频</th>
                <th className="px-4 py-3 text-left text-xs uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recordings.map((r) => {
                const classmates = (r.classmates ?? [])
                  .map((id) => classmateMap[id])
                  .filter(Boolean);
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {r.date} {r.time ?? ''}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{r.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {classmates.map((c) => c.name).join('、') || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={getPublicUrl(BUCKET_RECORDINGS, r.audio_path)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {r.audio_path}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/recordings/${r.id}`}
                        className="text-blue-600 mr-3"
                      >
                        查看
                      </Link>
                      <Link
                        href={`/admin/recordings/${r.id}/edit`}
                        className="text-green-600"
                      >
                        编辑
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recordings.length === 0 && (
            <div className="text-center py-12 text-gray-500">暂无录音</div>
          )}
        </div>
      </div>
    </div>
  );
}

async function resolveClassmates(groups: string[][]) {
  const ids = new Set<string>();
  for (const g of groups) g.forEach((id) => ids.add(id));
  const list = await listClassmatesByIds([...ids]);
  return Object.fromEntries(list.map((c: Classmate) => [c.id, c]));
}
