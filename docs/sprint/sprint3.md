# Sprint 3: Supabase 연동 — 실제 데이터 CRUD MVP 완성

> **목표**: Sprint 1-2에서 구현한 프론트엔드 UI에 Supabase 백엔드를 연동하여, 관리자가 문서를 작성·게시하고 고객이 열람할 수 있는 실제 동작하는 MVP를 완성한다.

**브랜치**: `sprint3`
**시작일**: 2026-03-13
**예상 기간**: 1-2주

---

## 스프린트 목표 (Sprint Goal)

Supabase(PostgreSQL + Auth + Storage)를 연동하여 다음이 실제로 동작하는 상태를 달성한다:

1. 관리자 이메일/비밀번호 로그인 → 세션 유지 → 자동 보호 라우팅
2. 관리자 문서 작성/수정/삭제 → DB에 영속 저장
3. 메뉴 추가/수정/삭제 → 사용자 사이드바에 실시간 반영
4. 사용자 페이지에서 published 문서만 열람 가능 (RLS 보안 적용)
5. 이미지 업로드를 로컬 저장소에서 Supabase Storage로 마이그레이션

---

## 아키텍처 개요

```
브라우저 (클라이언트 컴포넌트)
  └─ createBrowserClient()  ← @supabase/ssr
서버 (서버 컴포넌트 / Route Handler)
  └─ createServerClient()   ← @supabase/ssr (cookies 주입)
middleware.ts
  └─ createServerClient()   ← 세션 갱신 + /admin 보호
Supabase
  ├─ Auth (이메일/비밀번호)
  ├─ PostgreSQL (profiles, menus, documents, document_history)
  ├─ Storage (documents-images 버킷)
  └─ RLS 정책
```

**핵심 원칙**: 서버 컴포넌트에서는 절대 `createBrowserClient()` 사용 금지. Next.js 16의 `params`/`searchParams`는 반드시 `await`로 언래핑.

---

## 작업 목록 (Task Breakdown)

### Task 1: Supabase 프로젝트 설정 및 클라이언트 분리

**복잡도**: 중간
**예상 소요**: 2-3시간

**대상 파일**:
- 생성: `lib/supabase/client.ts` — 브라우저용 Supabase 클라이언트
- 생성: `lib/supabase/server.ts` — 서버 컴포넌트용 Supabase 클라이언트
- 생성: `lib/supabase/middleware.ts` — 미들웨어용 Supabase 클라이언트
- 생성: `types/database.ts` — DB 타입 정의 (supabase CLI로 자동 생성)
- 수정: `.env.local` — 환경변수 추가 (커밋 제외)

**구현 단계**:

**Step 1**: 패키지 설치
```bash
npm install @supabase/ssr
```
예상 출력: `added N packages`

**Step 2**: `.env.local`에 환경변수 추가
```
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

**Step 3**: `lib/supabase/client.ts` — 브라우저용 클라이언트 작성
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 4**: `lib/supabase/server.ts` — 서버 컴포넌트용 클라이언트 작성
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

**Step 5**: Supabase CLI로 타입 자동 생성
```bash
npx supabase gen types typescript --project-id [project-ref] > types/database.ts
```

**Step 6**: 커밋
```bash
git add lib/supabase/ types/database.ts
git commit -m "feat: Supabase 클라이언트 설정 및 타입 정의 추가"
```

---

### Task 2: 데이터베이스 스키마 생성 및 RLS 정책 설정

**복잡도**: 중간
**예상 소요**: 2-3시간

**대상 파일**:
- 생성: `supabase/migrations/001_initial_schema.sql`

**구현 단계**:

**Step 1**: `supabase/migrations/001_initial_schema.sql` 작성
```sql
-- profiles 테이블: auth.users와 1:1 연결
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- menus 테이블: 4 depth 계층형 메뉴
CREATE TABLE menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  depth INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- documents 테이블
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  menu_id UUID REFERENCES menus(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- document_history 테이블: 문서 수정 이력
CREATE TABLE document_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  summary TEXT
);

