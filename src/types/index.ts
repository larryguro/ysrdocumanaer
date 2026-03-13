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

// 관리자용 문서 목록 타입
export interface AdminDocumentType {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  menuId?: string;
  menuTitle?: string;
  updatedBy: string;
  updatedAt: string;
  createdAt: string;
}

// 관리자 사용자 타입
export interface AdminUserType {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  isActive: boolean;
  createdAt: string;
}
