# Sprint 2: 관리자 UI (프론트엔드) 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 관리자 페이지의 전체 UI를 정적 목업 수준으로 구현한다. 로그인 폼, 문서 CRUD 화면, Milkdown WYSIWYG 편집기, 메뉴 관리, 사용자 관리 화면을 포함한다.

**Architecture:** `/admin` 경로에 사용자 레이아웃과 완전히 분리된 별도 `app/admin/layout.tsx`를 사용한다. Milkdown은 클라이언트 전용 라이브러리이므로 `dynamic import` + SSR 비활성화로 처리한다. 모든 데이터는 mock 데이터로 렌더링하며, Supabase 연동은 Sprint 3에서 수행한다.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, `@milkdown/core`, `@milkdown/react`, `@milkdown/preset-commonmark`, `@milkdown/preset-gfm`

**Branch:** `sprint2`

**기간:** 1-2주 (2026-03-13 ~ 2026-03-27)

---

## 스프린트 목표

| 항목 | 내용 |
|------|------|
| 목표 | 관리자가 `/admin/*` 경로에서 문서 목록, 작성/수정(Milkdown), 메뉴 관리, 사용자 관리를 정적 UI로 확인할 수 있는 상태 완성 |
| 범위 | 관리자 레이아웃, 로그인 폼 UI, 문서 목록/작성/수정, Milkdown 편집기 통합, 메뉴 관리, 사용자 관리 |
| 제외 | Supabase 인증/인가 (Sprint 3), 실제 데이터 CRUD (Sprint 3), 드래그앤드롭 (Sprint 5), 모바일 최적화 (Sprint 5) |

---

## 기술 결정 사항

### 서버 컴포넌트 vs 클라이언트 컴포넌트 구분

| 컴포넌트 | 종류 | 이유 |
|----------|------|------|
| `app/admin/layout.tsx` | 서버 | 레이아웃 조합만 수행 |
| `app/admin/login/page.tsx` | **클라이언트** | 폼 상태, 유효성 검사 상태 필요 |
| `app/admin/documents/page.tsx` | 서버 | mock 데이터 렌더링, 상태 불필요 |
| `app/admin/documents/new/page.tsx` | 서버 | MilkdownEditor를 동적 임포트로 포함 |
| `app/admin/documents/[id]/edit/page.tsx` | 서버 | params await 처리 + MilkdownEditor 동적 임포트 |
| `components/admin/AdminSidebar.tsx` | **클라이언트** | 현재 경로 하이라이트를 위해 `usePathname` 사용 |
| `components/admin/AdminHeader.tsx` | 서버 | 정적 헤더 (로그아웃은 Sprint 3에서 연동) |
| `components/editor/MilkdownEditor.tsx` | **클라이언트** | `'use client'` 필수, Milkdown은 DOM 의존성 |
| `app/admin/menus/page.tsx` | **클라이언트** | 메뉴 추가/삭제 상태 관리 필요 |
| `app/admin/users/page.tsx` | **클라이언트** | 모달 열기/닫기 상태 필요 |

### Next.js 16 params 처리 방식

Next.js 16에서 동적 라우트의 `params`는 `Promise<{}>` 타입이다. 반드시 `await`로 처리해야 한다.

```typescript
// 올바른 방법
export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ...
}
```

### Milkdown 패키지 구성

```
@milkdown/core          — Milkdown 코어 엔진
@milkdown/react         — React 바인딩 (Milkdown, MilkdownProvider)
@milkdown/preset-commonmark — 기본 Markdown 플러그인
@milkdown/preset-gfm    — GFM 확장 (표, 체크박스 등)
@milkdown/plugin-listener — 편집기 내용 변경 감지
```

### 디렉토리 구조 (Sprint 2 추가분)

```
src/
  app/
    admin/
      layout.tsx                      # 관리자 전용 레이아웃 (AdminHeader + AdminSidebar)
      page.tsx                        # /admin → /admin/documents 리다이렉트
      login/
        page.tsx                      # 로그인 폼 UI (클라이언트 컴포넌트)
      documents/
        page.tsx                      # 문서 목록 테이블
        new/
          page.tsx                    # 문서 작성 페이지
        [id]/
          edit/
            page.tsx                  # 문서 수정 페이지
  components/
    admin/
      AdminHeader.tsx                 # 관리자 헤더 (로고 + 로그아웃 버튼 placeholder)
      AdminSidebar.tsx                # 관리자 사이드바 네비게이션
      MenuTreeEditor.tsx              # 메뉴 추가/삭제/이름변경 UI
      UserTable.tsx                   # 사용자 목록 테이블
      UserAddModal.tsx                # 사용자 추가 모달
    editor/
      MilkdownEditor.tsx              # Milkdown WYSIWYG 편집기 래퍼
  lib/
    mock-data.ts                      # 기존 + 관리자용 mock 데이터 추가
```

---

## Mock 데이터 확장 계획

Sprint 1의 `src/lib/mock-data.ts`에 관리자용 mock 데이터를 추가한다.

```typescript
// 추가할 타입 (src/types/index.ts)
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

export interface AdminUserType {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  isActive: boolean;
  createdAt: string;
}
```

---

## Task 1: Milkdown 패키지 설치 및 PoC 검증

> Milkdown 통합은 이 스프린트의 핵심 난이도이므로 가장 먼저 PoC를 수행한다.
> PoC가 성공해야 나머지 작업을 안전하게 진행할 수 있다.

**Files:**
- Modify: `package.json` (의존성 추가)
- Create: `src/components/editor/MilkdownEditor.tsx`
- Create: `src/app/admin/poc/page.tsx` (PoC 전용 임시 페이지, Task 완료 후 삭제)

### Step 1: Milkdown 관련 패키지 설치

```bash
cd "D:/QA_dev/qlaude_test/hackerthon26/ysrdocumanaer"
npm install @milkdown/core @milkdown/react @milkdown/preset-commonmark @milkdown/preset-gfm @milkdown/plugin-listener
```

설치 후 `package.json`의 `dependencies`에 다음이 추가됐는지 확인:
- `@milkdown/core`
- `@milkdown/react`
- `@milkdown/preset-commonmark`
- `@milkdown/preset-gfm`
- `@milkdown/plugin-listener`

