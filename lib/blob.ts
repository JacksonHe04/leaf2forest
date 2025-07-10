import { put, del, list, head } from '@vercel/blob';

/**
 * 上传文件到Vercel Blob存储
 * @param filename 文件名
 * @param file 文件内容（File对象或Buffer）
 * @param options 可选配置
 * @returns 上传结果，包含URL和其他信息
 */
export async function uploadFile(
  filename: string,
  file: File | Buffer | string,
  options?: {
    access?: 'public';
    addRandomSuffix?: boolean;
    contentType?: string;
  }
) {
  try {
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: options?.addRandomSuffix || true,
      contentType: options?.contentType,
    });
    
    return {
      success: true,
      data: blob,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
    };
  } catch (error) {
    console.error('上传文件失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败',
    };
  }
}

/**
 * 删除Blob存储中的文件
 * @param url 文件的URL或URL数组
 * @returns 删除结果
 */
export async function deleteFile(url: string | string[]) {
  try {
    await del(url);
    return {
      success: true,
      message: '文件删除成功',
    };
  } catch (error) {
    console.error('删除文件失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除失败',
    };
  }
}

/**
 * 列出Blob存储中的文件
 * @param options 查询选项
 * @returns 文件列表
 */
export async function listFiles(options?: {
  prefix?: string;
  limit?: number;
  cursor?: string;
}) {
  try {
    const result = await list({
      prefix: options?.prefix,
      limit: options?.limit || 100,
      cursor: options?.cursor,
    });
    
    return {
      success: true,
      data: result,
      blobs: result.blobs,
      hasMore: result.hasMore,
      cursor: result.cursor,
    };
  } catch (error) {
    console.error('获取文件列表失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取列表失败',
    };
  }
}

/**
 * 获取文件的元数据信息
 * @param url 文件URL
 * @returns 文件元数据
 */
export async function getFileInfo(url: string) {
  try {
    const info = await head(url);
    return {
      success: true,
      data: info,
    };
  } catch (error) {
    console.error('获取文件信息失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取信息失败',
    };
  }
}

/**
 * 生成文件的下载URL（对于私有文件）
 * @param url 文件URL
 * @returns 下载URL
 */
export function getDownloadUrl(url: string): string {
  // 对于公共文件，URL就是下载链接
  // 对于私有文件，可能需要特殊处理
  return url;
}

/**
 * 验证文件类型
 * @param file 文件对象
 * @param allowedTypes 允许的文件类型数组
 * @returns 验证结果
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * 验证文件大小
 * @param file 文件对象
 * @param maxSizeInMB 最大文件大小（MB）
 * @returns 验证结果
 */
export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}