'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * 新文档添加页面
 * 支持向指定集合添加新文档
 */
export default function NewDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const collectionName = params.name as string;
  
  const [jsonContent, setJsonContent] = useState('{}');
  const [saving, setSaving] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

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
   * 保存新文档
   */
  const saveDocument = async () => {
    if (!validateJson(jsonContent)) {
      return;
    }

    try {
      setSaving(true);
      const newDocument = JSON.parse(jsonContent);
      
      const response = await fetch(
        `/api/admin/collections/${collectionName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newDocument),
        }
      );
      
      const result = await response.json();
      
      if (result.status === 'success') {
        alert('文档创建成功');
        router.push(`/admin/collections/${collectionName}`);
      } else {
        alert('创建失败: ' + result.error);
      }
    } catch (error) {
      alert('创建失败: 网络错误');
      console.error('创建文档失败:', error);
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

  /**
   * 加载模板
   */
  const loadTemplate = (templateName: string) => {
    const templates: { [key: string]: Record<string, unknown> } = {
      recording: {
        date: new Date().toISOString(),
        title: "新录音",
        audioUrl: "",
        transcription: "",
        background: "",
        participants: [],
        tags: [],
        location: ""
      },
      tag: {
        name: "新标签",
        description: "",
        recordings: []
      },
      user: {
        username: "",
        email: "",
        role: "user"
      },
      comment: {
        recordingId: "",
        userId: "",
        content: ""
      }
    };

    if (templates[templateName]) {
      setJsonContent(JSON.stringify(templates[templateName], null, 2));
      setJsonError(null);
    }
  };

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
            <span className="text-gray-700">新建文档</span>
          </nav>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                添加新文档
              </h1>
              <p className="text-gray-600">
                向 {collectionName} 集合添加新文档
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
                {saving ? '创建中...' : '创建文档'}
              </button>
            </div>
          </div>
        </div>

        {/* 模板选择 */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            快速模板
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => loadTemplate('recording')}
              className="p-3 border border-gray-300 rounded hover:bg-gray-50 text-left"
            >
              <div className="font-medium text-gray-900">录音模板</div>
              <div className="text-sm text-gray-600">录音记录结构</div>
            </button>
            <button
              onClick={() => loadTemplate('tag')}
              className="p-3 border border-gray-300 rounded hover:bg-gray-50 text-left"
            >
              <div className="font-medium text-gray-900">标签模板</div>
              <div className="text-sm text-gray-600">标签结构</div>
            </button>
            <button
              onClick={() => loadTemplate('user')}
              className="p-3 border border-gray-300 rounded hover:bg-gray-50 text-left"
            >
              <div className="font-medium text-gray-900">用户模板</div>
              <div className="text-sm text-gray-600">用户结构</div>
            </button>
            <button
              onClick={() => loadTemplate('comment')}
              className="p-3 border border-gray-300 rounded hover:bg-gray-50 text-left"
            >
              <div className="font-medium text-gray-900">评论模板</div>
              <div className="text-sm text-gray-600">评论结构</div>
            </button>
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
              <h4 className="font-medium text-blue-900 mb-2">创建提示:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 请确保 JSON 格式正确</li>
                <li>• 不需要提供 _id 字段，系统会自动生成</li>
                <li>• createdAt 和 updatedAt 字段会自动添加</li>
                <li>• 可以使用上方的模板快速开始</li>
                <li>• 可以使用&ldquo;格式化&rdquo;按钮整理 JSON 格式</li>
              </ul>
            </div>
          </div>
        </div>

        {/* JSON 预览 */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              预览
            </h2>
          </div>
          <div className="p-6">
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
              {jsonError ? '请修复 JSON 格式错误' : jsonContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}