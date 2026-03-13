import { MOCK_MENU } from '@/lib/mock-data';
import MenuTreeEditor from '@/components/admin/MenuTreeEditor';

export default function MenusPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">메뉴 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          사용자 페이지에 표시될 메뉴 구조를 관리합니다. 드래그앤드롭 정렬은 Sprint 5에서 추가됩니다.
        </p>
      </div>
      <MenuTreeEditor initialMenu={MOCK_MENU} />
    </div>
  );
}
