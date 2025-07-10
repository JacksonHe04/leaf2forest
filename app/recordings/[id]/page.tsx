import { getRecordingById } from '@/lib/db/utils';
import { notFound } from 'next/navigation';
import AudioPlayer from '@/components/features/AudioPlayer';
import { Metadata } from 'next';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

// 生成页面元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const recording = await getRecordingById(resolvedParams.id);
  
  if (!recording) {
    return {
      title: '录音未找到',
    };
  }

  return {
    title: recording.title,
    description: recording.background,
  };
}

export default async function RecordingPage({ params }: Props) {
  const resolvedParams = await params;
  const recording = await getRecordingById(resolvedParams.id);

  if (!recording) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-2">
            {new Date(recording.date).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <h1 className="text-3xl font-bold mb-4">{recording.title}</h1>
          
          <div className="mb-6">
            <AudioPlayer url={recording.audioUrl} />
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-2">背景故事</h2>
            <p className="text-gray-700 mb-6">{recording.background}</p>

            <h2 className="text-xl font-semibold mb-2">文字转录</h2>
            <p className="text-gray-700 mb-6">{recording.transcription}</p>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">参与者</h2>
              <div className="flex flex-wrap gap-2">
                {recording.participants.map((participant) => (
                  <span 
                    key={participant}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                  >
                    {participant}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">标签</h2>
              <div className="flex flex-wrap gap-2">
                {recording.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {recording.location && (
              <div>
                <h2 className="text-xl font-semibold mb-2">位置</h2>
                <p className="text-gray-700">{recording.location}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 