-- 인덱스
CREATE INDEX idx_documents_slug ON documents(slug);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_menu_id ON documents(menu_id);
CREATE INDEX idx_menus_parent_id ON menus(parent_id);
CREATE INDEX idx_document_history_document_id ON document_history(document_id);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_history ENABLE ROW LEVEL SECURITY;

-- RLS 정책: profiles
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS 정책: menus (공개 읽기, 인증 사용자 쓰기)
CREATE POLICY "menus_select_all" ON menus
  FOR SELECT USING (true);
CREATE POLICY "menus_insert_authenticated" ON menus
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "menus_update_authenticated" ON menus
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "menus_delete_authenticated" ON menus
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS 정책: documents (published는 공개, 나머지는 인증 사용자만)
CREATE POLICY "documents_select_published" ON documents
  FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');
CREATE POLICY "documents_insert_authenticated" ON documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "documents_update_authenticated" ON documents
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "documents_delete_authenticated" ON documents
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS 정책: document_history (인증 사용자만)
CREATE POLICY "history_select_authenticated" ON document_history
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "history_insert_authenticated" ON document_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- auth.users 신규 가입 시 profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Step 2**: Supabase 대시보드 SQL Editor에서 위 SQL 실행하거나 CLI 적용
```bash
npx supabase db push
```

**Step 3**: 커밋
```bash
git add supabase/
git commit -m "feat: DB 스키마 생성 및 RLS 정책 설정"
```

---

### Task 3: Next.js 미들웨어 및 인증 연동

**복잡도**: 중간
**예상 소요**: 2-3시간

**대상 파일**:
- 생성: `middleware.ts` (프로젝트 루트)
- 생성: `lib/supabase/middleware.ts`
- 수정: `app/admin/login/page.tsx`
- 수정: `components/admin/AdminHeader.tsx`
- 생성: `lib/auth/actions.ts` — 서버 액션 (로그인/로그아웃)

**구현 단계**:

**Step 1**: `lib/supabase/middleware.ts` 작성 — 미들웨어용 Supabase 클라이언트
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // /admin/* 경로 접근 시 미인증이면 로그인으로 리다이렉트
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/login')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // 로그인 상태에서 /admin/login 접근 시 관리자 홈으로 리다이렉트
  if (user && request.nextUrl.pathname === '/admin/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/documents'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

**Step 2**: `middleware.ts` (루트) 작성
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Step 3**: `lib/auth/actions.ts` — 서버 액션으로 로그인/로그아웃 처리
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: error.message }
  }
  redirect('/admin/documents')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
```

**Step 4**: `app/admin/login/page.tsx` — signIn 서버 액션 연동
- 폼 submit 시 `signIn(email, password)` 호출
- 에러 반환 시 화면에 메시지 표시
- 로딩 상태 처리 (`useFormStatus` 또는 `useTransition`)

**Step 5**: `components/admin/AdminHeader.tsx` — 로그아웃 버튼 연동
```typescript
import { signOut } from '@/lib/auth/actions'
// 로그아웃 버튼에 signOut 액션 연결
```

**Step 6**: 커밋
```bash
git add middleware.ts lib/supabase/middleware.ts lib/auth/actions.ts app/admin/login/
git commit -m "feat: Next.js 미들웨어 및 Supabase 인증 연동"
```

---

### Task 4: 문서 CRUD API 레이어 구현

**복잡도**: 중간
**예상 소요**: 3-4시간

**대상 파일**:
- 생성: `lib/api/documents.ts` — 문서 CRUD 함수
- 수정: `app/admin/documents/page.tsx`
- 수정: `app/admin/documents/new/page.tsx`
- 수정: `app/admin/documents/[id]/edit/page.tsx`

**구현 단계**:

**Step 1**: `lib/api/documents.ts` 작성
```typescript
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Document = Database['public']['Tables']['documents']['Row']
type DocumentInsert = Database['public']['Tables']['documents']['Insert']
type DocumentUpdate = Database['public']['Tables']['documents']['Update']

