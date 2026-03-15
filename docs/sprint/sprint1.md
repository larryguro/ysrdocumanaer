# Sprint 1: 프로젝트 세팅 + 사용자 페이지 레이아웃 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Next.js 14+ App Router 프로젝트를 초기화하고, 사용자 페이지의 전체 레이아웃(헤더, 사이드바, 본문 영역)을 정적 목업 수준으로 구현한다.

**Architecture:** Next.js App Router 기반으로 서버 컴포넌트와 클라이언트 컴포넌트를 명확히 구분한다. 사이드바 Accordion은 상태 관리가 필요하므로 클라이언트 컴포넌트로 구현하고, 레이아웃과 문서 뷰어는 서버 컴포넌트로 구현한다. Mock 데이터는 `lib/mock-data.ts`에 중앙 관리하여 Sprint 3 Supabase 연동 시 교체 지점을 명확히 한다.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, react-markdown, remark-gfm

**Branch:** `sprint1`

**기간:** 1-2주 (2026-03-13 ~ 2026-03-27)

---

## 스프린트 목표

| 항목 | 내용 |
|------|------|
| 목표 | 사용자가 브라우저에서 4 depth 사이드바 메뉴와 Markdown 렌더링 문서를 확인할 수 있는 정적 레이아웃 완성 |
| 범위 | 프로젝트 초기화, 레이아웃 컴포넌트, 사이드바 메뉴, 문서 뷰어, 기본 라우팅 |
| 제외 | 관리자 UI (Sprint 2), Supabase 연동 (Sprint 3), 검색 기능 구현 (Sprint 4), 모바일 최적화 (Sprint 5) |

---

## 기술 결정 사항

### 서버 컴포넌트 vs 클라이언트 컴포넌트 구분

| 컴포넌트 | 종류 | 이유 |
|----------|------|------|
| `app/layout.tsx` | 서버 | 레이아웃 조합만 수행, 상태 불필요 |
| `app/page.tsx` | 서버 | 리다이렉트 로직만 수행 |
| `app/docs/[...slug]/page.tsx` | 서버 | 문서 데이터 조회 (향후 DB) |
| `components/layout/Header.tsx` | 서버 | 정적 헤더 (검색바는 placeholder) |
| `components/layout/Sidebar.tsx` | 서버 | Wrapper, 하위 MenuTree에 데이터 전달 |
| `components/layout/MainContent.tsx` | 서버 | 본문 래퍼 |
| `components/sidebar/MenuTree.tsx` | 서버 | 재귀 렌더링, 데이터 구조만 처리 |
| `components/sidebar/MenuItem.tsx` | **클라이언트** | `'use client'` — Accordion 상태(열기/닫기) 필요 |
| `components/document/DocumentViewer.tsx` | **클라이언트** | `'use client'` — react-markdown SSR 비호환 이슈 가능성 |
| `app/search/page.tsx` | 서버 | Placeholder, 상태 불필요 |

### 디렉토리 구조

```
src/
  app/
    layout.tsx                    # 루트 레이아웃 (Header + Sidebar + MainContent 조합)
    page.tsx                      # 루트 → /docs/sample 리다이렉트
    docs/
      [...slug]/
        page.tsx                  # 문서 뷰어 페이지
    search/
      page.tsx                    # 검색 결과 페이지 (Placeholder)
  components/
    layout/
      Header.tsx                  # 로고, 사이트명, 검색바(비활성 placeholder)
      Sidebar.tsx                 # 사이드바 컨테이너 (MenuTree 포함)
      MainContent.tsx             # 본문 영역 래퍼
    sidebar/
      MenuTree.tsx                # 재귀적 메뉴 트리 렌더링
      MenuItem.tsx                # 개별 메뉴 아이템 (Accordion) — 'use client'
    document/
      DocumentViewer.tsx          # Markdown → HTML 렌더링 — 'use client'
  lib/
    mock-data.ts                  # 정적 Mock 데이터 (메뉴 트리, 샘플 문서)
  types/
    index.ts                      # 공통 타입 정의 (MenuItem, Document 등)
```

### Mock 데이터 설계 (4 depth 메뉴)

