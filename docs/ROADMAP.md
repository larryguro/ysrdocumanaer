# 프로젝트 로드맵 - 의사랑 기술문서 사이트

## 개요
- **목표**: 의사랑 프로그램의 변경내역서 및 사용방법을 고객에게 공지하는 기술문서 플랫폼 구축
- **전체 예상 기간**: 7 스프린트 (약 10-14주)
- **현재 진행 단계**: Phase 1 준비 중
- **최종 갱신일**: 2026-03-13

---

## 진행 상태 범례
- ✅ 완료
- 🔄 진행 중
- 📋 예정
- ⏸️ 보류

---

## 프로젝트 현황 대시보드

| 항목 | 상태 |
|------|------|
| 전체 진행률 | 29% (2/7 스프린트 완료) |
| 현재 Phase | Phase 1 (MVP) 진행 중 |
| 다음 마일스톤 | Sprint 3 완료 - MVP (Supabase 연동) |
| 총 스프린트 | 7 |

---

## 기술 아키텍처 결정 사항

| 결정 사항 | 선택 | 이유 |
|-----------|------|------|
| 프레임워크 | Next.js 14+ (App Router) | SSG/SSR 지원, SEO 최적화, 파일 기반 라우팅 |
| 백엔드/DB | Supabase (PostgreSQL + Auth + Storage) | BaaS로 개발 속도 향상, RLS 보안, 실시간 기능 |
| 편집기 | Milkdown | 플러그인 기반 WYSIWYG, 활발한 유지보수, MIT 라이선스 |
| 스타일링 | Tailwind CSS | 유틸리티 기반, 빠른 UI 구현, 반응형 지원 |
| Markdown 렌더링 | react-markdown + remark-gfm | 검증된 라이브러리, GFM 지원 |
| 코드 하이라이팅 | rehype-highlight 또는 shiki | Phase 3에서 결정 |
| 드래그앤드롭 | @dnd-kit/core | 접근성 지원, 트리 구조 지원 |
| 배포 | Vercel | Next.js 최적화 배포, CI/CD 자동화 |
| 권한 모델 | MVP: 단일 admin 역할 | profiles.role 컬럼 미리 추가, Phase 2/3에서 세분화 |
| 버전 관리 | Phase 1 제외 | MVP는 단일 버전 운영, Phase 3에서 versions 테이블 추가 |

---

## 의존성 맵

```
Sprint 1: 프로젝트 세팅 + 사용자 레이아웃 (프론트엔드)
    ↓
Sprint 2: 관리자 UI (프론트엔드) — Sprint 1 레이아웃 컴포넌트 재사용
    ↓
Sprint 3: Supabase 연동 (백엔드) — Sprint 1, 2의 UI에 데이터 바인딩
    ↓
Sprint 4: 검색 + 이력 + 네비게이션 (기능 완성)
    ↓
Sprint 5: 드래그앤드롭 메뉴 + 반응형 최적화
    ↓
Sprint 6: TOC + 코드 하이라이팅 + 이미지 업로드
    ↓
Sprint 7: SEO + 버전 관리 + 권한 세분화
```

---

## Phase 1: MVP (Sprint 1-3) 📋

> **핵심 가치**: 관리자가 문서를 작성하고, 고객이 열람할 수 있는 최소 기능 플랫폼

---

### Sprint 1: 프로젝트 세팅 + 사용자 페이지 레이아웃 (1-2주) ✅

#### 목표
Next.js 프로젝트 초기 세팅을 완료하고, 사용자 페이지의 전체 레이아웃(헤더, 사이드바, 본문 영역)을 정적 목업 수준으로 구현한다.

#### 작업 목록

- ⬜ **프로젝트 초기화**: Next.js 14+ App Router 프로젝트 생성
  - `npx create-next-app@latest` 실행 (TypeScript, Tailwind CSS, App Router 선택)
  - ESLint, Prettier 설정
  - 프로젝트 디렉토리 구조 확정: `app/`, `components/`, `lib/`, `types/`
  - 복잡도: 낮음

- ⬜ **공통 레이아웃 컴포넌트**: 사용자 페이지 기본 구조 구현
  - `components/layout/Header.tsx` — 로고, 사이트명, 검색바(비활성 placeholder), (관리자 링크)
  - `components/layout/Sidebar.tsx` — 4 depth 계층형 메뉴 (정적 데이터로 렌더링)
  - `components/layout/MainContent.tsx` — 본문 영역 래퍼
  - `app/layout.tsx` — 전체 레이아웃 조합
  - 복잡도: 중간

- ⬜ **사이드바 메뉴 컴포넌트**: 계층형 메뉴 UI 구현
  - `components/sidebar/MenuTree.tsx` — 재귀적 메뉴 트리 렌더링
  - `components/sidebar/MenuItem.tsx` — 개별 메뉴 아이템 (접기/펼치기 Accordion)
  - 현재 위치 하이라이트 (active 상태 표시)
  - 정적 mock 데이터로 4 depth까지 렌더링 확인
  - 복잡도: 중간

