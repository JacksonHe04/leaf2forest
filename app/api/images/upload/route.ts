import { NextRequest, NextResponse } from 'next/server';
import {
  BUCKET_IMAGES,
  IMAGE_MIME_TYPES,
  uploadObject,
  validateFileSize,
  validateFileType,
} from '@/lib/storage';

const MAX_MB = 10;

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
    if (!validateFileType(file, IMAGE_MIME_TYPES)) {
      return NextResponse.json(
        { success: false, error: '不支持的图片类型' },
        { status: 400 }
      );
    }
    if (!validateFileSize(file, MAX_MB)) {
      return NextResponse.json(
        { success: false, error: `图片大小不能超过${MAX_MB}MB` },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() ?? 'png';
    const result = await uploadObject(BUCKET_IMAGES, file, {
      filename: `img-${randomName()}.${ext}`,
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
    console.error('上传图片失败:', error);
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
