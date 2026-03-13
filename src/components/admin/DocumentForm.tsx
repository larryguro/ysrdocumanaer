'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MenuItemType } from '@/types';

// TipTap은 DOM 의존 → SSR 비활성화
const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), {
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
  documentId?: string;
  initialTitle?: string;
  initialSlug?: string;
  initialContent?: string;
  initialStatus?: 'draft' | 'published';
  initialMenuId?: string;
}

export default function DocumentForm({
  mode,
  documentId,
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
  const [menuOptions, setMenuOptions] = useState<Array<{ id: string; title: string; depth: number }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 메뉴 목록 로드
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('menus')
      .select('*')
      .order('order_index')
      .then(({ data }) => {
        if (data) {
          // flat 데이터를 트리 변환 없이 depth 기준으로 들여쓰기 표시
          setMenuOptions(
            data.map((m) => ({ id: m.id, title: m.title, depth: m.depth - 1 }))
          );
        }
      });
  }, []);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('제목을 입력해주세요.'); return; }
    if (!slug.trim())  { setError('슬러그를 입력해주세요.'); return; }

    setIsSaving(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (mode === 'new') {
      const { error: insertError } = await supabase.from('documents').insert({
        title: title.trim(),
        slug: slug.trim(),
        content,
        status,
        menu_id: menuId || null,
        created_by: user?.id,
        updated_by: user?.id,
      });
      if (insertError) {
        setError(insertError.message);
        setIsSaving(false);
        return;
      }
    } else {
      // 수정 이력 저장 후 문서 업데이트
      if (documentId) {
        await supabase.from('document_history').insert({
          document_id: documentId,
          content: initialContent || '',
          updated_by: user?.id,
        });
      }
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          title: title.trim(),
          slug: slug.trim(),
          content,
          status,
          menu_id: menuId || null,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId!);

      if (updateError) {
        setError(updateError.message);
        setIsSaving(false);
        return;
      }
    }

    router.push('/admin/documents');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'new' ? '새 문서 작성' : '문서 수정'}
        </h1>
        <div className="flex items-center gap-3">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Link
            href="/admin/documents"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '저장'}
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
            <TiptapEditor
              defaultValue={initialContent || '# 제목\n\n내용을 작성하세요.'}
              onChange={setContent}
              slug={slug}
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
