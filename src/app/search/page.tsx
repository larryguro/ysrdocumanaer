// 검색 결과 페이지 — Sprint 4에서 기능 구현 예정
interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q ?? '';

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">검색 결과</h1>
      {query ? (
        <p className="text-gray-500">
          &quot;{query}&quot; 에 대한 검색 결과입니다. (Sprint 4에서 구현 예정)
        </p>
      ) : (
        <p className="text-gray-500">검색어를 입력해주세요.</p>
      )}
    </div>
  );
}