- ⬜ **문서 뷰어 페이지**: Markdown 렌더링 기본 구현
  - `app/docs/[...slug]/page.tsx` — 동적 라우팅 설정
  - `react-markdown` + `remark-gfm` 설치 및 설정
  - `components/document/DocumentViewer.tsx` — Markdown을 HTML로 렌더링
  - 정적 Markdown 샘플 문서로 렌더링 확인 (heading, paragraph, list, table, code block, 콜아웃)
  - 복잡도: 중간

- ⬜ **라우팅 설정**: 기본 페이지 라우팅
  - `app/page.tsx` — 루트에서 첫 번째 문서로 리다이렉트
  - `app/docs/[...slug]/page.tsx` — 문서 뷰어
  - `app/search/page.tsx` — 검색 결과 페이지 (빈 placeholder)
  - 복잡도: 낮음

#### 완료 기준 (Definition of Done)
- ✅ `npm run dev`로 로컬 서버 실행 시 사용자 레이아웃이 정상 렌더링
- ✅ 사이드바에 4 depth 메뉴가 mock 데이터로 표시
- ✅ 문서 뷰어에서 샘플 Markdown이 정상 렌더링
- ✅ `npm run build` 빌드 에러 없음
- ✅ TypeScript 타입 에러 없음

#### 🧪 Playwright MCP 검증 시나리오
> `npm run dev` 실행 후 아래 순서로 검증

**레이아웃 렌더링 검증:**
1. `browser_navigate` → `http://localhost:3000` 접속
2. `browser_snapshot` → 헤더(로고, 검색바), 사이드바, 본문 영역 존재 확인
3. `browser_console_messages(level: "error")` → 콘솔 에러 없음 확인

**사이드바 메뉴 검증:**
1. `browser_snapshot` → 메뉴 트리 아이템 존재 확인
2. `browser_click` → 접기/펼치기 토글 클릭
3. `browser_snapshot` → 하위 메뉴 표시/숨김 상태 변화 확인
4. `browser_click` → 메뉴 아이템 클릭
5. `browser_snapshot` → active 상태 하이라이트 확인

**문서 뷰어 검증:**
1. `browser_navigate` → `http://localhost:3000/docs/sample` 접속
2. `browser_snapshot` → Markdown 렌더링 결과 확인 (heading, paragraph, code block 등)
3. `browser_console_messages(level: "error")` → 에러 없음 확인

#### 기술 고려사항
- Next.js App Router의 서버 컴포넌트와 클라이언트 컴포넌트 구분 명확히 할 것
- 사이드바 Accordion은 클라이언트 컴포넌트(`'use client'`)로 구현
- 정적 mock 데이터는 `lib/mock-data.ts`에 중앙 관리
- Tailwind CSS로 반응형 기본 뼈대만 잡고, 모바일 최적화는 Sprint 5에서 완성

---

### Sprint 2: 관리자 UI (프론트엔드) (1-2주) ✅

#### 목표
관리자 페이지의 전체 UI를 정적 목업 수준으로 구현한다. 로그인 폼, 문서 CRUD 화면, Milkdown 편집기, 메뉴 관리, 사용자 관리 화면을 모두 포함한다.

#### 작업 목록

- ⬜ **관리자 레이아웃**: 관리자 전용 레이아웃 구현
  - `app/admin/layout.tsx` — 관리자 헤더(로고, 로그아웃 버튼) + 사이드바(문서관리, 메뉴관리, 사용자관리)
  - `components/admin/AdminSidebar.tsx` — 관리 메뉴 사이드바
  - `components/admin/AdminHeader.tsx` — 관리자 헤더
  - 복잡도: 낮음

- ⬜ **로그인 페이지**: 관리자 로그인 UI
  - `app/admin/login/page.tsx` — 이메일/비밀번호 입력 폼
  - 유효성 검사 UI (빈 필드, 이메일 형식)
  - 로그인 실패 시 에러 메시지 표시 영역
  - Supabase 연동 없이 폼 UI만 구현 (submit 시 console.log)
  - 복잡도: 낮음

- ⬜ **문서 목록 페이지**: 문서 관리 리스트 UI
  - `app/admin/documents/page.tsx` — 테이블 형태 (제목, 카테고리, 수정자, 수정일, 상태)
  - 상태 배지: Draft(회색), Published(초록)
  - 문서 작성 버튼, 각 행에 편집/삭제 액션
  - mock 데이터로 5-10개 문서 목록 렌더링
  - 복잡도: 중간

- ⬜ **문서 작성/수정 페이지 + Milkdown 편집기**: WYSIWYG 편집기 통합
  - `app/admin/documents/new/page.tsx` — 문서 작성
  - `app/admin/documents/[id]/edit/page.tsx` — 문서 수정
  - `components/editor/MilkdownEditor.tsx` — Milkdown 편집기 래퍼 컴포넌트
  - Milkdown 플러그인 설정: commonmark, gfm, clipboard, listener
  - 제목 입력, 슬러그 자동 생성, 상태 선택(Draft/Published), 메뉴 연결 드롭다운
  - 저장/취소 버튼 (Supabase 연동 없이 console.log)
  - 복잡도: 높음 (Milkdown 통합이 핵심 난이도)

