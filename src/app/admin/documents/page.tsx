'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AdminDocumentType } from '@/types';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  published: { label: '게시됨', className: 'bg-green-100 text-green-700' },
  draft: { label: '초안', className: 'bg-gray-100 text-gray-600' },
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<AdminDocumentType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('documents')
      .select('*, menus(title)')
      .order('updated_at', { ascending: false });

    if (data) {
      setDocuments(
        data.map((doc) => ({
          id: doc.id,
          title: doc.title,
          slug: doc.slug,
          status: doc.status as 'draft' | 'published',
          menuId: doc.menu_id ?? undefined,
          menuTitle: (doc.menus as { title: string } | null)?.title ?? undefined,
          updatedBy: '관리자',
          updatedAt: doc.updated_at?.split('T')[0] ?? '',
          createdAt: doc.created_at?.split('T')[0] ?? '',
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  async function handleDelete(id: string) {
    if (!confirm('문서를 삭제하시겠습니까?')) return;
    const supabase = createClient();
    await supabase.from('documents').delete().eq('id', id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">문서 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {documents.length}개의 문서</p>
        </div>
        <Link
          href="/admin/documents/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 새 문서 작성
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            불러오는 중...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[35%]">제목</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[15%]">메뉴</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[10%]">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[15%]">수정자</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[12%]">수정일</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 w-[13%]">작업</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                    문서가 없습니다. 새 문서를 작성해보세요.
                  </td>
                </tr>
              ) : (
                documents.map((doc, index) => {
                  const badge = STATUS_BADGE[doc.status];
                  return (
                    <tr
                      key={doc.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index === documents.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/documents/${doc.id}/edit`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {doc.title}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">/{doc.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{doc.menuTitle ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{doc.updatedBy}</td>
                      <td className="px-4 py-3 text-gray-500">{doc.updatedAt}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/documents/${doc.id}/edit`}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            편집
                          </Link>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
