import { createClient } from '@/lib/supabase/server';
import { buildMenuTree } from '@/lib/api/menus';
import MenuTree from '@/components/sidebar/MenuTree';

export default async function Sidebar() {
  const supabase = await createClient();
  const { data } = await supabase.from('menus').select('*').order('order_index');
  const menuItems = buildMenuTree(data ?? []);

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
      <nav className="p-4">
        <MenuTree items={menuItems} />
      </nav>
    </aside>
  );
}
