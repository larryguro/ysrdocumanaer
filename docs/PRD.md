# 의사랑 기술문서 사이트 — 요구사항 명세서

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 의사랑 기술문서 사이트 |
| 목적 | 의사랑 프로그램의 변경내역서 및 사용방법을 고객에게 공지하는 기술문서 플랫폼 |
| 기술 스택 | Next.js (App Router), Supabase, TypeScript, Tailwind CSS |
| 배포 환경 | Vercel (프론트엔드) + Supabase (백엔드/DB) |

---

## 2. 사용자 유형

| 역할 | 설명 |
|------|------|
| 일반 사용자 (Public) | 로그인 없이 문서를 열람할 수 있는 고객 |
| 관리자 (Admin) | 이메일/비밀번호로 로그인하여 문서를 작성·편집·관리하는 내부 직원 |

> 관리자 계정은 Supabase Auth(이메일/비밀번호)로 관리하며, 권한 있는 여러 사용자가 작성 가능

---

## 3. 공통 요구사항

- **반응형 웹**: 모바일, 태블릿, 데스크탑 모든 환경에서 정상 동작
- **문서 저장 형식**: Markdown (`.md`) — AI 학습 및 외부 참조 용이
- **다국어**: 한국어 기본 (추후 확장 고려)

---

## 4. 사용자 페이지 (Public)

### 4.1 레이아웃

```
┌─────────────────────────────────────────┐
│              상단 헤더 (GNB)              │
│  로고 | 버전 선택 | 검색바 | (관리자링크)  │
├──────────────┬──────────────────────────┤
│              │                          │
│   좌측 메뉴   │        본문 영역          │
│  (사이드바)   │   (Markdown 렌더링)       │
│              │                          │
│              ├──────────────────────────┤
│              │  [← 이전 문서] [다음 문서→]│
└──────────────┴──────────────────────────┘
```

### 4.2 상단 헤더 (GNB)
- 좌측: 서비스 로고 및 사이트명
- 중앙: 제품 버전 선택 드롭다운 (Phase 2에서 구현 — MVP에서는 단일 버전)
- 우측: 검색바

### 4.3 좌측 사이드바 메뉴
- 계층형 메뉴 구조 지원: **최대 4 depth**
- 현재 위치(활성 메뉴) 하이라이트
- 모바일에서는 햄버거 버튼으로 토글
- 메뉴 항목 접기/펼치기(Accordion) 지원

### 4.4 본문 영역
- Markdown 문서를 HTML로 렌더링
- 코드 블록 신택스 하이라이팅
- 이미지, 표, 콜아웃(Note/Warning) 지원
- 문서 우측 또는 하단에 **목차(TOC)** 자동 생성 (h2, h3 기준)
- 문서 하단: **[← 이전 문서] [다음 문서 →]** 네비게이션 버튼

### 4.5 검색
- 우측 상단 검색바에서 **전문 검색 (Full-text Search)**
- 검색 대상: 문서 제목 + 본문 내용
- 검색 결과 페이지에서 매칭 키워드 하이라이팅
- Supabase Full-text Search 또는 `pg_trgm` 활용

---

## 5. 관리자 페이지 (Admin)

### 5.1 인증
- Supabase Auth 이메일/비밀번호 로그인
- 로그인하지 않은 사용자는 `/admin` 접근 시 로그인 페이지로 리다이렉트
- 관리자 계정 생성은 Supabase 대시보드에서 수동 등록 (초기)

### 5.2 레이아웃
```
┌─────────────────────────────────────────┐
│         관리자 헤더 (로고 | 로그아웃)      │
├──────────────┬──────────────────────────┤
│  관리 사이드바 │   콘텐츠 영역             │
│  - 문서 관리  │                          │
│  - 메뉴 관리  │                          │
│  - 사용자 관리│                          │
└──────────────┴──────────────────────────┘
```

