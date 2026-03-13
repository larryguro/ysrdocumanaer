// 메뉴 아이템 타입
export interface MenuItemType {
  id: string;
  title: string;
  slug?: string;
  children?: MenuItemType[];
  depth: number;
  order?: number;
}

// 문서 타입
export interface DocumentType {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published';
  menuId?: string;
  createdAt: string;
  updatedAt: string;
}