- ⬜ **메뉴 관리 페이지**: 메뉴 트리 관리 UI
  - `app/admin/menus/page.tsx` — 메뉴 트리 표시
  - `components/admin/MenuTreeEditor.tsx` — 메뉴 추가/이름변경/삭제 UI (드래그앤드롭 제외)
  - 메뉴 항목에 문서 연결 드롭다운
  - mock 데이터로 4 depth 트리 렌더링
  - 복잡도: 중간

- ⬜ **사용자 관리 페이지**: 관리자 목록 UI
  - `app/admin/users/page.tsx` — 관리자 목록 테이블
  - 관리자 추가 모달/폼, 비활성화 토글
  - mock 데이터로 렌더링
  - 복잡도: 낮음

#### 완료 기준 (Definition of Done)
- ✅ `/admin/login` 로그인 폼 렌더링 및 유효성 검사 UI 동작
- ✅ `/admin/documents` 문서 목록 테이블 mock 데이터 렌더링
- ✅ `/admin/documents/new` Milkdown 편집기 정상 로드 및 텍스트 입력 가능
- ✅ `/admin/menus` 메뉴 트리 mock 데이터 렌더링
- ✅ `/admin/users` 관리자 목록 mock 데이터 렌더링
- ✅ `npm run build` 빌드 에러 없음

#### 🧪 Playwright MCP 검증 시나리오
> `npm run dev` 실행 후 아래 순서로 검증

**로그인 페이지 검증:**
1. `browser_navigate` → `http://localhost:3000/admin/login` 접속
2. `browser_snapshot` → 이메일/비밀번호 입력 필드, 로그인 버튼 존재 확인
3. `browser_click` → 로그인 버튼 클릭 (빈 필드 상태)
4. `browser_snapshot` → 유효성 검사 에러 메시지 표시 확인

**문서 목록 검증:**
1. `browser_navigate` → `http://localhost:3000/admin/documents` 접속
2. `browser_snapshot` → 문서 테이블, 작성 버튼 존재 확인

**Milkdown 편집기 검증:**
1. `browser_navigate` → `http://localhost:3000/admin/documents/new` 접속
2. `browser_snapshot` → 편집기 영역, 제목 입력 필드, 저장 버튼 존재 확인
3. `browser_click` → 편집기 영역 클릭
4. `browser_type` → 테스트 텍스트 입력
5. `browser_snapshot` → 입력된 텍스트 렌더링 확인
6. `browser_console_messages(level: "error")` → 에러 없음 확인

**메뉴 관리 검증:**
1. `browser_navigate` → `http://localhost:3000/admin/menus` 접속
2. `browser_snapshot` → 메뉴 트리, 추가 버튼 존재 확인

**사용자 관리 검증:**
1. `browser_navigate` → `http://localhost:3000/admin/users` 접속
2. `browser_snapshot` → 관리자 목록 테이블 존재 확인

#### 기술 고려사항
- Milkdown은 클라이언트 전용 라이브러리이므로 `'use client'` 필수, `dynamic import`로 SSR 비활성화
- Milkdown 플러그인 최소한으로 시작: `@milkdown/preset-commonmark`, `@milkdown/preset-gfm`
- 관리자 레이아웃은 사용자 레이아웃과 별도 layout.tsx 사용
- 이 스프린트에서는 인증/인가 로직 없이 UI만 구현 (Sprint 3에서 연동)

---

### Sprint 3: Supabase 연동 (백엔드) (1-2주) 🔄

#### 목표
Sprint 1-2에서 구현한 프론트엔드 UI에 Supabase 백엔드를 연동하여 실제 데이터 CRUD가 동작하는 MVP를 완성한다.

#### 작업 목록

- ⬜ **Supabase 프로젝트 설정**: DB, Auth, Storage 초기 설정
  - Supabase 프로젝트 생성 및 환경변수 설정 (`.env.local`)
  - `lib/supabase/client.ts` — 브라우저용 Supabase 클라이언트
  - `lib/supabase/server.ts` — 서버 컴포넌트용 Supabase 클라이언트
  - `types/database.ts` — Supabase DB 타입 정의 (supabase gen types)
  - 복잡도: 중간

- ⬜ **데이터베이스 스키마 생성**: SQL 마이그레이션
  - `profiles` 테이블 생성 (id, role DEFAULT 'admin')
  - `menus` 테이블 생성 (id, parent_id, title, order_index, depth)
  - `documents` 테이블 생성 (id, title, slug, content, status, menu_id, created_by, updated_by, timestamps)
  - `document_history` 테이블 생성 (id, document_id, content, updated_by, updated_at, summary)
  - RLS 정책 설정: 공개 문서는 누구나 읽기, 관리자만 쓰기
  - 복잡도: 중간

