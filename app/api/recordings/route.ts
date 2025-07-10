import { NextResponse } from 'next/server';
import { createRecording } from '@/lib/db/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    const requiredFields = ['date', 'title', 'audioUrl', 'transcription', 'background', 'participants'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    // 创建录音记录
    const result = await createRecording({
      date: new Date(body.date),
      title: body.title,
      audioUrl: body.audioUrl,
      transcription: body.transcription,
      background: body.background,
      participants: body.participants,
      tags: body.tags || [],
      location: body.location,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ 
      status: 'success',
      data: result 
    });
  } catch (error) {
    console.error('创建录音失败:', error);
    return NextResponse.json(
      { error: '创建录音失败' },
      { status: 500 }
    );
  }
} 