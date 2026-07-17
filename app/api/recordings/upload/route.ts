import { NextRequest, NextResponse } from 'next/server';
import {
  BUCKET_RECORDINGS,
  AUDIO_MIME_TYPES,
  uploadObject,
  validateFileSize,
  validateFileType,
} from '@/lib/storage';

const MAX_MB = 50;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json(
        { success: false, error: '没有找到文件' },
        { status: 400 }
      );
    }
    if (!validateFileType(file, AUDIO_MIME_TYPES)) {
      return NextResponse.json(
        { success: false, error: '不支持的音频类型' },
        { status: 400 }
      );
    }
    if (!validateFileSize(file, MAX_MB)) {
      return NextResponse.json(
        { success: false, error: `文件大小不能超过${MAX_MB}MB` },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() ?? 'wav';
    const result = await uploadObject(BUCKET_RECORDINGS, file, {
      filename: `audio-${randomName()}.${ext}`,
      contentType: file.type,
      cacheControl: '31536000',
    });

    return NextResponse.json({
      success: true,
      data: {
        path: result.path,
        url: result.publicUrl,
        filename: file.name,
        size: result.size,
        type: result.contentType,
      },
    });
  } catch (error) {
    console.error('上传音频失败:', error);
    return NextResponse.json(
      { success: false, error: '上传失败' },
      { status: 500 }
    );
  }
}

function randomName() {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