// 문서 목록 조회 (관리자용: 모든 상태)
export async function getDocuments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, slug, status, menu_id, updated_by, updated_at')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

// 단일 문서 조회 (slug 기반)
export async function getDocumentBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

// 문서 생성
export async function createDocument(doc: DocumentInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .insert(doc)
    .select()
    .single()
  if (error) throw error
  return data
}

// 문서 수정
export async function updateDocument(id: string, updates: DocumentUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// 문서 삭제
export async function deleteDocument(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// 첫 번째 published 문서 조회 (루트 리다이렉트용)
export async function getFirstPublishedDocument() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('documents')
    .select('slug')
    .eq('status', 'published')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()
  return data
}
```

**Step 2**: `app/admin/documents/page.tsx` — 서버 컴포넌트에서 `getDocuments()` 호출하여 목록 렌더링
- mock 데이터 제거
- 삭제 버튼에 Server Action 연결

**Step 3**: `app/admin/documents/new/page.tsx` — 문서 저장 Server Action 구현
- 폼 submit 시 `createDocument()` 호출
- 저장 후 `/admin/documents`로 리다이렉트
- slug 자동 생성 유틸리티 작성 (`lib/utils/slugify.ts`)

```typescript
// lib/utils/slugify.ts
import { nanoid } from 'nanoid'

export function generateSlug(title: string): string {
  // 한글 포함 제목은 nanoid로 고유성 보장
  const base = title
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50)
  return base ? `${base}-${nanoid(6)}` : nanoid(10)
}
```

**Step 4**: `app/admin/documents/[id]/edit/page.tsx` — Next.js 16 params 처리 주의
```typescript
// Next.js 16: params는 Promise 타입
export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params   // ← await 필수
  // ...
}
```

**Step 5**: 커밋
```bash
git add lib/api/documents.ts lib/utils/slugify.ts app/admin/documents/
git commit -m "feat: 문서 CRUD API 레이어 및 관리자 문서 페이지 Supabase 연동"
```

---

### Task 5: 메뉴 CRUD API 레이어 구현

**복잡도**: 중간
**예상 소요**: 2-3시간

**대상 파일**:
- 생성: `lib/api/menus.ts` — 메뉴 CRUD 함수
- 수정: `app/admin/menus/page.tsx`
- 수정: `components/layout/Sidebar.tsx` (사용자 사이드바)

**구현 단계**:

**Step 1**: `lib/api/menus.ts` 작성
```typescript
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Menu = Database['public']['Tables']['menus']['Row']

// 전체 메뉴 트리 조회 (공개 — 인증 불필요)
export async function getMenus() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .order('order_index', { ascending: true })
  if (error) throw error
  return data ?? []
}

