import { NextRequest, NextResponse } from 'next/server';
import { listFiles, getFileInfo } from '@/lib/blob';

/**
 * 处理获取文件列表的GET请求
 * @param request NextRequest对象
 * @returns 文件列表的JSON响应
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const cursor = searchParams.get('cursor') || undefined;

    // 获取文件列表
    const result = await listFiles({
      prefix,
      limit,
      cursor,
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
        blobs: result.blobs,
        hasMore: result.hasMore,
        cursor: result.cursor,
        total: result.blobs?.length || 0,
      },
    });
  } catch (error) {
    console.error('获取文件列表时发生错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * 处理获取单个文件信息的POST请求
 * @param request NextRequest对象
 * @returns 文件信息的JSON响应
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: '缺少文件URL' },
        { status: 400 }
      );
    }

    // 验证URL格式
    if (!url.startsWith('https://')) {
      return NextResponse.json(
        { success: false, error: '无效的文件URL' },
        { status: 400 }
      );
    }

    // 获取文件信息
    const result = await getFileInfo(url);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('获取文件信息时发生错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}