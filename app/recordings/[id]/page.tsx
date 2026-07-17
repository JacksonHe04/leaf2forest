import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import AudioPlayer from '@/components/features/AudioPlayer';
import { getRecording } from '@/lib/db/recordings';
import { listClassmatesByIds } from '@/lib/db/classmates';
import { getPublicUrl, BUCKET_RECORDINGS } from '@/lib/storage';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const recording = await getRecording(id);
  if (!recording) return { title: '录音未找到' };
  return {
    title: recording.title,
    description: recording.description ?? recording.background ?? undefined,
  };
}

export default async function RecordingPage({ params }: Props) {
  const { id } = await params;
  const recording = await getRecording(id);
  if (!recording) notFound();

  const audioUrl = getPublicUrl(BUCKET_RECORDINGS, recording.audio_path);
  const classmateIds = recording.classmates ?? [];
  const classmates =
    classmateIds.length > 0
      ? await listClassmatesByIds(classmateIds)
      : [];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-sm text-gray-500 mb-2">
          {new Date(recording.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          {recording.time && <span className="ml-2">{recording.time}</span>}
        </div>
        <h1 className="text-3xl font-bold mb-4">{recording.title}</h1>

        <div className="mb-6">
          <AudioPlayer url={audioUrl} />
        </div>

        {(recording.description || recording.background) && (
          <div className="prose max-w-none mb-6">
            {recording.background && (
              <>
                <h2 className="text-xl font-semibold mb-2">背景</h2>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                  {recording.background}
                </p>
              </>
            )}
            {recording.description && (
              <>
                <h2 className="text-xl font-semibold mb-2">描述</h2>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                  {recording.description}
                </p>
              </>
            )}
          </div>
        )}

        {recording.transcription && (
          <div className="prose max-w-none mb-6">
            <h2 className="text-xl font-semibold mb-2">文字转录</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {recording.transcription}
            </p>
          </div>
        )}

        {classmates.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">关联同学</h2>
            <div className="flex flex-wrap gap-2">
              {classmates.map((c) => (
                <span
                  key={c.id}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {recording.location && (
          <div>
            <h2 className="text-xl font-semibold mb-2">地点</h2>
            <p className="text-gray-700">{recording.location}</p>
          </div>
        )}
      </div>
    </main>
  );
}
