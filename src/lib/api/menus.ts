import { MenuItemType } from '@/types';

interface DbMenu {
  id: string;
  parent_id: string | null;
  title: string;
  depth: number;
  order_index: number;
  slug?: string;
}

/** DB에서 가져온 flat 메뉴 목록을 트리 구조로 변환 */
export function buildMenuTree(items: DbMenu[], parentId: string | null = null): MenuItemType[] {
  return items
    .filter((item) => item.parent_id === parentId)
    .sort((a, b) => a.order_index - b.order_index)
    .map((item) => ({
      id: item.id,
      title: item.title,
      depth: item.depth,
      slug: item.slug,
      children: buildMenuTree(items, item.id),
    }));
}
