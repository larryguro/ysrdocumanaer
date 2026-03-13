'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { MOCK_MENU } from '@/lib/mock-data';
import { MenuItemType } from '@/types';

// Milkdown은 SSR 비활성화로 동적 임포트
const MilkdownEditor = dynamic(() => import('@/components/editor/MilkdownEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-md min-h-[400px] flex items-center justify-center text-gray-400 bg-gray-50">
      편집기 로딩 중...
    </div>
  ),
});

// 메뉴 트리를 flat한 옵션 목록으로 변환
function flattenMenu(
  items: MenuItemType[],
  depth = 0
): Array<{ id: string; title: string; depth: number }> {
  const result: Array<{ id: string; title: string; depth: number }> = [];
  for (const item of items) {
    result.push({ id: item.id, title: item.title, depth });
    if (item.children) {
      result.push(...flattenMenu(item.children, depth + 1));
    }
  }
  return result;
}

interface DocumentFormProps {
  mode: 'new' | 'edit';
  initialTitle?: string;
  initialSlug?: string;
  initialContent?: string;
  initialStatus?: 'draft' | 'published';
  initialMenuId?: string;
}

export default function DocumentForm({
  mode,
  initialTitle = '',
  initialSlug = '',
  initialContent = '',
  initialStatus = 'draft',
  initialMenuId = '',
}: DocumentFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<'draft' | 'published'>(initialStatus);
  const [menuId, setMenuId] = useState(initialMenuId);
  const [isSlugManual, setIsSlugManual] = useState(!!initialSlug);

  const menuOptions = flattenMenu(MOCK_MENU);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isSlugManual) {
      const autoSlug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-가-힣]/g, '')
        .slice(0, 50);
      setSlug(autoSlug);
    }
  }

  function handleSlugChange(value: string) {
    setIsSlugManual(true);
    setSlug(value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Sprint 3에서 Supabase 연동 예정
    console.log('문서 저장:', { title, slug, content, status, menuId });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'new' ? '새 문서 작성' : '문서 수정'}
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/documents"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            저장
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 메인 편집 영역 */}
        <div className="col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="문서 제목을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">슬러그 (URL 경로)</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">/docs/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="url-slug"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">제목 입력 시 자동 생성됩니다. 직접 수정도 가능합니다.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">본문</label>
            <MilkdownEditor
              defaultValue={initialContent || '# 제목\n\n내용을 작성하세요.'}
              onChange={setContent}
            />
          </div>
        </div>

        {/* 사이드바 메타 정보 */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">게시 설정</h2>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">초안</option>
                <option value="published">게시됨</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">메뉴 연결</label>
              <select
                value={menuId}
                onChange={(e) => setMenuId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">메뉴 선택 (선택 사항)</option>
                {menuOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {'　'.repeat(opt.depth)}
                    {opt.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