- ⬜ **인증 연동**: Supabase Auth 통합
  - `app/admin/login/page.tsx` — Supabase Auth signInWithPassword 연동
  - `middleware.ts` — `/admin` 경로 접근 시 세션 확인, 미인증 시 리다이렉트
  - `components/admin/AdminHeader.tsx` — 로그아웃 기능 연동
  - `lib/supabase/auth.ts` — 인증 헬퍼 함수
  - 복잡도: 중간

- ⬜ **문서 CRUD 연동**: 문서 데이터 Supabase 연동
  - `lib/api/documents.ts` — 문서 CRUD 함수 (create, read, update, delete, list)
  - `app/admin/documents/page.tsx` — 실제 DB 데이터로 문서 목록 렌더링
  - `app/admin/documents/new/page.tsx` — 문서 저장 시 Supabase INSERT
  - `app/admin/documents/[id]/edit/page.tsx` — 문서 수정 시 Supabase UPDATE
  - 문서 삭제 기능 연동
  - 문서 상태(draft/published) 변경 연동
  - 복잡도: 중간

- ⬜ **메뉴 CRUD 연동**: 메뉴 데이터 Supabase 연동
  - `lib/api/menus.ts` — 메뉴 CRUD 함수
  - `app/admin/menus/page.tsx` — 실제 DB 데이터로 메뉴 트리 렌더링
  - 사용자 사이드바에 DB 기반 메뉴 데이터 반영
  - 복잡도: 중간

- ⬜ **사용자 페이지 데이터 연동**: 공개 페이지 DB 연동
  - 사이드바 메뉴를 DB에서 조회하여 렌더링
  - 문서 뷰어에서 slug 기반 문서 조회 및 Markdown 렌더링
  - published 상태 문서만 공개 페이지에 노출
  - 루트(`/`) 접속 시 첫 번째 published 문서로 리다이렉트
  - 복잡도: 중간

- ⬜ **사용자 관리 연동**: 관리자 계정 관리
  - `lib/api/users.ts` — 관리자 목록 조회, 프로필 관리
  - `app/admin/users/page.tsx` — 실제 DB 데이터로 관리자 목록 렌더링
  - 복잡도: 낮음

#### 완료 기준 (Definition of Done)
- ✅ 관리자 이메일/비밀번호 로그인 성공 및 세션 유지
- ✅ 미인증 사용자 `/admin` 접근 시 로그인 페이지 리다이렉트
- ✅ 관리자가 문서를 작성/수정/삭제할 수 있음
- ✅ 작성된 문서가 사용자 페이지(`/docs/[slug]`)에서 정상 열람
- ✅ 메뉴 추가/수정/삭제 후 사용자 사이드바에 반영
- ✅ RLS 정책 동작: 비인증 사용자는 published 문서만 조회 가능
- ✅ `npm run build` 빌드 에러 없음

#### 🧪 Playwright MCP 검증 시나리오
> `npm run dev` 실행 후 아래 순서로 검증

**인증 플로우 검증:**
1. `browser_navigate` → `http://localhost:3000/admin` 접속
2. `browser_snapshot` → 로그인 페이지로 리다이렉트 확인
3. `browser_fill_form` → 이메일/비밀번호 입력
4. `browser_click` → 로그인 버튼 클릭
5. `browser_wait_for` → 관리자 대시보드 로드 대기
6. `browser_snapshot` → 관리자 대시보드 정상 표시 확인
7. `browser_network_requests` → Supabase Auth API 200 응답 확인

**문서 CRUD 검증:**
1. `browser_navigate` → `http://localhost:3000/admin/documents/new` 접속
2. `browser_type` → 제목 입력
3. `browser_click` → Milkdown 편집기에 본문 입력
4. `browser_click` → 저장 버튼 클릭
5. `browser_wait_for` → 문서 목록으로 이동 대기
6. `browser_snapshot` → 생성된 문서가 목록에 표시 확인
7. `browser_network_requests` → Supabase REST API 201 응답 확인

**사용자 페이지 데이터 연동 검증:**
1. `browser_navigate` → `http://localhost:3000` 접속
2. `browser_snapshot` → 사이드바에 DB 기반 메뉴 표시, 본문에 문서 렌더링 확인
3. `browser_click` → 메뉴 항목 클릭
4. `browser_snapshot` → 해당 문서 내용 렌더링 확인
5. `browser_console_messages(level: "error")` → 에러 없음 확인

