import Link from 'next/link';
import { listClassmates } from '@/lib/db/classmates';
import NewRecordingForm from './RecordingForm';

export const dynamic = 'force-dynamic';

export default async function NewRecordingPage() {
  const classmates = await listClassmates();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">新增录音</h1>
          <Link href="/admin/recordings" className="text-gray-600 hover:text-gray-900">
            ← 返回
          </Link>
        </div>
        <NewRecordingForm
          classmates={classmates.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>
    </div>
  );
}
