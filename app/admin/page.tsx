'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CollectionInfo {
  name: string;
  count: number;
}

/**
 * 数据库管理主页面
 * 显示所有集合的列表和基本信息
 */
export default function AdminPage() {
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取集合列表
   */
  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/collections');
      const result = await response.json();
      
      if (result.status === 'success') {
        setCollections(result.data);
      } else {
        setError('获取集合列表失败');
      }
    } catch (err) {
      setError('网络错误');
      console.error('获取集合列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

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
          <button
            onClick={fetchCollections}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            数据库管理后台
          </h1>
          <p className="text-gray-600">
            管理 MongoDB 数据库中的所有集合和文档
          </p>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              总集合数
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {collections.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              总文档数
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {collections.reduce((sum, col) => sum + col.count, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              数据库
            </h3>
            <p className="text-lg font-medium text-gray-700">
              leaf-to-forest
            </p>
          </div>
        </div>

        {/* 集合列表 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              数据集合
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    集合名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    文档数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collections.map((collection) => (
                  <tr key={collection.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {collection.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {collection.count} 个文档
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/collections/${collection.name}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        查看数据
                      </Link>
                      <Link
                        href={`/admin/collections/${collection.name}/new`}
                        className="text-green-600 hover:text-green-900"
                      >
                        添加文档
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 如果没有集合 */}
        {collections.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              暂无数据集合
            </h3>
            <p className="text-gray-600">
              数据库中还没有任何集合
            </p>
          </div>
        )}
      </div>
    </div>
  );
}