'use client';

import Link from 'next/link';

export default function AdminHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-gray-900 border-b border-gray-700 flex items-center px-4">
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link href="/admin/documents" className="text-lg font-bold text-white">
          의사랑 관리자
        </Link>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">admin@example.com</span>
        {/* Sprint 3에서 Supabase Auth 로그아웃 연동 */}
        <button
          className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 border border-gray-600 rounded hover:border-gray-400"
          onClick={() => console.log('로그아웃 클릭 (Sprint 3에서 연동)')}
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
