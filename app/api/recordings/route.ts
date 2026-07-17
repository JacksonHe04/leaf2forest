import { NextResponse } from 'next/server';
import { createRecording, listRecordings } from '@/lib/db/recordings';
import type { Recording, RecordingPatch } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const recordings = await listRecordings();
    return NextResponse.json({ status: 'success', data: recordings });
  } catch (error) {
    console.error('获取录音列表失败:', error);
    return NextResponse.json({ error: '获取录音列表失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RecordingPatch;
    const required: (keyof RecordingPatch)[] = [
      'date',
      'title',
      'audio_path',
    ];
    for (const f of required) {
      if (!body[f]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${f}` },
          { status: 400 }
        );
      }
    }
    const created = await createRecording({
      ...body,
      people: body.people ?? [],
    } satisfies RecordingPatch);
    return NextResponse.json({ status: 'success', data: created });
  } catch (error) {
    console.error('创建录音失败:', error);
    return NextResponse.json({ error: '创建录音失败' }, { status: 500 });
  }
}