```typescript
// lib/mock-data.ts 구조
export interface MenuItemType {
  id: string;
  title: string;
  slug?: string;       // 문서 링크 (leaf node)
  children?: MenuItemType[];
  depth: number;
}

export const MOCK_MENU: MenuItemType[] = [
  {
    id: '1',
    title: '시작하기',
    depth: 1,
    children: [
      { id: '1-1', title: '소개', slug: 'intro', depth: 2 },
      {
        id: '1-2',
        title: '설치',
        depth: 2,
        children: [
          { id: '1-2-1', title: 'Windows', slug: 'install-windows', depth: 3 },
          { id: '1-2-2', title: 'macOS', slug: 'install-macos', depth: 3 },
        ],
      },
    ],
  },
  // ... 4 depth 예시 포함
];
```

---

## 상세 태스크 목록

### Task 1: Next.js 프로젝트 초기화

**Files:**
- Create: `package.json` (npx create-next-app 자동 생성)
- Create: `src/types/index.ts`
- Create: `src/lib/mock-data.ts`
- Modify: `.eslintrc.json`
- Create: `.prettierrc`

**Step 1: Next.js 프로젝트 생성**

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

Expected: 프로젝트 파일 생성 완료, `src/app/` 디렉토리 확인

**Step 2: Prettier 설정 파일 생성**

`/.prettierrc` 파일 생성:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Step 3: 공통 타입 정의 파일 생성**

`src/types/index.ts` 파일 생성:

```typescript
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
```

**Step 4: Mock 데이터 파일 생성**

`src/lib/mock-data.ts` 파일 생성 (4 depth 메뉴 데이터 포함):

```typescript
import { MenuItemType, DocumentType } from '@/types';

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
```

**Step 5: 로컬 서버 실행 확인**

```bash
npm run dev
```

Expected: `http://localhost:3000` 접속 시 Next.js 기본 페이지 표시

**Step 6: 커밋**

```bash
git add src/types/index.ts src/lib/mock-data.ts .prettierrc
git commit -m "feat: 프로젝트 초기화 및 공통 타입/Mock 데이터 설정"
```

---

### Task 2: 공통 레이아웃 컴포넌트 구현

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/MainContent.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Step 1: Header 컴포넌트 생성**

`src/components/layout/Header.tsx`:

```typescript
// 서버 컴포넌트 — 상태 불필요
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
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          관리자
        </Link>
      </div>
    </header>
  );
}
```

**Step 2: MainContent 컴포넌트 생성**

`src/components/layout/MainContent.tsx`:

```typescript
// 서버 컴포넌트 — 본문 영역 래퍼
interface MainContentProps {
  children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 min-w-0 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {children}
      </div>
    </main>
  );
}
```

**Step 3: Sidebar 컴포넌트 생성 (MenuTree import 포함)**

`src/components/layout/Sidebar.tsx` — MenuTree 컴포넌트 생성 후 import:

```typescript
// 서버 컴포넌트 — 사이드바 컨테이너
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
```

**Step 4: 루트 레이아웃 수정**

`src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MainContent from '@/components/layout/MainContent';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '의사랑 기술문서',
  description: '의사랑 프로그램의 변경내역서 및 사용방법 안내',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex flex-1 pt-14">
            <Sidebar />
            <MainContent>{children}</MainContent>
          </div>
        </div>
      </body>
    </html>
  );
}
```

**Step 5: 타입스크립트 에러 없음 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음 (MenuTree 미생성으로 에러 발생 가능 — Task 3 완료 후 재확인)

**Step 6: 커밋**

```bash
git add src/components/layout/ src/app/layout.tsx
git commit -m "feat: 공통 레이아웃 컴포넌트 구현 (Header, Sidebar, MainContent)"
```

---

### Task 3: 사이드바 메뉴 컴포넌트 구현 (Accordion)

**Files:**
- Create: `src/components/sidebar/MenuItem.tsx`
- Create: `src/components/sidebar/MenuTree.tsx`

**Step 1: MenuItem 클라이언트 컴포넌트 생성**

