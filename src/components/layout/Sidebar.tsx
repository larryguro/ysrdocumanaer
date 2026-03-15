import { createClient } from '@/lib/supabase/server';
import { buildMenuTree } from '@/lib/api/menus';
import MenuTree from '@/components/sidebar/MenuTree';

export default async function Sidebar() {
  const supabase = await createClient();

  const [{ data: menuData }, { data: docData }] = await Promise.all([
    supabase.from('menus').select('*').order('order_index'),
    supabase.from('documents').select('menu_id, slug').eq('status', 'published'),
  ]);

  // menu_id → 첫 번째 게시 문서의 slug 맵
  const slugByMenuId: Record<string, string> = {};
  for (const doc of docData ?? []) {
    if (doc.menu_id && !slugByMenuId[doc.menu_id]) {
      slugByMenuId[doc.menu_id] = doc.slug;
    }
  }

  const menusWithSlugs = (menuData ?? []).map((m) => ({
    ...m,
    slug: slugByMenuId[m.id],
  }));

  const menuItems = buildMenuTree(menusWithSlugs);

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
      <nav className="p-4">
        <MenuTree items={menuItems} />
      </nav>
    </aside>
  );
}
