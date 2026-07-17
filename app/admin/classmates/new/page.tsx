import Link from 'next/link';
import NewClassmateForm from './ClassmateForm';

export default function NewClassmatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">新增同学</h1>
          <Link href="/admin/classmates" className="text-gray-600 hover:text-gray-900">
            ← 返回
          </Link>
        </div>
        <NewClassmateForm />
      </div>
    </div>
  );
}