// 플랫 배열을 트리 구조로 변환
export function buildMenuTree(menus: Menu[]) {
  const map = new Map<string, Menu & { children: typeof map extends Map<string, infer V> ? V[] : never[] }>()
  const roots: ReturnType<typeof map.get>[] = []

  menus.forEach(menu => {
    map.set(menu.id, { ...menu, children: [] })
  })

  menus.forEach(menu => {
    const node = map.get(menu.id)!
    if (menu.parent_id) {
      const parent = map.get(menu.parent_id)
      parent?.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

// 메뉴 생성
export async function createMenu(menu: { title: string; parent_id?: string | null; order_index?: number }) {
  const supabase = await createClient()
  const depth = menu.parent_id
    ? await getMenuDepth(menu.parent_id) + 1
    : 0
  const { data, error } = await supabase
    .from('menus')
    .insert({ ...menu, depth })
    .select()
    .single()
  if (error) throw error
  return data
}

async function getMenuDepth(menuId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('menus')
    .select('depth')
    .eq('id', menuId)
    .single()
  return data?.depth ?? 0
}

// 메뉴 수정
export async function updateMenu(id: string, updates: { title?: string; order_index?: number }) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menus')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// 메뉴 삭제
export async function deleteMenu(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('menus').delete().eq('id', id)
  if (error) throw error
}
```

**Step 2**: `app/admin/menus/page.tsx` — `getMenus()` + `buildMenuTree()`로 실제 데이터 렌더링
- mock 데이터 제거
- 메뉴 추가/수정/삭제에 Server Action 연결

**Step 3**: `components/layout/Sidebar.tsx` — `getMenus()` + `buildMenuTree()`로 실제 DB 메뉴 렌더링
- Sprint 1 mock 데이터 제거
- 서버 컴포넌트에서 직접 데이터 패칭

**Step 4**: 커밋
```bash
git add lib/api/menus.ts app/admin/menus/ components/layout/Sidebar.tsx
git commit -m "feat: 메뉴 CRUD API 레이어 및 사이드바 Supabase 연동"
```

---

### Task 6: 사용자 페이지 데이터 연동 (문서 뷰어 + 루트 리다이렉트)

**복잡도**: 중간
**예상 소요**: 2-3시간

**대상 파일**:
- 수정: `app/page.tsx` — 첫 번째 published 문서로 리다이렉트
- 수정: `app/docs/[...slug]/page.tsx` — slug 기반 문서 조회 + Next.js 16 `await params`
- 수정: `components/document/DocumentViewer.tsx` — 실제 content 렌더링

**구현 단계**:

**Step 1**: `app/page.tsx` — published 문서 기반 리다이렉트
```typescript
import { redirect } from 'next/navigation'
import { getFirstPublishedDocument } from '@/lib/api/documents'

export default async function HomePage() {
  const doc = await getFirstPublishedDocument()
  if (doc) {
    redirect(`/docs/${doc.slug}`)
  }
  // 문서가 없는 경우 안내 페이지
  return <div>등록된 문서가 없습니다.</div>
}
```

**Step 2**: `app/docs/[...slug]/page.tsx` — Next.js 16 params 처리
```typescript
import { notFound } from 'next/navigation'
import { getDocumentBySlug } from '@/lib/api/documents'
import DocumentViewer from '@/components/document/DocumentViewer'

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params   // ← Next.js 16 필수
  const slugStr = slug.join('/')
  const doc = await getDocumentBySlug(slugStr)

  if (!doc || doc.status !== 'published') {
    notFound()
  }

  return <DocumentViewer content={doc.content} title={doc.title} />
}
```

**Step 3**: 사이드바 메뉴 항목과 문서 연결 확인
- 메뉴 클릭 시 연결된 문서의 slug로 이동하는 링크 구성
- `documents` 테이블과 `menus` 테이블 JOIN 쿼리로 메뉴-문서 매핑

**Step 4**: 커밋
```bash
git add app/page.tsx "app/docs/[...slug]/"
git commit -m "feat: 사용자 페이지 Supabase 문서 데이터 연동"
```

---

### Task 7: 사용자 관리 연동

**복잡도**: 낮음
**예상 소요**: 1-2시간

**대상 파일**:
- 생성: `lib/api/users.ts` — 관리자 목록 조회
- 수정: `app/admin/users/page.tsx`

**구현 단계**:

**Step 1**: `lib/api/users.ts` 작성
```typescript
import { createClient } from '@/lib/supabase/server'

export async function getProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, is_active, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function toggleUserActive(id: string, is_active: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_active })
    .eq('id', id)
  if (error) throw error
}
```

**Step 2**: `app/admin/users/page.tsx` — `getProfiles()`로 실제 데이터 렌더링
- mock 데이터 제거
- 활성/비활성 토글 Server Action 연결

**Step 3**: 커밋
```bash
git add lib/api/users.ts app/admin/users/
git commit -m "feat: 사용자 관리 Supabase 연동"
```

---

### Task 8: Supabase Storage 이미지 마이그레이션

**복잡도**: 중간
**예상 소요**: 2-3시간

**대상 파일**:
- 생성: `lib/api/storage.ts` — 이미지 업로드/삭제/URL 생성
- 수정: `app/api/upload/route.ts` (Sprint 2에서 생성된 이미지 업로드 API)

**구현 단계**:

**Step 1**: Supabase Dashboard에서 Storage 버킷 생성
- 버킷명: `documents-images`
- 공개 접근: 활성화 (이미지 URL 공개 제공)
- RLS: 인증된 사용자만 업로드, 모든 사용자 읽기

**Step 2**: `lib/api/storage.ts` 작성
```typescript
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'documents-images'

export async function uploadImage(
  file: File,
  documentSlug: string
): Promise<string> {
  const supabase = await createClient()
  const ext = file.name.split('.').pop()
  const path = `${documentSlug}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteImage(path: string) {
  const supabase = await createClient()
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}
```

**Step 3**: `app/api/upload/route.ts` — 로컬 저장 대신 Supabase Storage 사용으로 교체
- `fs.writeFile` → `uploadImage()` 호출로 변경
- 반환 URL을 Supabase Storage public URL로 변경

**Step 4**: 커밋
```bash
git add lib/api/storage.ts app/api/upload/
git commit -m "feat: 이미지 업로드를 로컬에서 Supabase Storage로 마이그레이션"
```

---

### Task 9: 에러 처리 통일 및 로딩 상태 UI

**복잡도**: 낮음
**예상 소요**: 1-2시간

**대상 파일**:
- 생성: `app/error.tsx` — 전역 에러 바운더리
- 생성: `app/loading.tsx` — 전역 로딩 UI
- 생성: `app/not-found.tsx` — 404 페이지
- 생성: `components/ui/ErrorMessage.tsx` — 인라인 에러 메시지 컴포넌트

**구현 단계**:

**Step 1**: Next.js App Router 에러 처리 파일 작성

`app/error.tsx` (클라이언트 컴포넌트):
```typescript
'use client'
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-semibold mb-4">오류가 발생했습니다</h2>
      <button onClick={reset} className="px-4 py-2 bg-blue-500 text-white rounded">
        다시 시도
      </button>
    </div>
  )
}
```

`app/not-found.tsx`:
```typescript
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-semibold">문서를 찾을 수 없습니다</h2>
    </div>
  )
}
```

**Step 2**: 커밋
```bash
git add app/error.tsx app/loading.tsx app/not-found.tsx components/ui/
git commit -m "feat: 에러 바운더리 및 로딩/404 UI 추가"
```

---

### Task 10: 빌드 검증 및 타입 에러 해결

**복잡도**: 낮음
**예상 소요**: 1시간

**구현 단계**:

**Step 1**: TypeScript 타입 에러 확인
```bash
npx tsc --noEmit
```
예상: 에러 0개 (있으면 수정)

**Step 2**: 빌드 확인
```bash
npm run build
```
예상: 빌드 성공, 에러 없음

**Step 3**: 최종 커밋
```bash
git add -A
git commit -m "fix: 빌드 검증 및 타입 에러 수정"
```

---

## 완료 기준 (Definition of Done)

- ✅ 관리자 이메일/비밀번호 로그인 성공 및 세션 유지
- ✅ 미인증 사용자 `/admin/*` 접근 시 `/admin/login`으로 자동 리다이렉트
- ✅ 인증된 관리자는 `/admin/login` 접근 시 `/admin/documents`로 자동 리다이렉트
- ✅ 관리자가 문서를 작성하면 DB에 저장되고 목록에 표시
- ✅ 관리자가 문서를 수정/삭제할 수 있음
- ✅ 문서를 `published` 상태로 변경하면 사용자 페이지(`/docs/[slug]`)에서 열람 가능
- ✅ `draft` 상태 문서는 사용자 페이지에서 404 처리
- ✅ 메뉴 추가/수정/삭제 후 사용자 사이드바에 DB 기반 메뉴 표시
- ✅ 이미지 업로드 시 Supabase Storage에 저장되고 URL 반환
- ✅ RLS 정책 동작: 비인증 사용자는 `published` 문서만 조회 가능
- ✅ `npm run build` 빌드 에러 없음
- ✅ TypeScript 타입 에러 없음 (`npx tsc --noEmit`)

---

## Playwright MCP 검증 시나리오

> `npm run dev` 실행 후 아래 순서로 순차 검증. 각 시나리오는 독립적으로 실행 가능.

### 시나리오 1: 인증 플로우 검증

```
1. browser_navigate → http://localhost:3000/admin
2. browser_snapshot → URL이 /admin/login으로 리다이렉트되었는지, 로그인 폼 존재 확인
3. browser_fill → 이메일 필드에 관리자 이메일 입력
4. browser_fill → 비밀번호 필드에 비밀번호 입력
5. browser_click → 로그인 버튼 클릭
6. browser_snapshot → /admin/documents로 이동, 문서 목록 페이지 표시 확인
7. browser_network_requests → Supabase Auth API 200 응답 확인
```

### 시나리오 2: 로그아웃 검증

```
1. (로그인 상태에서) browser_click → 헤더의 로그아웃 버튼 클릭
2. browser_snapshot → /admin/login으로 리다이렉트 확인
3. browser_navigate → http://localhost:3000/admin/documents
4. browser_snapshot → /admin/login으로 리다이렉트 확인 (세션 무효화 검증)
```

### 시나리오 3: 문서 생성 및 사용자 페이지 표시 검증

```
1. (로그인 상태에서) browser_navigate → http://localhost:3000/admin/documents/new
2. browser_fill → 제목 필드에 "테스트 문서" 입력
3. browser_click → Milkdown 편집기 클릭
4. browser_type → "테스트 내용입니다." 입력
5. browser_click → 상태 드롭다운 → "Published" 선택
6. browser_click → 저장 버튼 클릭
7. browser_snapshot → 문서 목록으로 이동, "테스트 문서" 표시 확인
8. browser_network_requests → Supabase REST API 201 응답 확인
9. browser_navigate → http://localhost:3000 (사용자 페이지)
10. browser_snapshot → 사이드바 또는 본문에 방금 작성한 문서 표시 확인
```

### 시나리오 4: RLS 검증 (비인증 상태에서 draft 문서 접근 차단)

```
1. (로그아웃 상태에서) browser_navigate → http://localhost:3000/docs/[draft-문서-slug]
2. browser_snapshot → 404 페이지 또는 리다이렉트 확인
3. browser_network_requests → Supabase 쿼리 결과 empty (RLS 차단) 확인
```

### 시나리오 5: 메뉴 CRUD 및 사이드바 반영 검증

```
1. (로그인 상태에서) browser_navigate → http://localhost:3000/admin/menus
2. browser_snapshot → 메뉴 트리 및 추가 버튼 확인
3. browser_click → 메뉴 추가 버튼
4. browser_fill → 메뉴 이름 입력 ("신규 메뉴")
5. browser_click → 저장 버튼
6. browser_snapshot → 메뉴 목록에 "신규 메뉴" 표시 확인
7. browser_navigate → http://localhost:3000 (사용자 페이지)
8. browser_snapshot → 사이드바에 "신규 메뉴" 표시 확인
```

### 시나리오 6: 이미지 업로드 검증

```
1. (로그인 상태에서) 문서 편집 페이지 접속
2. browser_network_requests → 이미지 업로드 후 Supabase Storage API 호출 확인
3. browser_snapshot → 업로드된 이미지 URL이 supabase.co 도메인인지 확인
   (이미지 드래그앤드롭/파일 선택은 Playwright MCP 제한으로 수동 검증 필요)
```

### 수동 검증 필요 항목

- ⬜ 이미지 파일 선택/드래그앤드롭 후 편집기 내 이미지 렌더링 확인
- ⬜ 로컬 `public/uploads/` 파일이 더 이상 생성되지 않는지 확인
- ⬜ Supabase Storage 버킷에 업로드된 이미지 파일 존재 확인

---

## 기술 고려사항

### Next.js 16 특이사항 (필수 준수)

- `params`와 `searchParams`는 모두 `Promise<{}>` 타입 → 반드시 `await params` 사용
- `cookies()`, `headers()` 함수도 `await` 필요
- 서버 액션(Server Actions)에서 `redirect()`는 `try/catch` 내부 호출 금지 (NEXT_REDIRECT 에러를 throw하므로 catch에서 잡힘)

### Supabase 클라이언트 사용 원칙

| 사용 위치 | 사용할 클라이언트 | import |
|-----------|------------------|--------|
| 서버 컴포넌트 | `createServerClient` | `@/lib/supabase/server` |
| 클라이언트 컴포넌트 | `createBrowserClient` | `@/lib/supabase/client` |
| middleware.ts | `createServerClient` | `@/lib/supabase/middleware` |
| Route Handler | `createServerClient` | `@/lib/supabase/server` |

### RLS 정책 검증 방법

- Supabase Dashboard → Table Editor → "View as role: anon" 으로 실제 접근 가능 데이터 확인
- `curl` 또는 `httpie`로 직접 REST API 호출하여 비인증 상태 검증:
  ```bash
  curl 'https://[project].supabase.co/rest/v1/documents?status=eq.draft' \
    -H 'apikey: [anon-key]'
  ```
  예상 응답: `[]` (빈 배열 — RLS 차단됨)

### 환경변수 관리

- `.env.local`: 로컬 개발용 (`.gitignore`에 포함, 커밋 금지)
- Vercel 배포 시 대시보드에서 환경변수 직접 설정
- `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트 사이드에 노출 금지 (`NEXT_PUBLIC_` 접두사 사용 금지)

### 기술 부채 해소 항목 (Sprint 3에서 처리)

- Sprint 1-2에서 사용한 모든 mock 데이터 (`lib/mock-data.ts`) 실제 DB 연동으로 교체
- 로컬 이미지 저장 방식 → Supabase Storage로 완전 대체

---

## 예상 산출물

Sprint 3 완료 시 다음 결과물이 도출됩니다:

1. **동작하는 MVP**: 관리자 문서 작성 → 게시 → 사용자 열람 end-to-end 플로우
2. **인증 시스템**: Supabase Auth 기반 이메일/비밀번호 로그인 + 자동 세션 관리
3. **DB 스키마**: `profiles`, `menus`, `documents`, `document_history` 테이블 + RLS 정책
4. **API 레이어**: `lib/api/documents.ts`, `lib/api/menus.ts`, `lib/api/users.ts`, `lib/api/storage.ts`
5. **Supabase Storage**: 이미지 업로드 마이그레이션 완료
6. **Phase 1 마일스톤 달성**: 관리자가 문서를 작성하고 고객이 열람할 수 있는 최소 기능 플랫폼

---

## 의존성 및 리스크

| 리스크 | 영향도 | 완화 전략 |
|--------|--------|-----------|
| Supabase 프로젝트 생성 및 환경변수 설정 필요 | 높음 | 스프린트 시작 전 Supabase 계정 및 프로젝트 준비 |
| Next.js 16의 `params` Promise 타입으로 인한 런타임 에러 | 높음 | 모든 동적 라우트에서 `await params` 패턴 통일 |
| RLS 정책 설정 오류로 인한 데이터 노출 | 높음 | Supabase Dashboard에서 anon 역할로 접근 테스트 |
| `@supabase/ssr` 쿠키 설정 오류로 세션 미유지 | 중간 | 공식 Next.js App Router 가이드 정확히 따를 것 |
| 기존 로컬 이미지 URL이 편집기 내 깨질 수 있음 | 낮음 | Storage 마이그레이션 후 기존 이미지 URL 업데이트 필요시 스크립트 작성 |

---

*Sprint 3 계획 수립일: 2026-03-13*
*다음 스프린트: Sprint 4 — 검색 + 수정 이력 + 이전/다음 네비게이션*
