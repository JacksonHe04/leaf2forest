import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/lib/blob';

/**
 * 处理文件删除的DELETE请求
 * @param request NextRequest对象
 * @returns 删除结果的JSON响应
 */
export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: '缺少文件URL' },
        { status: 400 }
      );
    }

    // 验证URL格式（简单验证）
    if (!url.startsWith('https://')) {
      return NextResponse.json(
        { success: false, error: '无效的文件URL' },
        { status: 400 }
      );
    }

    // 删除文件
    const result = await deleteFile(url);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '文件删除成功',
    });
  } catch (error) {
    console.error('删除文件时发生错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * 处理批量删除文件的POST请求
 * @param request NextRequest对象
 * @returns 删除结果的JSON响应
 */
export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少文件URL列表' },
        { status: 400 }
      );
    }

    // 验证所有URL格式
    const invalidUrls = urls.filter(url => !url.startsWith('https://'));
    if (invalidUrls.length > 0) {
      return NextResponse.json(
        { success: false, error: '包含无效的文件URL' },
        { status: 400 }
      );
    }

    // 批量删除文件
    const result = await deleteFile(urls);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功删除${urls.length}个文件`,
    });
  } catch (error) {
    console.error('批量删除文件时发生错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}