### Step 2: MilkdownEditor 컴포넌트 작성

`src/components/editor/MilkdownEditor.tsx`를 생성한다.

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';

interface MilkdownEditorInnerProps {
  defaultValue?: string;
  onChange?: (markdown: string) => void;
}

function MilkdownEditorInner({ defaultValue = '', onChange }: MilkdownEditorInnerProps) {
  const { get } = useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        if (defaultValue) {
          ctx.set(defaultValueCtx, defaultValue);
        }
        ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
          onChange?.(markdown);
        });
      })
      .use(commonmark)
      .use(gfm)
      .use(listener)
  );

  return <Milkdown />;
}

interface MilkdownEditorProps {
  defaultValue?: string;
  onChange?: (markdown: string) => void;
  className?: string;
}

export default function MilkdownEditor({ defaultValue, onChange, className }: MilkdownEditorProps) {
  return (
    <MilkdownProvider>
      <div className={`milkdown-wrapper border border-gray-300 rounded-md min-h-[400px] p-4 ${className ?? ''}`}>
        <MilkdownEditorInner defaultValue={defaultValue} onChange={onChange} />
      </div>
    </MilkdownProvider>
  );
}
```

### Step 3: PoC 페이지 작성

`src/app/admin/poc/page.tsx`를 생성한다 (PoC 검증 후 삭제).

```typescript
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const MilkdownEditor = dynamic(() => import('@/components/editor/MilkdownEditor'), {
  ssr: false,
  loading: () => <div className="border border-gray-300 rounded-md min-h-[400px] flex items-center justify-center text-gray-400">편집기 로딩 중...</div>,
});

export default function PocPage() {
  const [content, setContent] = useState('');

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Milkdown PoC</h1>
      <MilkdownEditor
        defaultValue="# 테스트\n\n**굵은 글씨**와 *이탤릭*을 입력해보세요."
        onChange={setContent}
      />
      <div className="mt-4 p-4 bg-gray-100 rounded-md">
        <h2 className="text-sm font-semibold text-gray-600 mb-2">Markdown 출력:</h2>
        <pre className="text-xs text-gray-700 whitespace-pre-wrap">{content}</pre>
      </div>
    </div>
  );
}
```

### Step 4: PoC 검증 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000/admin/poc` 접속 후 확인:
- ⬜ 편집기가 렌더링된다
- ⬜ 텍스트 입력이 가능하다
- ⬜ 하단 Markdown 출력 영역에 변경된 내용이 반영된다
- ⬜ 브라우저 콘솔에 에러가 없다

**PoC 실패 시 대응:** `@milkdown/core` 버전 충돌이 발생하면 `@milkdown/kit` 단일 패키지 방식으로 전환한다.
```bash
npm uninstall @milkdown/core @milkdown/react @milkdown/preset-commonmark @milkdown/preset-gfm @milkdown/plugin-listener
npm install @milkdown/kit
```
그 후 `MilkdownEditor.tsx`의 임포트 경로를 `@milkdown/kit`으로 수정한다.

### Step 5: 빌드 에러 확인

```bash
npm run build
```

예상 결과: 빌드 성공 (경고는 허용, 에러는 불허)

### Step 6: PoC 페이지 삭제 및 커밋

```bash
# PoC 페이지 삭제
rm "src/app/admin/poc/page.tsx"
rmdir "src/app/admin/poc"

git add src/components/editor/MilkdownEditor.tsx package.json package-lock.json
git commit -m "feat: Milkdown 편집기 컴포넌트 추가 및 PoC 검증 완료"
```

---

## Task 2: 관리자 레이아웃 (AdminHeader, AdminSidebar, layout.tsx)

**Files:**
- Create: `src/components/admin/AdminHeader.tsx`
- Create: `src/components/admin/AdminSidebar.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`

### Step 1: AdminHeader 컴포넌트 작성

`src/components/admin/AdminHeader.tsx`를 생성한다.

```typescript
import Link from 'next/link';

export default function AdminHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-gray-900 border-b border-gray-700 flex items-center px-4">
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link href="/admin/documents" className="text-lg font-bold text-white">
          의사랑 관리자
        </Link>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">admin@example.com</span>
        {/* Sprint 3에서 Supabase Auth 로그아웃 연동 */}
        <button
          className="text-sm text-gray-400 hover:text-white transition-colors"
          onClick={() => console.log('로그아웃 클릭 (Sprint 3에서 연동)')}
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
```

> **주의:** `onClick`이 있으므로 이 컴포넌트는 `'use client'`가 필요하다. 단, Sprint 3 연동 전까지는 단순 `console.log`이므로 서버 컴포넌트로 유지하고 버튼에 `onClick`을 제거하거나, 로그아웃 버튼을 별도 클라이언트 컴포넌트로 분리한다. 여기서는 간단하게 `'use client'`를 추가한다.

수정된 버전:

```typescript
'use client';

import Link from 'next/link';

export default function AdminHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-gray-900 border-b border-gray-700 flex items-center px-4">
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link href="/admin/documents" className="text-lg font-bold text-white">
          의사랑 관리자
        </Link>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">admin@example.com</span>
        {/* Sprint 3에서 Supabase Auth 로그아웃 연동 */}
        <button
          className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 border border-gray-600 rounded hover:border-gray-400"
          onClick={() => console.log('로그아웃 클릭 (Sprint 3에서 연동)')}
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
```

### Step 2: AdminSidebar 컴포넌트 작성