#### 기술 고려사항
- Supabase 클라이언트 생성 시 서버/클라이언트 구분 필수 (`createServerComponentClient` vs `createBrowserClient`)
- Next.js middleware에서 Supabase 세션 확인 시 `@supabase/ssr` 패키지 사용
- RLS 정책은 최소한으로 설정: `documents` 테이블에 `SELECT`는 `status = 'published'`일 때 공개, `INSERT/UPDATE/DELETE`는 인증된 사용자만
- `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정 (커밋하지 않음)
- 문서 slug 자동 생성: 한글 제목을 slugify 처리 (예: `nanoid` 또는 한글 slug 허용)

---

## Phase 1 마일스톤: MVP 릴리스 🎯

> Sprint 3 완료 시점에 MVP로 배포 가능한 상태
> - 관리자가 문서를 작성하고 게시할 수 있다
> - 고객이 문서를 열람할 수 있다
> - 메뉴 구조를 관리할 수 있다

---

## Phase 2: 완성도 (Sprint 4-5) 📋

> **핵심 가치**: 검색, 네비게이션, 이력 관리 등 사용성을 크게 향상시키는 기능 추가

---

### Sprint 4: 검색 + 수정 이력 + 이전/다음 네비게이션 (1-2주) 📋

#### 목표
전문 검색 기능, 문서 수정 이력 보기, 이전/다음 문서 네비게이션을 구현하여 사용자 경험을 향상시킨다.

#### 작업 목록

- ⬜ **전문 검색 (Full-text Search)**: Supabase 기반 검색 구현
  - Supabase SQL: `documents` 테이블에 `tsvector` 컬럼 추가 및 GIN 인덱스 생성
  - `lib/api/search.ts` — 검색 쿼리 함수 (제목 + 본문 검색)
  - `app/search/page.tsx` — 검색 결과 페이지 구현 (매칭 키워드 하이라이팅)
  - `components/layout/Header.tsx` — 검색바 기능 활성화 (입력 시 `/search?q=` 이동)
  - `components/search/SearchResultItem.tsx` — 검색 결과 아이템 (제목, 본문 발췌, 하이라이트)
  - 복잡도: 높음

- ⬜ **수정 이력 보기**: 문서별 변경 이력 조회
  - `app/admin/documents/[id]/history/page.tsx` — 수정 이력 목록 (수정자, 수정일, 변경 요약)
  - `lib/api/history.ts` — 이력 조회 함수
  - 문서 저장 시 `document_history` 테이블에 스냅샷 자동 저장 로직 추가
  - `components/admin/HistoryList.tsx` — 이력 목록 컴포넌트
  - 복잡도: 중간

- ⬜ **이전/다음 문서 네비게이션**: 문서 하단 네비게이션 버튼
  - `components/document/DocumentNavigation.tsx` — [← 이전 문서] [다음 문서 →] 버튼
  - 메뉴 순서 기반으로 이전/다음 문서 결정 (order_index, depth 기준)
  - `lib/api/documents.ts`에 이전/다음 문서 조회 함수 추가
  - 복잡도: 중간

#### 완료 기준 (Definition of Done)
- ✅ 검색바에 키워드 입력 시 제목+본문 전문 검색 결과 표시
- ✅ 검색 결과에서 매칭 키워드가 하이라이트 처리
- ✅ 문서 수정 시 `document_history`에 이력 자동 저장
- ✅ `/admin/documents/[id]/history`에서 수정 이력 목록 조회 가능
- ✅ 문서 하단에 이전/다음 네비게이션 버튼 동작

#### 🧪 Playwright MCP 검증 시나리오
> `npm run dev` 실행 후 아래 순서로 검증

**검색 기능 검증:**
1. `browser_navigate` → `http://localhost:3000` 접속
2. `browser_click` → 검색바 클릭
3. `browser_type` → 검색어 입력 (예: 기존 문서 제목의 일부)
4. `browser_snapshot` → 검색 결과 페이지 이동 확인
5. `browser_snapshot` → 검색 결과 목록 및 키워드 하이라이트 확인
6. `browser_network_requests` → Supabase 검색 API 200 응답 확인

**검색 결과 없음 확인:**
1. `browser_navigate` → `http://localhost:3000/search?q=존재하지않는키워드`
2. `browser_snapshot` → "검색 결과 없음" 메시지 확인

**수정 이력 검증:**
1. 관리자 로그인 후 문서 수정 → 저장
2. `browser_navigate` → `http://localhost:3000/admin/documents/[id]/history`
3. `browser_snapshot` → 수정 이력 항목 (수정자, 수정일, 요약) 표시 확인

**이전/다음 네비게이션 검증:**
1. `browser_navigate` → 중간 순서 문서 페이지 접속
2. `browser_snapshot` → 하단에 이전/다음 버튼 존재 확인
3. `browser_click` → "다음 문서" 클릭
4. `browser_snapshot` → 다음 문서로 이동 확인

#### 기술 고려사항
- Full-text Search: Supabase `textSearch` 또는 `pg_trgm` 확장 사용, 한국어 검색을 위해 `pg_trgm` 권장
- 검색 인덱스 갱신: 문서 저장 시 tsvector 컬럼 자동 업데이트 트리거 설정
- document_history 저장: 문서 UPDATE 시 이전 content를 history에 INSERT하는 로직 (DB 트리거 또는 애플리케이션 레벨)
- 이전/다음 문서: 메뉴 트리 구조를 flat하게 정렬하여 순서 결정

---

### Sprint 5: 드래그앤드롭 메뉴 정렬 + 반응형 모바일 최적화 (1-2주) 📋

#### 목표
메뉴 구조를 드래그앤드롭으로 재정렬할 수 있게 하고, 모바일/태블릿에서의 사용성을 완성한다.

#### 작업 목록

