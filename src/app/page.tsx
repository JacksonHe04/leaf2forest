import { getRecordings } from '@/lib/db/utils';
import Link from 'next/link';

export default async function Home() {
  const recordings = await getRecordings();
  console.log('获取到的录音列表:', recordings);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">高中记忆录</h1>
      
      {recordings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">还没有任何录音记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((recording) => (
            <Link 
              href={`/recordings/${recording._id}`} 
              key={recording._id?.toString()}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-sm text-gray-500 mb-2">
                {new Date(recording.date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <h2 className="text-xl font-semibold mb-2">{recording.title}</h2>
              <p className="text-gray-600 line-clamp-2">{recording.background}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {recording.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
