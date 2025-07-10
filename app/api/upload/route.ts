import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, validateFileType, validateFileSize } from '@/lib/blob';

/**
 * 处理文件上传的POST请求
 * @param request NextRequest对象
 * @returns 上传结果的JSON响应
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: '没有找到文件' },
        { status: 400 }
      );
    }

    // 验证文件类型（可根据需要调整允许的类型）
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'text/plain',
    ];

    if (!validateFileType(file, allowedTypes)) {
      return NextResponse.json(
        { success: false, error: '不支持的文件类型' },
        { status: 400 }
      );
    }

    // 验证文件大小（最大10MB）
    if (!validateFileSize(file, 10)) {
      return NextResponse.json(
        { success: false, error: '文件大小不能超过10MB' },
        { status: 400 }
      );
    }

    // 上传文件
    const result = await uploadFile(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        downloadUrl: result.downloadUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('上传文件时发生错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}