- ⬜ **드래그앤드롭 메뉴 정렬**: @dnd-kit 기반 트리 정렬
  - `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` 설치
  - `components/admin/DndMenuTree.tsx` — 드래그앤드롭 가능한 메뉴 트리
  - 드래그 시 순서(order_index) 및 부모(parent_id) 변경 지원
  - depth 이동 제한: 최대 4 depth 초과 불가
  - 변경 후 Supabase에 batch update
  - 복잡도: 높음

- ⬜ **반응형 모바일 최적화**: 모바일/태블릿 레이아웃 완성
  - 사용자 사이드바: 모바일에서 햄버거 버튼으로 토글 (오버레이)
  - 관리자 레이아웃: 모바일 대응 (사이드바 접기/펼치기)
  - 문서 뷰어: 모바일에서 가독성 최적화 (폰트 크기, 여백, 코드 블록 스크롤)
  - 헤더 검색바: 모바일에서 아이콘 클릭 시 확장
  - Tailwind CSS breakpoint 기반 (`sm:`, `md:`, `lg:`)
  - 복잡도: 중간

#### 완료 기준 (Definition of Done)
- ✅ 관리자가 메뉴를 드래그앤드롭으로 순서 변경 가능
- ✅ 드래그앤드롭으로 메뉴의 부모 변경(depth 이동) 가능 (4 depth 제한)
- ✅ 모바일(375px)에서 햄버거 메뉴 토글 정상 동작
- ✅ 태블릿(768px), 데스크톱(1024px+)에서 레이아웃 정상 표시
- ✅ 모든 페이지에서 가로 스크롤 없음

#### 🧪 Playwright MCP 검증 시나리오
> `npm run dev` 실행 후 아래 순서로 검증

**드래그앤드롭 메뉴 검증:**
1. 관리자 로그인 후 `browser_navigate` → `http://localhost:3000/admin/menus`
2. `browser_snapshot` → 메뉴 트리 항목에 드래그 핸들 존재 확인
3. (드래그앤드롭은 Playwright MCP에서 직접 테스트 어려움 - 수동 검증 필요)
4. `browser_console_messages(level: "error")` → 에러 없음 확인

**반응형 모바일 검증:**
1. `browser_navigate` → `http://localhost:3000` 접속
2. `browser_resize` → width: 375, height: 812 (모바일)
3. `browser_snapshot` → 사이드바 숨김, 햄버거 버튼 표시 확인
4. `browser_click` → 햄버거 버튼 클릭
5. `browser_snapshot` → 사이드바 오버레이 표시 확인
6. `browser_resize` → width: 1024, height: 768 (데스크톱)
7. `browser_snapshot` → 사이드바 항상 표시 확인

#### 기술 고려사항
- @dnd-kit 트리 구조: `@dnd-kit/sortable`의 `SortableContext`와 커스텀 드래그 오버레이 필요
- 드래그앤드롭 시 낙관적 업데이트(Optimistic Update) 적용 후 실패 시 롤백
- 모바일 사이드바: `position: fixed` + backdrop overlay, `z-index` 관리
- Tailwind 반응형: `lg:hidden`, `lg:block` 등으로 분기

---

## Phase 2 마일스톤: 완성도 릴리스 🎯

> Sprint 5 완료 시점
> - 전문 검색으로 문서를 빠르게 찾을 수 있다
> - 문서 수정 이력을 추적할 수 있다
> - 메뉴 구조를 직관적으로 재정렬할 수 있다
> - 모바일에서도 불편 없이 사용할 수 있다

---

## Phase 3: 고도화 (Sprint 6-7) 📋

> **핵심 가치**: 문서 품질 향상, SEO, 버전 관리, 권한 세분화를 통한 프로덕션 수준 완성

---

### Sprint 6: TOC + 코드 하이라이팅 + 이미지 업로드 (1-2주) 📋

#### 목표
문서 열람 품질을 높이는 TOC 자동 생성, 코드 신택스 하이라이팅을 구현하고, 편집기에서 이미지 업로드를 지원한다.

#### 작업 목록

- ⬜ **문서 TOC 자동 생성**: h2, h3 기반 목차
  - `components/document/TableOfContents.tsx` — 문서 우측에 TOC 표시
  - Markdown 파싱 시 heading 추출하여 TOC 데이터 생성
  - 스크롤 위치에 따른 현재 섹션 하이라이트 (IntersectionObserver)
  - TOC 항목 클릭 시 해당 섹션으로 스크롤
  - 데스크톱: 우측 고정, 모바일: 문서 상단에 접을 수 있는 TOC
  - 복잡도: 중간

- ⬜ **코드 블록 신택스 하이라이팅**: rehype-highlight 또는 shiki 통합
  - `react-markdown`의 rehype 플러그인으로 코드 하이라이팅 적용
  - 지원 언어: JavaScript, TypeScript, Python, SQL, JSON, Bash, HTML, CSS 등
  - 코드 블록에 언어 표시 라벨 및 복사 버튼 추가
  - 다크/라이트 테마 대응
  - 복잡도: 중간

