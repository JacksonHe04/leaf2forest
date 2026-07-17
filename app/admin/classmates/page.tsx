import Link from 'next/link';
import { listClassmates } from '@/lib/db/classmates';
import { getPublicUrl, BUCKET_IMAGES } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default async function AdminClassmatesPage() {
  const classmates = await listClassmates();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">同学管理</h1>
            <p className="text-gray-600 text-sm">共 {classmates.length} 位</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin" className="px-3 py-2 text-gray-600 hover:text-gray-900">
              ← 返回
            </Link>
            <Link
              href="/admin/classmates/new"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              新增同学
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase">头像</th>
                <th className="px-4 py-3 text-left text-xs uppercase">姓名</th>
                <th className="px-4 py-3 text-left text-xs uppercase">性别</th>
                <th className="px-4 py-3 text-left text-xs uppercase">所在城市</th>
                <th className="px-4 py-3 text-left text-xs uppercase">工作单位 / 行业</th>
                <th className="px-4 py-3 text-left text-xs uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {classmates.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    {c.avatar_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getPublicUrl(BUCKET_IMAGES, c.avatar_path)}
                        alt={c.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-sm">{c.gender ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">{c.city ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    {[c.employer, c.industry].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/admin/classmates/${c.id}/edit`}
                      className="text-green-600"
                    >
                      编辑
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {classmates.length === 0 && (
            <div className="text-center py-12 text-gray-500">暂无同学</div>
          )}
        </div>
      </div>
    </div>
  );
}