### 5.3 문서 관리
- 문서 목록 조회 (제목, 카테고리, 수정자, 수정일, 상태)
- 문서 작성 / 수정 / 삭제
- 문서 상태: `임시저장(Draft)` / `게시(Published)`
- **WYSIWYG 편집기** 탑재 — Markdown 문법 몰라도 작성 가능
  - 사용 라이브러리: [Milkdown](https://milkdown.dev/) (플러그인 기반, 활발한 유지보수, MIT 라이선스)
  - 편집기 내 이미지 업로드 → Supabase Storage 저장
- **수정 이력 보기**: 문서별 변경 이력 목록 조회 (수정자, 수정일, 변경 요약)

### 5.4 메뉴 구조 관리
- 좌측 메뉴 트리를 **드래그 앤 드롭**으로 순서 변경
- 메뉴 항목 추가 / 이름 변경 / 삭제
- 메뉴 항목에 문서 연결 (또는 빈 카테고리로 설정)
- 최대 **4 depth** 지원

### 5.5 사용자(관리자) 관리
- 관리자 목록 조회
- 관리자 추가 / 비활성화
- 역할 구분: MVP에서는 단일 `관리자` 역할 (모든 관리자 동일 권한)
  - `profiles` 테이블에 `role` 컬럼을 미리 추가하여 Phase 2 확장 준비
  - Phase 2: `슈퍼관리자` / `편집자` 역할 세분화 예정

---

## 6. 데이터베이스 구조 (Supabase)

### 테이블 설계 (초안)

```sql
-- 사용자 프로필 테이블 (auth.users 확장)
profiles (
  id    uuid PRIMARY KEY REFERENCES auth.users(id),
  role  text DEFAULT 'admin'   -- MVP: 'admin' 단일 역할, Phase 2에서 'superadmin'/'editor' 세분화
)

-- 문서 테이블
documents (
  id          uuid PRIMARY KEY,
  title       text NOT NULL,
  slug        text UNIQUE NOT NULL,   -- URL 경로
  content     text,                   -- Markdown 원문
  status      text DEFAULT 'draft',   -- 'draft' | 'published'
  menu_id     uuid REFERENCES menus(id),
  created_by  uuid REFERENCES auth.users(id),
  updated_by  uuid REFERENCES auth.users(id),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
)

-- [Phase 2] 버전 테이블 — MVP에서는 미구현, 단일 버전으로 운영
-- versions (
--   id         uuid PRIMARY KEY,
--   label      text NOT NULL,          -- 예: 'v2.0', 'v1.9'
--   is_default boolean DEFAULT false,
--   created_at timestamptz DEFAULT now()
-- )

-- 메뉴 테이블
menus (
  id          uuid PRIMARY KEY,
  parent_id   uuid REFERENCES menus(id), -- NULL이면 최상위
  title       text NOT NULL,
  order_index int DEFAULT 0,
  depth       int DEFAULT 1,             -- 1~4
  created_at  timestamptz DEFAULT now()
)

-- 문서 수정 이력 테이블
document_history (
  id           uuid PRIMARY KEY,
  document_id  uuid REFERENCES documents(id),
  content      text,                     -- 해당 시점 Markdown 스냅샷
  updated_by   uuid REFERENCES auth.users(id),
  updated_at   timestamptz DEFAULT now(),
  summary      text                      -- 변경 요약 (선택)
)
```

---

## 7. 기술 스택 상세

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 14+ (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| 백엔드/DB | Supabase (PostgreSQL + Auth + Storage) |
| 편집기 | Milkdown (플러그인 기반 WYSIWYG Markdown 편집기) |
| Markdown 렌더링 | `react-markdown` + `remark-gfm` |
| 코드 하이라이팅 | `rehype-highlight` 또는 `shiki` |
| 드래그앤드롭 | `@dnd-kit/core` |
| 배포 | Vercel |

---

## 8. 페이지 라우팅 구조

```
/ (루트)                      → 문서 홈 (첫 번째 문서로 리다이렉트)
/docs/[...slug]               → 문서 뷰어 페이지
/search?q=검색어              → 검색 결과 페이지

/admin                        → 관리자 대시보드
/admin/login                  → 관리자 로그인
/admin/documents              → 문서 목록
/admin/documents/new          → 문서 작성
/admin/documents/[id]/edit    → 문서 수정
/admin/documents/[id]/history → 수정 이력
/admin/menus                  → 메뉴 구조 관리
/admin/users                  → 사용자 관리
```

---

## 9. 비기능 요구사항

| 항목 | 내용 |
|------|------|
| 성능 | 문서 페이지 첫 로딩 2초 이내 (LCP 기준) |
| 접근성 | 키보드 네비게이션 지원, 시맨틱 HTML |
| SEO | Next.js SSG/SSR로 문서 페이지 메타태그 자동 생성 |
| 보안 | 관리자 API는 Supabase RLS(Row Level Security)로 보호 |
| 확장성 | 추후 다국어, AI 검색(RAG) 기능 추가 가능한 구조 |

---

## 10. 개발 우선순위 (Phase)

### Phase 1 — MVP
- [ ] Next.js 프로젝트 초기 세팅
- [ ] Supabase 연동 (Auth, DB, Storage)
- [ ] 사용자 페이지: 레이아웃, 사이드바, 문서 뷰어
- [ ] 관리자 로그인 + 문서 CRUD + **Milkdown** 편집기
- [ ] 메뉴 관리 (기본)
- [ ] 단일 버전 운영 (버전 선택 UI 없음)
- [ ] 단일 관리자 역할 (`profiles.role = 'admin'`)

### Phase 2 — 완성도
- [ ] 전문 검색 (Full-text Search)
- [ ] 이전/다음 문서 네비게이션
- [ ] 수정 이력 보기
- [ ] 드래그앤드롭 메뉴 정렬
- [ ] 반응형 모바일 최적화

### Phase 3 — 고도화
- [ ] 문서 TOC 자동 생성
- [ ] 코드 하이라이팅
- [ ] 이미지 업로드 (Supabase Storage)
- [ ] SEO 최적화
- [ ] 버전 관리: `versions` 테이블 추가 + 버전 선택 드롭다운 UI
- [ ] 관리자 권한 세분화 (`슈퍼관리자` / `편집자`)

---

*최종 수정일: 2026-03-13*
*작성 도구: Claude + Cursor AI*
