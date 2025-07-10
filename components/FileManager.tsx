'use client';

import { useState, useEffect } from 'react';

interface BlobFile {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  downloadUrl?: string;
}

interface FileManagerProps {
  onFileDelete?: (url: string) => void;
  refreshTrigger?: number;
}

/**
 * 文件管理组件
 * @param onFileDelete 文件删除回调
 * @param refreshTrigger 刷新触发器
 */
export default function FileManager({ onFileDelete, refreshTrigger }: FileManagerProps) {
  const [files, setFiles] = useState<BlobFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  /**
   * 获取文件列表
   */
  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/files');
      const result = await response.json();

      if (result.success) {
        setFiles(result.data.blobs || []);
      } else {
        setError(result.error || '获取文件列表失败');
      }
    } catch (error) {
      console.error('获取文件列表时发生错误:', error);
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除文件
   * @param url 文件URL
   */
  const handleDeleteFile = async (url: string) => {
    if (!confirm('确定要删除这个文件吗？')) {
      return;
    }

    try {
      setDeleting(url);
      
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (result.success) {
        setFiles(files.filter(file => file.url !== url));
        onFileDelete?.(url);
      } else {
        alert(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除文件时发生错误:', error);
      alert('网络错误，请重试');
    } finally {
      setDeleting(null);
    }
  };

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @returns 格式化后的大小字符串
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * 格式化日期
   * @param dateString 日期字符串
   * @returns 格式化后的日期
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  /**
   * 获取文件类型图标
   * @param pathname 文件路径
   * @returns 图标JSX
   */
  const getFileIcon = (pathname: string) => {
    const extension = pathname.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return (
        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (['mp3', 'wav', 'ogg'].includes(extension || '')) {
      return (
        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return (
      <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    );
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchFiles}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">文件管理</h2>
        <button
          onClick={fetchFiles}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          刷新
        </button>
      </div>

      {files.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          暂无文件
        </div>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => (
            <div
              key={file.url}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file.pathname)}
                <div>
                  <p className="font-medium text-gray-900">
                    {file.pathname.split('/').pop()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  查看
                </a>
                <a
                  href={file.downloadUrl || file.url}
                  download
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  下载
                </a>
                <button
                  onClick={() => handleDeleteFile(file.url)}
                  disabled={deleting === file.url}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                >
                  {deleting === file.url ? '删除中...' : '删除'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}