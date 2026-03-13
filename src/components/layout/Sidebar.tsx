import { MOCK_MENU } from '@/lib/mock-data';
import MenuTree from '@/components/sidebar/MenuTree';

export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
      <nav className="p-4">
        <MenuTree items={MOCK_MENU} />
      </nav>
    </aside>
  );
}