`src/components/sidebar/MenuItem.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuItemType } from '@/types';

interface MenuItemProps {
  item: MenuItemType;
}

export default function MenuItem({ item }: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.slug ? pathname === `/docs/${item.slug}` : false;

  // depth에 따른 들여쓰기 (depth 1은 0, depth 2는 pl-4, depth 3은 pl-8, depth 4는 pl-12)
  const paddingMap: Record<number, string> = {
    1: 'pl-2',
    2: 'pl-6',
    3: 'pl-10',
    4: 'pl-14',
  };
  const padding = paddingMap[item.depth] ?? 'pl-2';

  if (hasChildren) {
    return (
      <li>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between ${padding} py-1.5 pr-2 text-sm rounded-md hover:bg-gray-100 transition-colors text-left ${
            isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
          }`}
          aria-expanded={isOpen}
        >
          <span>{item.title}</span>
          <svg
            className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${
              isOpen ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {isOpen && (
          <ul>
            {item.children!.map((child) => (
              <MenuItem key={child.id} item={child} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={`/docs/${item.slug}`}
        className={`block ${padding} py-1.5 pr-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {item.title}
      </Link>
    </li>
  );
}
```

**Step 2: MenuTree 서버 컴포넌트 생성**

`src/components/sidebar/MenuTree.tsx`:

```typescript
// 서버 컴포넌트 — 재귀적 메뉴 트리 렌더링
import { MenuItemType } from '@/types';
import MenuItem from './MenuItem';

interface MenuTreeProps {
  items: MenuItemType[];
}

export default function MenuTree({ items }: MenuTreeProps) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </ul>
  );
}
```

**Step 3: 로컬 서버에서 사이드바 렌더링 확인**

```bash
npm run dev
```

Expected: `http://localhost:3000` 접속 시 사이드바에 메뉴 트리 표시, 클릭 시 하위 메뉴 토글

**Step 4: TypeScript 타입 에러 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

**Step 5: 커밋**

```bash
git add src/components/sidebar/
git commit -m "feat: 사이드바 Accordion 메뉴 컴포넌트 구현 (4 depth 지원)"
```

---

### Task 4: 문서 뷰어 컴포넌트 구현

**Files:**
- Create: `src/components/document/DocumentViewer.tsx`

**Step 1: react-markdown + remark-gfm 패키지 설치**

```bash
npm install react-markdown remark-gfm
npm install --save-dev @types/node
```

Expected: `package.json`에 의존성 추가 확인

**Step 2: DocumentViewer 클라이언트 컴포넌트 생성**

`src/components/document/DocumentViewer.tsx`:

```typescript
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DocumentViewerProps {
  content: string;
  title: string;
}

export default function DocumentViewer({ content, title }: DocumentViewerProps) {
  return (
    <article className="prose prose-gray max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 헤딩 스타일
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">{children}</h3>
          ),
          // 단락
          p: ({ children }) => (
            <p className="text-gray-700 leading-7 mb-4">{children}</p>
          ),
          // 코드 블록
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-6" {...props}>
                {children}
              </code>
            );
          },
          // 테이블
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border-collapse border border-gray-200">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left text-sm font-semibold text-gray-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">{children}</td>
          ),
          // 목록
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">{children}</ol>
          ),
          // 인용문 (콜아웃)
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-400 bg-blue-50 px-4 py-3 my-4 text-gray-700 rounded-r-md">
              {children}
            </blockquote>
          ),
          // 링크
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-800 underline"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
```

**Step 3: 타입스크립트 에러 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

**Step 4: 커밋**

```bash
git add src/components/document/ package.json package-lock.json
git commit -m "feat: DocumentViewer 컴포넌트 구현 (react-markdown + remark-gfm)"
```

---

### Task 5: 라우팅 설정 및 페이지 구현

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/docs/[...slug]/page.tsx`
- Create: `src/app/search/page.tsx`

**Step 1: 루트 페이지 — 리다이렉트 구현**

`src/app/page.tsx`:

```typescript
import { redirect } from 'next/navigation';

export default function RootPage() {
  // 첫 번째 문서로 리다이렉트 (Sprint 3에서 DB 기반으로 교체)
  redirect('/docs/sample');
}
```

**Step 2: 문서 뷰어 동적 라우팅 페이지 구현**

`src/app/docs/[...slug]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import { MOCK_DOCUMENTS } from '@/lib/mock-data';
import DocumentViewer from '@/components/document/DocumentViewer';

interface DocPageProps {
  params: {
    slug: string[];
  };
}

// 페이지 메타데이터 생성 (Sprint 7에서 DB 기반으로 확장)
export async function generateMetadata({ params }: DocPageProps) {
  const slug = params.slug.join('/');
  const doc = MOCK_DOCUMENTS[slug];

  return {
    title: doc ? `${doc.title} | 의사랑 기술문서` : '문서를 찾을 수 없습니다',
  };
}

export default function DocPage({ params }: DocPageProps) {
  const slug = params.slug.join('/');
  const doc = MOCK_DOCUMENTS[slug];

  if (!doc) {
    notFound();
  }

  return (
    <div>
      <DocumentViewer content={doc.content} title={doc.title} />
    </div>
  );
}
```

**Step 3: 검색 페이지 Placeholder 구현**

`src/app/search/page.tsx`:

```typescript
// 검색 결과 페이지 — Sprint 4에서 기능 구현 예정
interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q ?? '';

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
```

**Step 4: 로컬 서버에서 전체 라우팅 확인**

```bash
npm run dev
```

확인 사항:
- `http://localhost:3000` → `/docs/sample` 리다이렉트
- `http://localhost:3000/docs/sample` → 샘플 문서 렌더링
- `http://localhost:3000/docs/intro` → 소개 문서 렌더링
- `http://localhost:3000/docs/없는문서` → 404 페이지
- `http://localhost:3000/search?q=테스트` → 검색 Placeholder 표시

**Step 5: 빌드 에러 확인**

```bash
npm run build
```

Expected: 빌드 성공, 에러 없음

**Step 6: 커밋**

```bash
git add src/app/
git commit -m "feat: 라우팅 설정 완료 (루트 리다이렉트, 문서 뷰어, 검색 placeholder)"
```

---

### Task 6: 최종 검증 및 정리

**Files:**
- Modify: `src/app/globals.css` (Tailwind 기본 스타일 정리)

**Step 1: TypeScript 전체 타입 검사**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

**Step 2: ESLint 검사**

```bash
npm run lint
```

Expected: 경고/에러 없음 (또는 수정 후 재실행)

**Step 3: 프로덕션 빌드 검사**

```bash
npm run build
```

Expected: 빌드 성공, 경고 최소화

**Step 4: 로컬 서버에서 Playwright MCP 검증 시나리오 실행**

`npm run dev` 실행 후 아래 순서로 검증:

**레이아웃 렌더링 검증:**
1. `browser_navigate` → `http://localhost:3000` 접속
2. `browser_snapshot` → 헤더(로고, 검색바), 사이드바, 본문 영역 존재 확인
3. `browser_console_messages(level: "error")` → 콘솔 에러 없음 확인

**사이드바 메뉴 검증:**
1. `browser_snapshot` → 메뉴 트리 아이템 ("시작하기", "사용 방법", "변경 내역") 존재 확인
2. `browser_click` → "시작하기" Accordion 버튼 클릭
3. `browser_snapshot` → "소개", "설치 가이드" 하위 메뉴 표시 확인
4. `browser_click` → "소개" 메뉴 아이템 클릭
5. `browser_snapshot` → URL이 `/docs/intro`로 변경, active 상태 하이라이트 확인

**문서 뷰어 검증:**
1. `browser_navigate` → `http://localhost:3000/docs/sample` 접속
2. `browser_snapshot` → Markdown 렌더링 결과 확인 (heading, table, code block, blockquote)
3. `browser_console_messages(level: "error")` → 에러 없음 확인

**Step 5: 최종 커밋**

```bash
git add -A
git commit -m "feat: Sprint 1 구현 완료 — 프로젝트 세팅 + 사용자 페이지 레이아웃"
```

---

## 완료 기준 (Definition of Done)

- ⬜ `npm run dev`로 로컬 서버 실행 시 사용자 레이아웃이 정상 렌더링
- ⬜ 사이드바에 4 depth 메뉴가 mock 데이터로 표시
- ⬜ Accordion 클릭으로 하위 메뉴 토글 동작
- ⬜ 현재 페이지 메뉴 항목에 active 상태 하이라이트 표시
- ⬜ 문서 뷰어에서 샘플 Markdown이 정상 렌더링 (heading, paragraph, list, table, code block, blockquote)
- ⬜ 루트(`/`) 접속 시 `/docs/sample`로 리다이렉트
- ⬜ `/docs/없는문서` 접속 시 404 처리
- ⬜ `/search?q=키워드` 접속 시 검색 Placeholder 표시
- ⬜ `npm run build` 빌드 에러 없음
- ⬜ `npx tsc --noEmit` TypeScript 타입 에러 없음
- ⬜ `npm run lint` ESLint 에러 없음
- ⬜ Playwright MCP 검증 시나리오 통과

---

## Playwright MCP 검증 시나리오

> `npm run dev` 실행 상태에서 sprint-close 시점에 자동 검증

### 레이아웃 렌더링 검증

1. `browser_navigate` → `http://localhost:3000` 접속
2. `browser_snapshot` → 헤더(로고 "의사랑 기술문서", 검색바), 사이드바, 본문 영역 존재 확인
3. `browser_console_messages(level: "error")` → 콘솔 에러 없음 확인

### 사이드바 메뉴 검증

1. `browser_snapshot` → "시작하기", "사용 방법", "변경 내역" 1 depth 메뉴 존재 확인
2. `browser_click` → "시작하기" Accordion 버튼 클릭
3. `browser_snapshot` → "소개", "설치 가이드" 2 depth 메뉴 표시 확인
4. `browser_click` → "설치 가이드" Accordion 버튼 클릭
5. `browser_snapshot` → "Windows 설치", "macOS 설치", "고급 설정" 3 depth 메뉴 표시 확인
6. `browser_click` → "고급 설정" Accordion 버튼 클릭
7. `browser_snapshot` → "환경 변수 설정", "네트워크 설정" 4 depth 메뉴 표시 확인
8. `browser_click` → "소개" 메뉴 링크 클릭
9. `browser_snapshot` → URL `/docs/intro` 이동, active 하이라이트 확인

### 문서 뷰어 검증

1. `browser_navigate` → `http://localhost:3000/docs/sample` 접속
2. `browser_snapshot` → 렌더링 확인: H1("샘플 문서"), H2("소개"), 코드 블록, 표, 인용문
3. `browser_console_messages(level: "error")` → 에러 없음 확인

### 리다이렉트 및 404 검증

1. `browser_navigate` → `http://localhost:3000` 접속
2. `browser_snapshot` → URL이 `/docs/sample`로 리다이렉트 확인
3. `browser_navigate` → `http://localhost:3000/docs/존재하지않는문서` 접속
4. `browser_snapshot` → 404 페이지 표시 확인

---

## 리스크 및 주의사항

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| react-markdown SSR 비호환 | 중간 | `DocumentViewer`를 `'use client'`로 구현 (이미 반영) |
| Next.js 15로 자동 설치 시 API 변경 | 중간 | `create-next-app@latest`가 Next.js 15를 설치할 수 있으므로 `params`가 Promise 타입일 수 있음 — `await params` 패턴 적용 |
| Tailwind CSS v4 자동 설치 | 중간 | v4는 설정 방식이 다르므로 설치 버전 확인, 필요 시 v3로 고정 |
| Mock 데이터 slug 불일치 | 낮음 | `MOCK_DOCUMENTS` 키와 URL slug 일치 여부 확인 |
| `usePathname` 사용 시 hydration 경고 | 낮음 | `MenuItem`이 클라이언트 컴포넌트이므로 문제없으나, `suppressHydrationWarning` 필요 시 추가 |

### Next.js 15 대응 (params가 Promise인 경우)

Next.js 15에서는 `params`가 Promise로 변경될 수 있습니다. 이 경우 아래와 같이 수정:

```typescript
// Next.js 15 방식
export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  // ...
}
```

설치된 Next.js 버전 확인 후 적용:

```bash
npm list next
```

---

## 예상 산출물

Sprint 1 완료 시 다음 결과물이 생성됩니다:

```
src/
  app/
    layout.tsx                    # 루트 레이아웃 (완성)
    page.tsx                      # 루트 리다이렉트 (완성)
    docs/
      [...slug]/
        page.tsx                  # 문서 뷰어 페이지 (완성)
    search/
      page.tsx                    # 검색 Placeholder (완성)
  components/
    layout/
      Header.tsx                  # 헤더 (완성)
      Sidebar.tsx                 # 사이드바 컨테이너 (완성)
      MainContent.tsx             # 본문 래퍼 (완성)
    sidebar/
      MenuTree.tsx                # 메뉴 트리 (완성)
      MenuItem.tsx                # Accordion 메뉴 아이템 (완성)
    document/
      DocumentViewer.tsx          # Markdown 뷰어 (완성)
  lib/
    mock-data.ts                  # Mock 데이터 (완성, Sprint 3에서 교체)
  types/
    index.ts                      # 공통 타입 (완성)
```

Sprint 2에서 재사용할 컴포넌트:
- `MenuTree`, `MenuItem` — 관리자 메뉴 관리 UI에서 재사용
- `DocumentViewer` — 관리자 문서 미리보기에서 재사용
- `MainContent` — 관리자 레이아웃에서 재사용

---

## 다음 스프린트 (Sprint 2) 준비사항

- Mock 데이터 유지 (Sprint 3 연동 전까지 사용)
- Sprint 2 브랜치: `sprint1`에서 분기하여 `sprint2` 생성
- Sprint 2 주요 작업: 관리자 레이아웃, 로그인 페이지, 문서 CRUD UI, Milkdown 편집기 통합

---

*작성일: 2026-03-13*
*작성자: sprint-planner 에이전트*
*ROADMAP 기준: Sprint 1 — Phase 1 MVP 첫 번째 스프린트*
