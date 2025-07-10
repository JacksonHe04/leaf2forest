'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import FileManager from '@/components/FileManager';

interface UploadedFile {
  url: string;
  downloadUrl: string;
  filename: string;
  size: number;
  type: string;
}

/**
 * Blob存储演示页面
 */
export default function BlobDemoPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * 处理上传成功
   * @param file 上传成功的文件信息
   */
  const handleUploadSuccess = (file: UploadedFile) => {
    setUploadedFiles(prev => [file, ...prev]);
    setMessage({ type: 'success', text: `文件 "${file.filename}" 上传成功！` });
    setRefreshTrigger(prev => prev + 1);
    
    // 3秒后清除消息
    setTimeout(() => setMessage(null), 3000);
  };

  /**
   * 处理上传失败
   * @param error 错误信息
   */
  const handleUploadError = (error: string) => {
    setMessage({ type: 'error', text: error });
    
    // 5秒后清除消息
    setTimeout(() => setMessage(null), 5000);
  };

  /**
   * 处理文件删除
   * @param url 被删除文件的URL
   */
  const handleFileDelete = (url: string) => {
    setUploadedFiles(prev => prev.filter(file => file.url !== url));
    setMessage({ type: 'success', text: '文件删除成功！' });
    
    // 3秒后清除消息
    setTimeout(() => setMessage(null), 3000);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vercel Blob 存储演示
          </h1>
          <p className="text-gray-600">
            演示文件上传、下载、删除和管理功能
          </p>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`
            mb-6 p-4 rounded-lg border
            ${message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
            }
          `}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {message.text}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 文件上传区域 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">文件上传</h2>
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              accept="image/*,audio/*,video/*,.pdf,.txt"
              maxSizeMB={10}
            />
            
            {/* 上传说明 */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">支持的文件类型：</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 图片：JPG, PNG, GIF, WebP</li>
                <li>• 音频：MP3, WAV, OGG</li>
                <li>• 视频：MP4, WebM</li>
                <li>• 文档：PDF, TXT</li>
              </ul>
              <p className="text-sm text-blue-800 mt-2">
                最大文件大小：10MB
              </p>
            </div>
          </div>

          {/* 最近上传的文件 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">最近上传的文件</h2>
            {uploadedFiles.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                暂无上传的文件
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedFiles.slice(0, 5).map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{file.filename}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        查看
                      </a>
                      <a
                        href={file.downloadUrl}
                        download={file.filename}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        下载
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 文件管理器 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <FileManager
            onFileDelete={handleFileDelete}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* API 使用说明 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">API 使用说明</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">上传文件</h3>
              <code className="text-sm bg-gray-100 p-2 rounded block">
                POST /api/upload
              </code>
              <p className="text-sm text-gray-600 mt-2">
                使用 FormData 上传文件
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">获取文件列表</h3>
              <code className="text-sm bg-gray-100 p-2 rounded block">
                GET /api/files
              </code>
              <p className="text-sm text-gray-600 mt-2">
                获取所有已上传的文件
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">删除文件</h3>
              <code className="text-sm bg-gray-100 p-2 rounded block">
                DELETE /api/delete
              </code>
              <p className="text-sm text-gray-600 mt-2">
                删除指定的文件
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}