- ⬜ **이미지 업로드 (Supabase Storage)**: 편집기 내 이미지 관리
  - Supabase Storage 버킷 생성 (`documents-images`)
  - `lib/api/storage.ts` — 이미지 업로드/삭제/URL 생성 함수
  - Milkdown 편집기에 이미지 업로드 플러그인 추가 (드래그앤드롭 또는 버튼)
  - 업로드된 이미지는 Supabase Storage에 저장, Markdown에 URL 삽입
  - 이미지 최대 크기 제한 (5MB)
  - 복잡도: 중간

#### 완료 기준 (Definition of Done)
- ✅ 문서 우측에 h2/h3 기반 TOC 자동 생성 및 클릭 시 스크롤 이동
- ✅ 스크롤 위치에 따라 TOC 현재 섹션 하이라이트
- ✅ 코드 블록에 신택스 하이라이팅 적용 (최소 5개 언어)
- ✅ 코드 블록에 복사 버튼 동작
- ✅ Milkdown 편집기에서 이미지 업로드 후 문서에 이미지 표시

#### 🧪 Playwright MCP 검증 시나리오
> `npm run dev` 실행 후 아래 순서로 검증

**TOC 검증:**
1. `browser_navigate` → heading이 여러 개인 문서 페이지 접속
2. `browser_snapshot` → 우측에 TOC 목록 존재 확인
3. `browser_click` → TOC 항목 클릭
4. `browser_snapshot` → 해당 섹션으로 스크롤 이동 확인

**코드 하이라이팅 검증:**
1. `browser_navigate` → 코드 블록이 포함된 문서 페이지 접속
2. `browser_snapshot` → 코드 블록에 하이라이팅 스타일 적용 확인
3. `browser_click` → 코드 복사 버튼 클릭
4. `browser_snapshot` → 복사 완료 피드백 확인

**이미지 업로드 검증:**
1. 관리자 로그인 후 문서 편집 페이지 접속
2. (이미지 드래그앤드롭/파일 선택은 Playwright MCP 제한 - 수동 검증 필요)
3. `browser_network_requests` → Supabase Storage API 호출 확인

#### 기술 고려사항
- TOC: `react-markdown`의 커스텀 컴포넌트 또는 별도 heading 추출 유틸리티
- 코드 하이라이팅: shiki는 빌드 시간이 길어질 수 있으므로 rehype-highlight 우선 시도
- 이미지 업로드: Supabase Storage RLS 정책 설정 (인증된 사용자만 업로드)
- 이미지 URL: Supabase public URL 또는 signed URL 사용 결정 필요

---

### Sprint 7: SEO + 버전 관리 + 권한 세분화 (1-2주) 📋

#### 목표
SEO 최적화로 검색 엔진 노출을 개선하고, 제품 버전별 문서 관리와 관리자 권한 세분화를 구현한다.

#### 작업 목록

- ⬜ **SEO 최적화**: Next.js 메타데이터 및 정적 생성
  - `app/docs/[...slug]/page.tsx`에 `generateMetadata` 함수 추가 (title, description, og:image)
  - `app/sitemap.ts` — 동적 sitemap.xml 생성
  - `app/robots.ts` — robots.txt 설정
  - 문서 페이지 SSG (`generateStaticParams`) 또는 ISR 적용
  - 시맨틱 HTML 점검 (main, article, nav, header 등)
  - Lighthouse SEO 점수 90+ 목표
  - 복잡도: 중간

- ⬜ **버전 관리**: versions 테이블 및 버전 선택 UI
  - `versions` 테이블 생성 (id, label, is_default, created_at)
  - `documents` 테이블에 `version_id` 컬럼 추가
  - `menus` 테이블에 `version_id` 컬럼 추가
  - 관리자: 버전 생성/관리 UI (`app/admin/versions/page.tsx`)
  - 사용자: 헤더에 버전 선택 드롭다운 추가
  - 버전 전환 시 해당 버전의 메뉴/문서만 표시
  - 기본 버전 설정 기능
  - 복잡도: 높음

- ⬜ **관리자 권한 세분화**: 역할 기반 접근 제어
  - `profiles.role` 값 확장: `superadmin`, `editor`
  - `superadmin`: 모든 기능 접근 (사용자 관리, 버전 관리 포함)
  - `editor`: 문서 작성/수정만 가능 (사용자 관리, 버전 관리 접근 불가)
  - RLS 정책 업데이트: 역할별 접근 제어
  - UI에서 역할에 따른 메뉴/버튼 표시/숨김
  - `lib/auth/permissions.ts` — 권한 확인 헬퍼 함수
  - 복잡도: 중간

#### 완료 기준 (Definition of Done)
- ✅ 문서 페이지 메타태그 자동 생성 (title, description, og:image)
- ✅ sitemap.xml 자동 생성, robots.txt 설정
- ✅ Lighthouse SEO 점수 90 이상
- ✅ 버전 생성/선택 후 해당 버전의 문서/메뉴만 표시
- ✅ editor 역할 사용자가 사용자 관리 페이지 접근 시 차단
- ✅ superadmin만 버전 관리/사용자 관리 가능

