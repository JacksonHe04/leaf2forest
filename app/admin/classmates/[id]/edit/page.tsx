import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClassmate } from '@/lib/db/classmates';
import { getPublicUrl, BUCKET_IMAGES } from '@/lib/storage';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditClassmatePage({ params }: Props) {
  const { id } = await params;
  const c = await getClassmate(id);
  if (!c) notFound();

  const fields: [string, string | null][] = [
    ['姓名', c.name],
    ['性别', c.gender],
    ['出生日期', c.birth_date],
    ['所在城市', c.city],
    ['QQ', c.qq],
    ['微信号', c.wechat],
    ['电话', c.phone],
    ['工作单位', c.employer],
    ['行业', c.industry],
    ['本科院校', c.bachelor_university],
    ['本科专业', c.bachelor_major],
    ['硕士院校', c.master_university],
    ['硕士专业', c.master_major],
    ['博士院校', c.doctor_university],
    ['博士专业', c.doctor_major],
    ['简介', c.bio],
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">同学：{c.name}</h1>
          <Link href="/admin/classmates" className="text-gray-600">
            ← 返回
          </Link>
        </div>
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          {c.avatar_path && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getPublicUrl(BUCKET_IMAGES, c.avatar_path)}
              alt={c.name}
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
          )}
          {fields
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="flex">
                <div className="w-32 text-gray-500 text-sm">{k}</div>
                <div className="flex-1 text-sm whitespace-pre-wrap">{v}</div>
              </div>
            ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          后续会接入 inline 编辑表单。
        </p>
      </div>
    </div>
  );
}
