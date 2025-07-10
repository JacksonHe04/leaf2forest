'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * 文档编辑页面
 * 支持编辑现有文档的所有字段
 */
export default function EditDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const collectionName = params.name as string;
  const documentId = params.id as string;
  
  const [document, setDocument] = useState<Record<string, unknown> | null>(null);
  const [jsonContent, setJsonContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  /**
   * 获取文档数据
   */
  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/collections/${collectionName}/${documentId}`
      );
      const result = await response.json();
      
      if (result.status === 'success') {
        setDocument(result.data);
        setJsonContent(JSON.stringify(result.data, null, 2));
      } else {
        setError('获取文档失败: ' + result.error);
      }
    } catch (error) {
      setError('网络错误');
      console.error('获取文档失败:', error);
    } finally {
      setLoading(false);
    }
  }, [collectionName, documentId]);

  /**
   * 验证JSON格式
   */
  const validateJson = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      setJsonError(null);
      return true;
    } catch (err) {
      setJsonError('JSON 格式错误: ' + (err as Error).message);
      return false;
    }
  };

  /**
   * 保存文档
   */
  const saveDocument = async () => {
    if (!validateJson(jsonContent)) {
      return;
    }

    try {
      setSaving(true);
      const updatedDocument = JSON.parse(jsonContent);
      
      const response = await fetch(
        `/api/admin/collections/${collectionName}/${documentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedDocument),
        }
      );
      
      const result = await response.json();
      
      if (result.status === 'success') {
        alert('文档保存成功');
        router.push(`/admin/collections/${collectionName}`);
      } else {
        alert('保存失败: ' + result.error);
      }
    } catch (err) {
      alert('保存失败: 网络错误');
      console.error('保存文档失败:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * 处理JSON内容变化
   */
  const handleJsonChange = (value: string) => {
    setJsonContent(value);
    validateJson(value);
  };

  /**
   * 格式化JSON
   */
  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch {
      setJsonError('无法格式化: JSON 格式错误');
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <p className="text-red-600">{error}</p>
          <Link
            href={`/admin/collections/${collectionName}`}
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题和导航 */}
        <div className="mb-8">
          <nav className="text-sm breadcrumbs mb-4">
            <Link href="/admin" className="text-blue-600 hover:text-blue-800">
              数据库管理
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link
              href={`/admin/collections/${collectionName}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {collectionName}
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">编辑文档</span>
          </nav>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                编辑文档
              </h1>
              <p className="text-gray-600">
                文档 ID: {documentId}
              </p>
            </div>
            <div className="space-x-4">
              <Link
                href={`/admin/collections/${collectionName}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                取消
              </Link>
              <button
                onClick={saveDocument}
                disabled={saving || !!jsonError}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>

        {/* 编辑器 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              文档内容 (JSON 格式)
            </h2>
            <button
              onClick={formatJson}
              className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              格式化
            </button>
          </div>
          
          <div className="p-6">
            {/* JSON 错误提示 */}
            {jsonError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm">{jsonError}</p>
              </div>
            )}
            
            {/* JSON 编辑器 */}
            <div className="relative">
              <textarea
                value={jsonContent}
                onChange={(e) => handleJsonChange(e.target.value)}
                className={`w-full h-96 p-4 border rounded font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  jsonError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="请输入有效的 JSON 格式数据..."
              />
            </div>
            
            {/* 编辑提示 */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium text-blue-900 mb-2">编辑提示:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 请确保 JSON 格式正确</li>
                <li>• _id 字段会被自动忽略，无法修改</li>
                <li>• updatedAt 字段会自动更新为当前时间</li>
                <li>• 可以使用&ldquo;格式化&rdquo;按钮整理 JSON 格式</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 原始数据预览 */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              原始数据 (只读)
            </h2>
          </div>
          <div className="p-6">
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
              {JSON.stringify(document, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}