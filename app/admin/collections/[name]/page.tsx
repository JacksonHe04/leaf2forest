'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Document {
  _id: string;
  [key: string]: unknown;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * 集合数据查看页面
 * 显示指定集合中的所有文档，支持分页和基本操作
 */
export default function CollectionPage() {
  const params = useParams();
  const collectionName = params.name as string;
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showModal, setShowModal] = useState(false);

  /**
   * 获取集合文档数据
   */
  const fetchDocuments = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/collections/${collectionName}?page=${page}&limit=${pagination.limit}`
      );
      const result = await response.json();
      
      if (result.status === 'success') {
        setDocuments(result.data.documents);
        setPagination(result.data.pagination);
      } else {
        setError('获取数据失败');
      }
    } catch (err) {
      setError('网络错误');
      console.error('获取文档失败:', err);
    } finally {
      setLoading(false);
    }
  }, [collectionName, pagination.limit]);

  /**
   * 删除文档
   */
  const deleteDocument = async (id: string) => {
    if (!confirm('确定要删除这个文档吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/collections/${collectionName}/${id}`,
        { method: 'DELETE' }
      );
      const result = await response.json();
      
      if (result.status === 'success') {
        alert('文档删除成功');
        fetchDocuments(pagination.page);
      } else {
        alert('删除失败: ' + result.error);
      }
    } catch (err) {
      alert('删除失败: 网络错误');
      console.error('删除文档失败:', err);
    }
  };

  /**
   * 格式化显示值
   */
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return `[${value.length} 项]`;
      }
      if (value instanceof Date) {
        return new Date(value).toLocaleString('zh-CN');
      }
      return '{对象}';
    }
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    return String(value);
  };

  /**
   * 获取文档的主要字段
   */
  const getMainFields = (docs: Document[]): string[] => {
    if (docs.length === 0) return [];
    
    const allFields = new Set<string>();
    docs.forEach(doc => {
      Object.keys(doc).forEach(key => allFields.add(key));
    });
    
    // 优先显示常见字段
    const priorityFields = ['_id', 'title', 'name', 'email', 'date', 'createdAt'];
    const otherFields = Array.from(allFields).filter(field => !priorityFields.includes(field));
    
    return [...priorityFields.filter(field => allFields.has(field)), ...otherFields].slice(0, 6);
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const mainFields = getMainFields(documents);

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
            onClick={() => fetchDocuments()}
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
        {/* 页面标题和导航 */}
        <div className="mb-8">
          <nav className="text-sm breadcrumbs mb-4">
            <Link href="/admin" className="text-blue-600 hover:text-blue-800">
              数据库管理
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">{collectionName}</span>
          </nav>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {collectionName} 集合
              </h1>
              <p className="text-gray-600">
                共 {pagination.total} 个文档
              </p>
            </div>
            <Link
              href={`/admin/collections/${collectionName}/new`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              添加文档
            </Link>
          </div>
        </div>

        {/* 文档表格 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {documents.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {mainFields.map((field) => (
                        <th
                          key={field}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {field}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr key={doc._id} className="hover:bg-gray-50">
                        {mainFields.map((field) => (
                          <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatValue(doc[field])}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedDoc(doc);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            查看
                          </button>
                          <Link
                            href={`/admin/collections/${collectionName}/${doc._id}/edit`}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            编辑
                          </Link>
                          <button
                            onClick={() => deleteDocument(doc._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* 分页 */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    显示第 {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} 条，
                    共 {pagination.total} 条记录
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fetchDocuments(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      上一页
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      第 {pagination.page} / {pagination.totalPages} 页
                    </span>
                    <button
                      onClick={() => fetchDocuments(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无文档
              </h3>
              <p className="text-gray-600 mb-4">
                这个集合中还没有任何文档
              </p>
              <Link
                href={`/admin/collections/${collectionName}/new`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                添加第一个文档
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 文档详情模态框 */}
      {showModal && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-auto m-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                文档详情
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4">
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(selectedDoc, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}