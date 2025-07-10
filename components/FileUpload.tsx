'use client';

import { useState, useRef } from 'react';

interface UploadedFile {
  url: string;
  downloadUrl: string;
  filename: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  onUploadSuccess?: (file: UploadedFile) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

/**
 * 文件上传组件
 * @param onUploadSuccess 上传成功回调
 * @param onUploadError 上传失败回调
 * @param accept 接受的文件类型
 * @param maxSizeMB 最大文件大小（MB）
 */
export default function FileUpload({
  onUploadSuccess,
  onUploadError,
  accept = '*/*',
  maxSizeMB = 10,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 处理文件上传
   * @param file 要上传的文件
   */
  const handleFileUpload = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      const error = `文件大小不能超过${maxSizeMB}MB`;
      onUploadError?.(error);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onUploadSuccess?.(result.data);
      } else {
        onUploadError?.(result.error || '上传失败');
      }
    } catch (error) {
      console.error('上传文件时发生错误:', error);
      onUploadError?.('网络错误，请重试');
    } finally {
      setUploading(false);
    }
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  /**
   * 处理拖拽进入
   */
  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  /**
   * 处理拖拽离开
   */
  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  /**
   * 处理文件拖放
   */
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  /**
   * 触发文件选择
   */
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-600">正在上传...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-600 mb-2">
              {dragOver ? '释放文件以上传' : '点击或拖拽文件到这里上传'}
            </p>
            <p className="text-sm text-gray-400">
              最大文件大小: {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}