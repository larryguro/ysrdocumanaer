import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center px-4">
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link href="/" className="text-lg font-bold text-gray-900">
          의사랑 기술문서
        </Link>
      </div>
      <div className="flex-1 max-w-xl mx-auto px-4">
        {/* Sprint 4에서 기능 활성화 예정 */}
        <div className="relative">
          <input
            type="text"
            placeholder="문서 검색..."
            disabled
            className="w-full px-4 py-1.5 text-sm bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed text-gray-400"
          />
        </div>
      </div>
      <div className="flex-shrink-0">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          관리자
        </Link>
      </div>
    </header>
  );
}