`src/components/admin/AdminSidebar.tsx`를 생성한다.
`usePathname`을 사용하여 현재 경로를 하이라이트한다.

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin/documents', label: '문서 관리', icon: '📄' },
  { href: '/admin/menus', label: '메뉴 관리', icon: '📋' },
  { href: '/admin/users', label: '사용자 관리', icon: '👥' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-14 left-0 w-56 h-[calc(100vh-3.5rem)] bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-gray-700 text-white font-medium'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
```

### Step 3: 관리자 layout.tsx 작성

`src/app/admin/layout.tsx`를 생성한다.
이 파일이 `/admin/*` 경로 전체에 적용되는 레이아웃이다.
루트 `app/layout.tsx`의 `<html>/<body>` 태그와 충돌하지 않도록 주의한다.

```typescript
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex pt-14">
        <AdminSidebar />
        <main className="flex-1 ml-56 p-6 min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
```

> **중요:** `app/admin/layout.tsx`는 `app/layout.tsx`의 자식이다. 루트 레이아웃이 이미 `<html>`, `<body>`, `Header`, `Sidebar`를 렌더링하고 있다. 이 구조를 막기 위해 `app/layout.tsx`를 수정하여 `/admin` 경로에서는 사용자 레이아웃(Header, Sidebar)이 적용되지 않도록 해야 한다.

**`app/layout.tsx` 수정 전략:**
`/admin` 경로는 완전히 별도 레이아웃이 필요하므로, 루트 `layout.tsx`에서 `Header`와 `Sidebar`를 제거하고, 사용자 페이지용 레이아웃을 별도 `app/(user)/layout.tsx`로 분리하는 Route Group 방식을 사용한다.

**수정된 디렉토리 구조:**

```
src/app/
  layout.tsx              # 루트 레이아웃: <html>, <body>만 포함
  (user)/                 # Route Group — URL에 영향 없음
    layout.tsx            # 사용자 레이아웃: Header + Sidebar
    page.tsx              # /  → /docs/sample 리다이렉트
    docs/
      [...slug]/
        page.tsx
    search/
      page.tsx
  admin/
    layout.tsx            # 관리자 레이아웃: AdminHeader + AdminSidebar
    page.tsx              # /admin → /admin/documents 리다이렉트
    ...
```

### Step 4: 루트 layout.tsx를 최소화하고 Route Group 구성

**`src/app/layout.tsx` 수정** (최소 루트 레이아웃으로 변경):

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '의사랑 기술문서',
  description: '의사랑 프로그램의 변경내역서 및 사용방법 안내',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

**`src/app/(user)/layout.tsx` 생성** (사용자 레이아웃):

```typescript
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MainContent from '@/components/layout/MainContent';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 pt-14">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}
```

**기존 파일 이동:**
- `src/app/page.tsx` → `src/app/(user)/page.tsx`
- `src/app/docs/` → `src/app/(user)/docs/`
- `src/app/search/` → `src/app/(user)/search/`

### Step 5: /admin 루트 리다이렉트 페이지 작성

`src/app/admin/page.tsx`를 생성한다.

```typescript
import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/documents');
}
```

### Step 6: 개발 서버 실행 및 레이아웃 확인

```bash
npm run dev
```

브라우저 확인:
- `http://localhost:3000` → 사용자 레이아웃(흰 헤더, 사이드바) 정상 표시
- `http://localhost:3000/admin` → `/admin/documents`로 리다이렉트 (404는 정상 — 아직 documents 페이지 미생성)
- `http://localhost:3000/admin/login` → 관리자 레이아웃 표시 (어두운 헤더, 왼쪽 사이드바)

### Step 7: 빌드 확인 및 커밋

```bash
npm run build
```

```bash
git add src/app/layout.tsx src/app/\(user\)/ src/app/admin/layout.tsx src/app/admin/page.tsx src/components/admin/AdminHeader.tsx src/components/admin/AdminSidebar.tsx
git commit -m "feat: 관리자 레이아웃 구성 및 Route Group으로 사용자/관리자 레이아웃 분리"
```

---

## Task 3: 관리자 Mock 데이터 추가

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/lib/mock-data.ts`

### Step 1: 타입 정의 추가

`src/types/index.ts`에 관리자용 타입을 추가한다.

```typescript
// 기존 타입 아래에 추가

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
```

### Step 2: Mock 데이터 추가

`src/lib/mock-data.ts` 파일에 관리자용 mock 데이터를 추가한다.

```typescript
// 기존 import 아래에 추가
import { MenuItemType, DocumentType, AdminDocumentType, AdminUserType } from '@/types';

// ... 기존 MOCK_MENU, MOCK_DOCUMENTS 유지 ...

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
```

### Step 3: 커밋

```bash
git add src/types/index.ts src/lib/mock-data.ts
git commit -m "feat: 관리자용 타입 및 mock 데이터 추가"
```

---

## Task 4: 로그인 페이지

**Files:**
- Create: `src/app/admin/login/page.tsx`

### Step 1: 로그인 페이지 작성

`src/app/admin/login/page.tsx`를 생성한다.
이 페이지는 클라이언트 컴포넌트다 (폼 상태, 유효성 검사 상태 필요).

```typescript
'use client';

import { useState } from 'react';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate(): FormErrors {
    const newErrors: FormErrors = {};
    if (!email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    // Sprint 3에서 Supabase Auth 연동 예정
    console.log('로그인 시도:', { email, password });
    await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">의사랑 관리자</h1>
          <p className="text-sm text-gray-500 mt-1">관리자 계정으로 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

> **주의:** `/admin/login` 페이지는 관리자 레이아웃(`AdminHeader` + `AdminSidebar`)이 적용된다.
> 로그인 페이지에는 관리자 레이아웃이 적용되면 이상하므로, `app/admin/login/layout.tsx`를 생성하여 레이아웃을 덮어쓴다.

**`src/app/admin/login/layout.tsx` 생성:**

```typescript
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  // 로그인 페이지는 관리자 레이아웃 없이 풀스크린으로 표시
  return <>{children}</>;
}
```

### Step 2: 개발 서버에서 확인

```bash
npm run dev
```

`http://localhost:3000/admin/login` 접속 확인:
- ⬜ 이메일/비밀번호 입력 폼이 중앙에 렌더링된다
- ⬜ 빈 상태로 로그인 버튼 클릭 시 유효성 검사 에러가 표시된다
- ⬜ 이메일 형식이 잘못된 경우 에러가 표시된다
- ⬜ 올바른 입력 후 제출 시 로딩 상태가 표시된다

### Step 3: 커밋

```bash
git add src/app/admin/login/
git commit -m "feat: 관리자 로그인 페이지 UI 구현 (유효성 검사 포함)"
```

---

## Task 5: 문서 목록 페이지

**Files:**
- Create: `src/app/admin/documents/page.tsx`

### Step 1: 문서 목록 페이지 작성

`src/app/admin/documents/page.tsx`를 생성한다.

```typescript
import Link from 'next/link';
import { MOCK_ADMIN_DOCUMENTS } from '@/lib/mock-data';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  published: { label: '게시됨', className: 'bg-green-100 text-green-700' },
  draft: { label: '초안', className: 'bg-gray-100 text-gray-600' },
};

export default function DocumentsPage() {
  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">문서 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {MOCK_ADMIN_DOCUMENTS.length}개의 문서</p>
        </div>
        <Link
          href="/admin/documents/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 새 문서 작성
        </Link>
      </div>

      {/* 문서 테이블 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">제목</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">메뉴</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">상태</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">수정자</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">수정일</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">작업</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ADMIN_DOCUMENTS.map((doc, index) => {
              const badge = STATUS_BADGE[doc.status];
              return (
                <tr
                  key={doc.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index === MOCK_ADMIN_DOCUMENTS.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/documents/${doc.id}/edit`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {doc.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">/{doc.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{doc.menuTitle ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{doc.updatedBy}</td>
                  <td className="px-4 py-3 text-gray-500">{doc.updatedAt}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/documents/${doc.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        편집
                      </Link>
                      <button
                        onClick={() => console.log('삭제 클릭:', doc.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

> **주의:** `onClick`이 있는 삭제 버튼이 있으므로 이 컴포넌트는 `'use client'`를 추가하거나, 삭제 버튼을 별도 클라이언트 컴포넌트로 분리해야 한다. 아래처럼 `'use client'`를 파일 상단에 추가하는 방식으로 처리한다.

파일 상단에 `'use client';` 추가.

### Step 2: 개발 서버에서 확인

`http://localhost:3000/admin/documents` 접속:
- ⬜ 문서 목록 테이블이 렌더링된다
- ⬜ 5개의 문서가 표시된다
- ⬜ 상태 배지가 올바르게 표시된다 (published: 초록, draft: 회색)
- ⬜ "새 문서 작성" 버튼이 표시된다

### Step 3: 커밋

```bash
git add src/app/admin/documents/page.tsx
git commit -m "feat: 관리자 문서 목록 페이지 구현 (mock 데이터)"
```

---

## Task 6: 문서 작성/수정 페이지 + Milkdown 편집기 통합

**Files:**
- Create: `src/app/admin/documents/new/page.tsx`
- Create: `src/app/admin/documents/[id]/edit/page.tsx`

### Step 1: 공통 문서 폼 컴포넌트 작성

문서 작성/수정 폼의 공통 로직을 담는 컴포넌트를 작성한다.
`src/components/admin/DocumentForm.tsx`를 생성한다.

```typescript
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { MOCK_MENU } from '@/lib/mock-data';
import { MenuItemType } from '@/types';

// Milkdown 편집기는 SSR 비활성화로 동적 임포트
const MilkdownEditor = dynamic(() => import('@/components/editor/MilkdownEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-md min-h-[400px] flex items-center justify-center text-gray-400 bg-gray-50">
      편집기 로딩 중...
    </div>
  ),
});

// 메뉴 트리를 flat한 옵션 목록으로 변환
function flattenMenu(items: MenuItemType[], depth = 0): Array<{ id: string; title: string; depth: number }> {
  const result: Array<{ id: string; title: string; depth: number }> = [];
  for (const item of items) {
    result.push({ id: item.id, title: item.title, depth });
    if (item.children) {
      result.push(...flattenMenu(item.children, depth + 1));
    }
  }
  return result;
}

interface DocumentFormProps {
  mode: 'new' | 'edit';
  initialTitle?: string;
  initialSlug?: string;
  initialContent?: string;
  initialStatus?: 'draft' | 'published';
  initialMenuId?: string;
}

export default function DocumentForm({
  mode,
  initialTitle = '',
  initialSlug = '',
  initialContent = '',
  initialStatus = 'draft',
  initialMenuId = '',
}: DocumentFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<'draft' | 'published'>(initialStatus);
  const [menuId, setMenuId] = useState(initialMenuId);
  const [isSlugManual, setIsSlugManual] = useState(!!initialSlug);

  const menuOptions = flattenMenu(MOCK_MENU);

  // 제목 변경 시 슬러그 자동 생성 (수동 편집 전까지)
  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isSlugManual) {
      const autoSlug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-가-힣]/g, '')
        .slice(0, 50);
      setSlug(autoSlug);
    }
  }

  function handleSlugChange(value: string) {
    setIsSlugManual(true);
    setSlug(value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Sprint 3에서 Supabase 연동 예정
    console.log('문서 저장:', { title, slug, content, status, menuId });
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'new' ? '새 문서 작성' : '문서 수정'}
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/documents"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            저장
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 메인 편집 영역 */}
        <div className="col-span-2 space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="문서 제목을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 슬러그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              슬러그 (URL 경로)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">/docs/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="url-slug"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">제목 입력 시 자동 생성됩니다. 직접 수정도 가능합니다.</p>
          </div>

          {/* Milkdown 편집기 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              본문
            </label>
            <MilkdownEditor
              defaultValue={initialContent || '# 제목\n\n내용을 작성하세요.'}
              onChange={setContent}
            />
          </div>
        </div>

        {/* 사이드바 메타 정보 */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">게시 설정</h2>

            {/* 상태 */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">초안</option>
                <option value="published">게시됨</option>
              </select>
            </div>

            {/* 메뉴 연결 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">메뉴 연결</label>
              <select
                value={menuId}
                onChange={(e) => setMenuId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">메뉴 선택 (선택 사항)</option>
                {menuOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {'　'.repeat(opt.depth)}{opt.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
```

### Step 2: 문서 작성 페이지

`src/app/admin/documents/new/page.tsx`를 생성한다.

```typescript
import DocumentForm from '@/components/admin/DocumentForm';

export default function NewDocumentPage() {
  return <DocumentForm mode="new" />;
}
```

### Step 3: 문서 수정 페이지

`src/app/admin/documents/[id]/edit/page.tsx`를 생성한다.
Next.js 16에서 params는 `Promise` 타입이므로 반드시 `await` 처리한다.

```typescript
import { MOCK_ADMIN_DOCUMENTS } from '@/lib/mock-data';
import DocumentForm from '@/components/admin/DocumentForm';
import { notFound } from 'next/navigation';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDocumentPage({ params }: EditPageProps) {
  const { id } = await params;
  const doc = MOCK_ADMIN_DOCUMENTS.find((d) => d.id === id);

  if (!doc) {
    notFound();
  }

  return (
    <DocumentForm
      mode="edit"
      initialTitle={doc.title}
      initialSlug={doc.slug}
      initialStatus={doc.status}
      initialMenuId={doc.menuId}
    />
  );
}
```

### Step 4: 개발 서버에서 확인

```bash
npm run dev
```

확인 목록:
- `http://localhost:3000/admin/documents/new`
  - ⬜ 제목 입력 시 슬러그가 자동 생성된다
  - ⬜ Milkdown 편집기가 로드된다 ("편집기 로딩 중..." 후 편집기 표시)
  - ⬜ 텍스트 입력이 가능하다
  - ⬜ 상태 선택 드롭다운이 동작한다
  - ⬜ 메뉴 선택 드롭다운에 메뉴 목록이 표시된다
  - ⬜ 저장 버튼 클릭 시 콘솔에 데이터가 출력된다
- `http://localhost:3000/admin/documents/1/edit`
  - ⬜ 문서 정보가 폼에 채워진 상태로 렌더링된다

### Step 5: 빌드 확인 및 커밋

```bash
npm run build
```

```bash
git add src/app/admin/documents/ src/components/admin/DocumentForm.tsx
git commit -m "feat: 문서 작성/수정 페이지 및 Milkdown 편집기 통합"
```

---

## Task 7: 메뉴 관리 페이지

**Files:**
- Create: `src/components/admin/MenuTreeEditor.tsx`
- Create: `src/app/admin/menus/page.tsx`

### Step 1: MenuTreeEditor 컴포넌트 작성

`src/components/admin/MenuTreeEditor.tsx`를 생성한다.
메뉴 추가/이름변경/삭제 UI를 구현한다 (드래그앤드롭은 Sprint 5).

```typescript
'use client';

import { useState } from 'react';
import { MenuItemType } from '@/types';

interface MenuNodeProps {
  item: MenuItemType;
  onAdd: (parentId: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

function MenuNode({ item, onAdd, onRename, onDelete }: MenuNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [isExpanded, setIsExpanded] = useState(true);

  function handleRename() {
    if (editTitle.trim() && editTitle !== item.title) {
      onRename(item.id, editTitle.trim());
    }
    setIsEditing(false);
  }

  return (
    <li>
      <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-50 group">
        {/* 펼치기/접기 버튼 */}
        {item.children && item.children.length > 0 ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 w-4 text-xs"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* 메뉴 제목 (인라인 수정) */}
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            autoFocus
            className="flex-1 px-1 py-0.5 border border-blue-400 rounded text-sm focus:outline-none"
          />
        ) : (
          <span
            className="flex-1 text-sm text-gray-700 cursor-pointer"
            onDoubleClick={() => setIsEditing(true)}
            title="더블클릭하여 이름 변경"
          >
            {item.title}
          </span>
        )}

        {/* 액션 버튼 (호버 시 표시) */}
        <div className="hidden group-hover:flex items-center gap-1">
          {item.depth < 4 && (
            <button
              onClick={() => onAdd(item.id)}
              className="text-xs text-blue-500 hover:text-blue-700 px-1"
              title="하위 메뉴 추가"
            >
              + 추가
            </button>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-gray-500 hover:text-gray-700 px-1"
            title="이름 변경"
          >
            수정
          </button>
          <button
            onClick={() => {
              if (confirm(`"${item.title}" 메뉴를 삭제하시겠습니까?`)) {
                onDelete(item.id);
              }
            }}
            className="text-xs text-red-500 hover:text-red-700 px-1"
            title="삭제"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 하위 메뉴 */}
      {isExpanded && item.children && item.children.length > 0 && (
        <ul className="ml-4 border-l border-gray-200 pl-2">
          {item.children.map((child) => (
            <MenuNode
              key={child.id}
              item={child}
              onAdd={onAdd}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

interface MenuTreeEditorProps {
  initialMenu: MenuItemType[];
}

export default function MenuTreeEditor({ initialMenu }: MenuTreeEditorProps) {
  const [menu, setMenu] = useState<MenuItemType[]>(initialMenu);
  const [newRootTitle, setNewRootTitle] = useState('');

  function addMenuItem(parentId: string) {
    const newTitle = prompt('새 메뉴 이름을 입력하세요:');
    if (!newTitle?.trim()) return;

    const newId = `menu-${Date.now()}`;

    function addToTree(items: MenuItemType[]): MenuItemType[] {
      return items.map((item) => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [
              ...(item.children ?? []),
              {
                id: newId,
                title: newTitle.trim(),
                depth: item.depth + 1,
                children: [],
              },
            ],
          };
        }
        if (item.children) {
          return { ...item, children: addToTree(item.children) };
        }
        return item;
      });
    }

    setMenu(addToTree(menu));
    console.log('메뉴 추가 (Sprint 3에서 DB 연동):', { parentId, title: newTitle });
  }

  function renameMenuItem(id: string, newTitle: string) {
    function renameInTree(items: MenuItemType[]): MenuItemType[] {
      return items.map((item) => {
        if (item.id === id) return { ...item, title: newTitle };
        if (item.children) return { ...item, children: renameInTree(item.children) };
        return item;
      });
    }
    setMenu(renameInTree(menu));
    console.log('메뉴 이름 변경 (Sprint 3에서 DB 연동):', { id, newTitle });
  }

  function deleteMenuItem(id: string) {
    function deleteFromTree(items: MenuItemType[]): MenuItemType[] {
      return items
        .filter((item) => item.id !== id)
        .map((item) => ({
          ...item,
          children: item.children ? deleteFromTree(item.children) : undefined,
        }));
    }
    setMenu(deleteFromTree(menu));
    console.log('메뉴 삭제 (Sprint 3에서 DB 연동):', id);
  }

  function addRootMenu() {
    if (!newRootTitle.trim()) return;
    const newId = `menu-${Date.now()}`;
    setMenu([
      ...menu,
      { id: newId, title: newRootTitle.trim(), depth: 1, children: [] },
    ]);
    setNewRootTitle('');
    console.log('최상위 메뉴 추가 (Sprint 3에서 DB 연동):', newRootTitle);
  }

  return (
    <div>
      {/* 메뉴 트리 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <ul className="space-y-0.5">
          {menu.map((item) => (
            <MenuNode
              key={item.id}
              item={item}
              onAdd={addMenuItem}
              onRename={renameMenuItem}
              onDelete={deleteMenuItem}
            />
          ))}
        </ul>

        {menu.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">메뉴가 없습니다. 아래에서 추가하세요.</p>
        )}
      </div>

      {/* 최상위 메뉴 추가 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newRootTitle}
          onChange={(e) => setNewRootTitle(e.target.value)}
          placeholder="최상위 메뉴 이름"
          onKeyDown={(e) => e.key === 'Enter' && addRootMenu()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addRootMenu}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          최상위 메뉴 추가
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">항목에 마우스를 올리면 추가/수정/삭제 버튼이 표시됩니다. 더블클릭으로도 이름을 변경할 수 있습니다.</p>
    </div>
  );
}
```

### Step 2: 메뉴 관리 페이지 작성

`src/app/admin/menus/page.tsx`를 생성한다.

```typescript
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
```

### Step 3: 개발 서버에서 확인

`http://localhost:3000/admin/menus` 접속:
- ⬜ 4 depth 메뉴 트리가 렌더링된다
- ⬜ 마우스 호버 시 추가/수정/삭제 버튼이 표시된다
- ⬜ 항목 더블클릭 시 인라인 편집 모드가 활성화된다
- ⬜ 하위 메뉴 추가 시 트리에 즉시 반영된다
- ⬜ 메뉴 삭제 시 확인 대화상자 후 트리에서 제거된다

### Step 4: 커밋

```bash
git add src/app/admin/menus/ src/components/admin/MenuTreeEditor.tsx
git commit -m "feat: 메뉴 관리 페이지 구현 (추가/수정/삭제 UI)"
```

---

## Task 8: 사용자 관리 페이지

**Files:**
- Create: `src/components/admin/UserAddModal.tsx`
- Create: `src/app/admin/users/page.tsx`

### Step 1: UserAddModal 컴포넌트 작성

`src/components/admin/UserAddModal.tsx`를 생성한다.

```typescript
'use client';

import { useState } from 'react';

interface UserAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (email: string, name: string) => void;
}

export default function UserAddModal({ isOpen, onClose, onAdd }: UserAddModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; name?: string }>({});

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: { email?: string; name?: string } = {};
    if (!email) newErrors.email = '이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = '올바른 이메일 형식이 아닙니다.';
    if (!name) newErrors.name = '이름을 입력해주세요.';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onAdd(email, name);
    setEmail('');
    setName('');
    setErrors({});
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* 모달 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">관리자 추가</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### Step 2: 사용자 관리 페이지 작성

`src/app/admin/users/page.tsx`를 생성한다.

```typescript
'use client';

import { useState } from 'react';
import { MOCK_ADMIN_USERS } from '@/lib/mock-data';
import { AdminUserType } from '@/types';
import UserAddModal from '@/components/admin/UserAddModal';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserType[]>(MOCK_ADMIN_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleAddUser(email: string, name: string) {
    const newUser: AdminUserType = {
      id: `u${Date.now()}`,
      email,
      name,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    console.log('사용자 추가 (Sprint 3에서 DB 연동):', newUser);
  }

  function handleToggleActive(id: string) {
    setUsers(users.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
    console.log('사용자 활성화 토글 (Sprint 3에서 DB 연동):', id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {users.length}명의 관리자</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 관리자 추가
        </button>
      </div>

      {/* 사용자 테이블 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">이름</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">이메일</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">권한</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">상태</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">가입일</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">작업</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  index === users.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {user.isActive ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{user.createdAt}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleToggleActive(user.id)}
                    className={`text-xs font-medium ${
                      user.isActive ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'
                    }`}
                  >
                    {user.isActive ? '비활성화' : '활성화'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddUser}
      />
    </div>
  );
}
```

### Step 3: 개발 서버에서 확인

`http://localhost:3000/admin/users` 접속:
- ⬜ 사용자 목록 테이블이 렌더링된다
- ⬜ "관리자 추가" 버튼 클릭 시 모달이 열린다
- ⬜ 모달에서 사용자 추가 시 목록에 즉시 반영된다
- ⬜ 활성화/비활성화 토글 버튼이 동작한다
- ⬜ 모달 배경 클릭 시 닫힌다

### Step 4: 빌드 확인 및 커밋

```bash
npm run build
```

```bash
git add src/app/admin/users/ src/components/admin/UserAddModal.tsx
git commit -m "feat: 사용자 관리 페이지 구현 (추가 모달, 활성화 토글)"
```

---

## Task 9: 전체 통합 검증 및 빌드 최종 확인

**Files:**
- 수정 없음 (검증 단계)

### Step 1: TypeScript 타입 체크

```bash
npx tsc --noEmit
```

예상 결과: 에러 없음 (경고만 허용)

### Step 2: 빌드 최종 확인

```bash
npm run build
```

예상 결과: Build 성공, 에러 없음

### Step 3: 개발 서버 전체 시나리오 확인

```bash
npm run dev
```

아래 URL을 순서대로 방문하며 확인:

| URL | 확인 항목 |
|-----|-----------|
| `http://localhost:3000` | 사용자 레이아웃 (흰 헤더, 좌측 사이드바, 문서 뷰어) |
| `http://localhost:3000/docs/sample` | Markdown 문서 렌더링 |
| `http://localhost:3000/admin/login` | 로그인 폼 (관리자 레이아웃 없음, 풀스크린) |
| `http://localhost:3000/admin/documents` | 문서 목록 테이블 (어두운 관리자 레이아웃) |
| `http://localhost:3000/admin/documents/new` | 문서 작성 + Milkdown 편집기 |
| `http://localhost:3000/admin/documents/1/edit` | 문서 수정 폼 |
| `http://localhost:3000/admin/menus` | 메뉴 트리 편집기 |
| `http://localhost:3000/admin/users` | 사용자 관리 테이블 |

### Step 4: 최종 커밋

```bash
git add -A
git commit -m "chore: Sprint 2 전체 통합 검증 완료"
```

---

## 완료 기준 (Definition of Done)

| 항목 | 확인 방법 |
|------|-----------|
| - ✅ `/admin/login` 로그인 폼 렌더링 및 유효성 검사 UI 동작 | 개발 서버에서 직접 확인 |
| - ✅ `/admin/documents` 문서 목록 테이블 mock 데이터 렌더링 | 5개 문서 목록 확인 |
| - ✅ `/admin/documents/new` Milkdown 편집기 정상 로드 및 텍스트 입력 가능 | 편집기에 텍스트 입력 테스트 |
| - ✅ `/admin/documents/[id]/edit` 기존 문서 데이터로 폼 초기화 | mock 문서 id=1 수정 페이지 |
| - ✅ `/admin/menus` 메뉴 트리 mock 데이터 렌더링 및 추가/수정/삭제 동작 | UI 인터랙션 확인 |
| - ✅ `/admin/users` 관리자 목록 mock 데이터 렌더링 및 추가 모달 동작 | 모달 열기/추가/닫기 |
| - ✅ 사용자 페이지(`/`, `/docs/*`)에 관리자 레이아웃이 적용되지 않음 | Route Group 분리 확인 |
| - ✅ `npm run build` 빌드 에러 없음 | 빌드 성공 확인 |
| - ✅ TypeScript 타입 에러 없음 | `npx tsc --noEmit` 통과 |

---

## Playwright MCP 검증 시나리오

> `npm run dev` 실행 후 sprint-close 에이전트가 아래 시나리오로 검증한다.

### 로그인 페이지 검증

#### 기본 렌더링
```
1. browser_navigate → http://localhost:3000/admin/login
2. browser_snapshot → 이메일/비밀번호 입력 필드, 로그인 버튼, "의사랑 관리자" 제목 존재 확인
3. browser_console_messages(level: "error") → 콘솔 에러 없음 확인
```

#### 엣지 케이스 1: 빈 필드 제출
```
1. browser_click → 로그인 버튼 클릭 (이메일, 비밀번호 모두 빈 상태)
2. browser_snapshot → "이메일을 입력해주세요" + "비밀번호를 입력해주세요" 에러 메시지 2개 동시 표시 확인
```

#### 엣지 케이스 2: 이메일 형식 오류
```
1. browser_type → 이메일 필드에 "notanemail" 입력
2. browser_type → 비밀번호 필드에 "password123" 입력
3. browser_click → 로그인 버튼 클릭
4. browser_snapshot → "올바른 이메일 형식이 아닙니다" 에러 표시, 비밀번호 에러 없음 확인
```

#### 엣지 케이스 3: 비밀번호 너무 짧음
```
1. browser_clear → 이메일 필드 초기화
2. browser_type → 이메일 필드에 "admin@example.com" 입력
3. browser_clear → 비밀번호 필드 초기화
4. browser_type → 비밀번호 필드에 "abc" 입력 (5자 미만)
5. browser_click → 로그인 버튼 클릭
6. browser_snapshot → "비밀번호는 6자 이상이어야 합니다" 에러 표시, 이메일 에러 없음 확인
```

#### 엣지 케이스 4: 이메일만 입력
```
1. browser_clear → 이메일/비밀번호 필드 초기화
2. browser_type → 이메일 필드에 "admin@example.com" 입력
3. browser_click → 로그인 버튼 클릭
4. browser_snapshot → 이메일 에러 없음, "비밀번호를 입력해주세요" 에러만 표시 확인
```

#### 엣지 케이스 5: 정상 입력 → 로딩 상태
```
1. browser_clear → 이메일/비밀번호 필드 초기화
2. browser_type → 이메일 필드에 "admin@example.com" 입력
3. browser_type → 비밀번호 필드에 "password123" 입력
4. browser_click → 로그인 버튼 클릭
5. browser_snapshot → 버튼이 "로그인 중..." 텍스트 + disabled 상태로 변경 확인
6. browser_console_messages(level: "error") → 에러 없음 확인
```

#### 엣지 케이스 6: 이메일 앞뒤 공백
```
1. browser_clear → 이메일 필드 초기화
2. browser_type → 이메일 필드에 "  " 입력 (공백만)
3. browser_type → 비밀번호 필드에 "password123" 입력
4. browser_click → 로그인 버튼 클릭
5. browser_snapshot → 이메일 에러 표시 확인 (공백만 입력은 빈 값으로 처리)
```

---

### 문서 목록 검증

#### 테이블 구조 확인
```
1. browser_navigate → http://localhost:3000/admin/documents
2. browser_snapshot → "새 문서 작성" 버튼, "총 5개의 문서" 카운트 존재 확인
3. browser_snapshot → 테이블 헤더 컬럼 6개 확인:
   - "제목" 컬럼 (좌측 정렬, 가장 넓음)
   - "메뉴" 컬럼
   - "상태" 컬럼
   - "수정자" 컬럼
   - "수정일" 컬럼
   - "작업" 컬럼 (우측 정렬)
4. browser_snapshot → 각 행에 제목 + 슬러그("/changelog-v2" 형태), 메뉴명, 상태 배지, 수정자, 수정일, 편집/삭제 버튼 존재 확인
5. browser_snapshot → published 상태 배지: 초록 배경 "게시됨", draft 상태 배지: 회색 배경 "초안" 확인
6. browser_console_messages(level: "error") → 에러 없음 확인
```

---

### Milkdown 편집기 검증

#### 편집기 로드 확인
```
1. browser_navigate → http://localhost:3000/admin/documents/new
2. browser_snapshot → 제목 입력 필드, /docs/ 슬러그 입력 영역, 상태 선택 드롭다운, 메뉴 연결 드롭다운, 저장/취소 버튼 존재 확인
3. browser_wait_for → Milkdown 편집기 완전 로드 대기 (dynamic import 로딩)
4. browser_snapshot → "편집기 로딩 중..." 사라지고 편집기 영역 렌더링 확인
5. browser_console_messages(level: "error") → 에러 없음 확인
```

#### 일반 텍스트 입력
```
1. browser_click → 편집기 영역 클릭
2. browser_type → "안녕하세요 테스트입니다" 입력
3. browser_snapshot → 입력한 텍스트가 편집기에 표시 확인
```

#### 헤딩 (# 문법)
```
1. browser_type → "# " 입력 후 "제목입니다" 입력
2. browser_snapshot → H1 스타일(큰 글씨)로 렌더링 확인
```

#### 굵게 (** 문법)
```
1. 편집기 새 줄로 이동
2. browser_type → "**굵은 텍스트**" 입력
3. browser_snapshot → bold 스타일로 렌더링 확인
```

#### 목록 (- 문법)
```
1. 편집기 새 줄로 이동
2. browser_type → "- 첫 번째 항목" 입력 후 Enter
3. browser_type → "- 두 번째 항목" 입력
4. browser_snapshot → bullet list 렌더링 확인
```

#### 코드 블록 (``` 문법)
```
1. 편집기 새 줄로 이동
2. browser_type → "```" 입력 후 Enter
3. browser_type → "const x = 1;" 입력
4. browser_snapshot → 코드 블록 스타일로 렌더링 확인
```

#### 인용문 (> 문법)
```
1. 편집기 새 줄로 이동
2. browser_type → "> 인용 텍스트입니다" 입력
3. browser_snapshot → blockquote 스타일로 렌더링 확인
```

#### 슬러그 자동 생성
```
1. browser_click → 제목 입력 필드 클릭
2. browser_type → "테스트 문서 제목" 입력
3. browser_snapshot → 슬러그 필드에 자동 생성된 값 확인 (공백→하이픈 변환)
```

#### 저장 버튼 (콘솔 출력 확인)
```
1. browser_click → 저장 버튼 클릭
2. browser_console_messages → "문서 저장:" 로그 출력 확인 (Sprint 3 연동 전 동작 확인)
```

---

### 메뉴 관리 검증

```
1. browser_navigate → http://localhost:3000/admin/menus
2. browser_snapshot → 메뉴 트리 1 depth 항목 확인: "시작하기", "사용 방법", "변경 내역"
3. browser_click → "시작하기" 항목 hover 상태에서 "+ 추가" 버튼 클릭
4. browser_snapshot → 하위 메뉴 추가 후 트리에 반영 확인
5. browser_snapshot → 메뉴 항목 더블클릭 시 인라인 편집 input 표시 확인
6. browser_console_messages(level: "error") → 에러 없음 확인
```

---

### 사용자 관리 검증

#### 테이블 구조 확인
```
1. browser_navigate → http://localhost:3000/admin/users
2. browser_snapshot → "총 3명의 관리자" 카운트, "관리자 추가" 버튼 존재 확인
3. browser_snapshot → 테이블 헤더 컬럼 6개 확인:
   - "이름" 컬럼
   - "이메일" 컬럼
   - "권한" 컬럼
   - "상태" 컬럼
   - "가입일" 컬럼
   - "작업" 컬럼 (우측 정렬)
4. browser_snapshot → 각 행 데이터 확인:
   - 권한 배지: 보라 배경 "admin"
   - 활성 상태 배지: 초록 "활성" / 회색 "비활성"
   - 작업 버튼: 활성 사용자 → "비활성화", 비활성 사용자 → "활성화"
5. browser_console_messages(level: "error") → 에러 없음 확인
```

#### 사용자 추가 모달
```
1. browser_click → "관리자 추가" 버튼 클릭
2. browser_snapshot → 모달 표시 확인 (이메일/이름 필드, 취소/추가 버튼)
3. browser_click → 배경 오버레이 클릭
4. browser_snapshot → 모달 닫힘 확인
```

---

## 리스크 및 대응 방안

| 리스크 | 발생 가능성 | 대응 방안 |
|--------|------------|-----------|
| Milkdown 패키지 버전 충돌 | 중간 | PoC 단계에서 조기 발견. `@milkdown/kit` 단일 패키지로 전환 또는 특정 버전 고정 (`@milkdown/core@7.x`) |
| Milkdown SSR 하이드레이션 에러 | 중간 | `dynamic import`의 `ssr: false` 옵션으로 해결. `'use client'` 필수 |
| Route Group 이동 후 기존 경로 404 | 낮음 | `(user)` 그룹 이동 후 개발 서버 재시작 필요. `.next` 캐시 삭제 |
| Next.js 16 params Promise 타입 오류 | 중간 | 모든 동적 라우트에서 `const { id } = await params;` 패턴 일관 적용 |
| Tailwind CSS v4 클래스 미적용 | 낮음 | `postcss.config.mjs`의 `@tailwindcss/postcss` 설정 확인 |

---

## 기술 부채 (Sprint 3에서 해소)

| 항목 | 현재 상태 | Sprint 3 해소 방법 |
|------|-----------|-------------------|
| 로그인 `console.log` | 폼 제출 시 콘솔 출력만 | Supabase Auth `signInWithPassword` 연동 |
| 문서 저장 `console.log` | 저장 버튼 클릭 시 콘솔 출력만 | Supabase `documents` 테이블 INSERT/UPDATE |
| 메뉴 변경 `console.log` | 메뉴 추가/수정/삭제 시 콘솔 출력만 | Supabase `menus` 테이블 CRUD |
| 사용자 추가 `console.log` | 모달 제출 시 콘솔 출력만 | Supabase Auth Admin API |
| Mock 데이터 전체 | `lib/mock-data.ts` | Supabase DB 조회로 교체 |

---

*Sprint 2 계획 작성일: 2026-03-13*
*다음 스프린트: Sprint 3 — Supabase 연동 (백엔드)*
