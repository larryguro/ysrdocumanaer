import { MenuItemType, DocumentType, AdminDocumentType, AdminUserType } from '@/types';

export const MOCK_MENU: MenuItemType[] = [
  {
    id: '1',
    title: '시작하기',
    depth: 1,
    children: [
      { id: '1-1', title: '소개', slug: 'intro', depth: 2 },
      {
        id: '1-2',
        title: '설치 가이드',
        depth: 2,
        children: [
          { id: '1-2-1', title: 'Windows 설치', slug: 'install-windows', depth: 3 },
          { id: '1-2-2', title: 'macOS 설치', slug: 'install-macos', depth: 3 },
          {
            id: '1-2-3',
            title: '고급 설정',
            depth: 3,
            children: [
              { id: '1-2-3-1', title: '환경 변수 설정', slug: 'env-setup', depth: 4 },
              { id: '1-2-3-2', title: '네트워크 설정', slug: 'network-setup', depth: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: '사용 방법',
    depth: 1,
    children: [
      { id: '2-1', title: '기본 사용법', slug: 'basic-usage', depth: 2 },
      { id: '2-2', title: '고급 기능', slug: 'advanced', depth: 2 },
    ],
  },
  {
    id: '3',
    title: '변경 내역',
    depth: 1,
    children: [
      { id: '3-1', title: 'v2.0 변경사항', slug: 'changelog-v2', depth: 2 },
      { id: '3-2', title: 'v1.9 변경사항', slug: 'changelog-v1-9', depth: 2 },
    ],
  },
];

export const MOCK_DOCUMENTS: Record<string, DocumentType> = {
  sample: {
    id: 'sample',
    title: '샘플 문서',
    slug: 'sample',
    status: 'published',
    createdAt: '2026-03-13',
    updatedAt: '2026-03-13',
    content: `# 샘플 문서

## 소개

이 문서는 의사랑 기술문서 사이트의 샘플 문서입니다.

## 주요 기능

- 문서 작성 및 편집
- 계층형 메뉴 관리
- Markdown 렌더링

## 코드 예시

\`\`\`typescript
const greeting = (name: string): string => {
  return \`안녕하세요, \${name}!\`;
};
\`\`\`

## 표 예시

| 항목 | 설명 | 비고 |
|------|------|------|
| 문서 | Markdown 형식 | GFM 지원 |
| 메뉴 | 4 depth 계층형 | Accordion |
| 편집기 | Milkdown WYSIWYG | Sprint 2 |

## 콜아웃

> **참고:** 이 내용은 중요한 정보입니다.

## 목록

1. 첫 번째 항목
2. 두 번째 항목
   - 하위 항목 A
   - 하위 항목 B
`,
  },
  intro: {
    id: 'intro',
    title: '소개',
    slug: 'intro',
    status: 'published',
    createdAt: '2026-03-13',
    updatedAt: '2026-03-13',
    content: `# 소개

의사랑 기술문서 플랫폼에 오신 것을 환영합니다.

이 플랫폼에서는 의사랑 프로그램의 **변경내역서**와 **사용방법**을 확인하실 수 있습니다.
`,
  },
};

export const MOCK_ADMIN_DOCUMENTS: AdminDocumentType[] = [
  {
    id: '1',
    title: '의사랑 v2.0 변경내역서',
    slug: 'changelog-v2',
    status: 'published',
    menuId: '3-1',
    menuTitle: 'v2.0 변경사항',
    updatedBy: 'admin@example.com',
    updatedAt: '2026-03-13',
    createdAt: '2026-03-01',
  },
  {
    id: '2',
    title: '의사랑 v1.9 변경내역서',
    slug: 'changelog-v1-9',
    status: 'published',
    menuId: '3-2',
    menuTitle: 'v1.9 변경사항',
    updatedBy: 'admin@example.com',
    updatedAt: '2026-02-15',
    createdAt: '2026-02-01',
  },
  {
    id: '3',
    title: 'Windows 설치 가이드',
    slug: 'install-windows',
    status: 'published',
    menuId: '1-2-1',
    menuTitle: 'Windows 설치',
    updatedBy: 'admin@example.com',
    updatedAt: '2026-03-10',
    createdAt: '2026-02-20',
  },
  {
    id: '4',
    title: 'macOS 설치 가이드',
    slug: 'install-macos',
    status: 'draft',
    menuId: '1-2-2',
    menuTitle: 'macOS 설치',
    updatedBy: 'admin@example.com',
    updatedAt: '2026-03-12',
    createdAt: '2026-03-05',
  },
  {
    id: '5',
    title: '네트워크 설정 가이드',
    slug: 'network-setup',
    status: 'draft',
    menuId: '1-2-3-2',
    menuTitle: '네트워크 설정',
    updatedBy: 'admin@example.com',
    updatedAt: '2026-03-13',
    createdAt: '2026-03-13',
  },
];

export const MOCK_ADMIN_USERS: AdminUserType[] = [
  {
    id: 'u1',
    email: 'admin@example.com',
    name: '관리자',
    role: 'admin',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'u2',
    email: 'editor@example.com',
    name: '편집자',
    role: 'admin',
    isActive: true,
    createdAt: '2026-02-01',
  },
  {
    id: 'u3',
    email: 'readonly@example.com',
    name: '열람자',
    role: 'admin',
    isActive: false,
    createdAt: '2026-02-15',
  },
];