#### 🧪 Playwright MCP 검증 시나리오
> `npm run dev` 실행 후 아래 순서로 검증

**SEO 검증:**
1. `browser_navigate` → `http://localhost:3000/docs/[slug]` 접속
2. `browser_snapshot` → 페이지 정상 렌더링 확인
3. `browser_navigate` → `http://localhost:3000/sitemap.xml` 접속
4. `browser_snapshot` → sitemap XML 내용 확인

**버전 선택 검증:**
1. `browser_navigate` → `http://localhost:3000` 접속
2. `browser_snapshot` → 헤더에 버전 선택 드롭다운 존재 확인
3. `browser_select_option` → 다른 버전 선택
4. `browser_snapshot` → 사이드바 메뉴 및 문서가 해당 버전으로 변경 확인
5. `browser_network_requests` → 버전 기반 데이터 조회 API 200 응답 확인

**권한 세분화 검증:**
1. editor 역할 계정으로 로그인
2. `browser_navigate` → `http://localhost:3000/admin/users` 접속
3. `browser_snapshot` → 접근 차단 또는 리다이렉트 확인
4. `browser_navigate` → `http://localhost:3000/admin/documents` 접속
5. `browser_snapshot` → 문서 목록 정상 접근 확인

#### 기술 고려사항
- SEO: Next.js 14 Metadata API 사용, `generateMetadata`에서 DB 조회로 동적 메타태그 생성
- 버전 관리: URL 구조 변경 고려 (`/docs/v2.0/[slug]` 또는 쿼리 파라미터 `?version=v2.0`)
- 권한: 클라이언트 사이드(UI 숨김) + 서버 사이드(API/RLS 차단) 이중 방어
- 버전 마이그레이션: 기존 문서를 기본 버전에 자동 할당하는 마이그레이션 스크립트 필요

---

## Phase 3 마일스톤: 프로덕션 릴리스 🎯

> Sprint 7 완료 시점
> - 검색 엔진에서 문서가 잘 노출된다
> - 제품 버전별로 문서를 분리 관리할 수 있다
> - 관리자 역할에 따라 권한이 구분된다
> - 문서 품질이 프로덕션 수준이다

---

## 리스크 및 완화 전략

| 리스크 | 영향도 | 발생 확률 | 완화 전략 |
|--------|--------|-----------|-----------|
| Milkdown 편집기 통합 난이도 | 높음 | 중간 | Sprint 2 초반에 PoC 진행, 문제 시 대안 편집기(TipTap) 검토 |
| Supabase Full-text Search 한국어 지원 | 중간 | 중간 | `pg_trgm` 확장으로 유사 검색 구현, 필요 시 외부 검색 엔진(Algolia) 고려 |
| @dnd-kit 트리 구조 드래그앤드롭 복잡도 | 중간 | 높음 | 공식 문서 트리 예제 참조, 최소한의 depth 이동만 지원 후 점진 개선 |
| 1-2명 소규모 팀의 스프린트 분량 과다 | 높음 | 중간 | 각 스프린트 후 회고, 필요 시 스프린트 기간 연장 또는 범위 축소 |
| Supabase RLS 정책 설정 오류 | 높음 | 낮음 | Sprint 3에서 RLS 테스트 케이스 작성, 미인증/인증 상태별 접근 검증 |

---

## 기술 부채 관리

| 항목 | 발생 시점 | 해소 시점 | 설명 |
|------|-----------|-----------|------|
| Mock 데이터 제거 | Sprint 1-2 | Sprint 3 | 프론트엔드 개발 시 사용한 mock 데이터를 실제 DB 연동으로 교체 |
| 에러 핸들링 통일 | Sprint 3 | Sprint 4-5 | API 호출 에러 처리를 일관된 패턴으로 리팩토링 |
| 컴포넌트 접근성 검토 | Sprint 1-5 | Sprint 6-7 | 키보드 네비게이션, ARIA 속성 등 접근성 점검 |
| 타입 안전성 강화 | Sprint 3 | Sprint 4 | Supabase 자동 생성 타입과 컴포넌트 props 타입 일치 확인 |

---

## 향후 계획 (Backlog)

PRD에 명시된 확장 가능 기능 및 향후 고려 사항:

- ⬜ **다국어 지원**: i18n 프레임워크 도입 (next-intl 등), 한국어 외 언어 추가
- ⬜ **AI 검색 (RAG)**: 문서 임베딩 생성 → 벡터 검색으로 의미 기반 검색
- ⬜ **문서 내보내기**: PDF, 단일 페이지 HTML 내보내기
- ⬜ **문서 댓글/피드백**: 사용자 피드백 수집 기능
- ⬜ **분석 대시보드**: 문서별 조회수, 인기 검색어 통계
- ⬜ **실시간 협업 편집**: Supabase Realtime 기반 동시 편집
- ⬜ **API 문서 자동 생성**: OpenAPI spec 기반 API 문서 페이지

---

*이 로드맵은 Agile 원칙에 따라 각 스프린트 완료 후 회고를 통해 지속적으로 업데이트됩니다.*
*최종 갱신일: 2026-03-13*
