# Sprint 3 배포 체크리스트

**스프린트**: Sprint 3 — Supabase 연동 MVP 완성
**작성일**: 2026-03-13
**PR**: https://github.com/larryguro/ysrdocumanaer/pull/1

---

## 자동 검증 완료 항목

- ✅ TypeScript 타입 에러 없음 (`npx tsc --noEmit` 통과)

---

## 수동 검증 필요 항목

### 사전 준비

- ⬜ Supabase 프로젝트 생성 및 `.env.local` 환경변수 설정
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
  SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
  ```
- ⬜ Supabase 대시보드 SQL Editor에서 `docs/sprint/sprint3-schema.sql` 실행 (DB 스키마 및 RLS 정책 적용)
- ⬜ Supabase Storage에서 `document-images` 버킷 생성 (공개 버킷, 인증 사용자 업로드)
- ⬜ Supabase Auth에서 관리자 계정 생성 (이메일/비밀번호)

### 빌드 및 서버 실행

- ⬜ `npm install` — 의존성 설치
- ⬜ `npm run build` — 빌드 에러 없음 확인
- ⬜ `npm run dev` — 개발 서버 실행 (`http://localhost:3000`)

### 인증 플로우 검증

- ⬜ `http://localhost:3000/admin` 접속 시 `/admin/login`으로 리다이렉트 확인
- ⬜ 잘못된 이메일/비밀번호 입력 시 "이메일 또는 비밀번호가 올바르지 않습니다." 에러 메시지 표시 확인
- ⬜ 올바른 이메일/비밀번호로 로그인 → `/admin/documents`로 리다이렉트 확인
- ⬜ 로그인 상태에서 `/admin/login` 접속 시 `/admin/documents`로 자동 리다이렉트 확인
- ⬜ 헤더의 로그아웃 버튼 클릭 → `/admin/login`으로 리다이렉트 확인
- ⬜ 로그아웃 후 `/admin/documents` 접속 시 `/admin/login`으로 리다이렉트 확인 (세션 무효화)

### 문서 CRUD 검증

- ⬜ `/admin/documents` — 문서 목록이 DB 데이터로 렌더링 확인 (초기: 빈 목록)
- ⬜ `/admin/documents/new` — 새 문서 작성 페이지 로드 확인
  - 제목 입력 시 슬러그 자동 생성 확인
  - TipTap 편집기 정상 로드 및 텍스트 입력 확인
  - 상태를 "게시됨"으로 변경 후 저장 → 문서 목록에 표시 확인
- ⬜ 작성된 문서 편집 → 내용 수정 후 저장 → 수정 내용 반영 확인
- ⬜ 문서 삭제 → 목록에서 제거 확인

### 사용자 페이지 검증

- ⬜ 게시된 문서가 있을 때 `http://localhost:3000` 접속 → 해당 문서 페이지로 리다이렉트 확인
- ⬜ `/docs/[slug]` — 게시된 문서 내용 Markdown 렌더링 확인
- ⬜ 사이드바에 DB 기반 메뉴 표시 확인
- ⬜ draft 문서의 slug로 직접 접속 시 404 처리 확인

### RLS 정책 검증

- ⬜ 로그아웃 상태에서 draft 문서 slug로 직접 접속 시 404 확인
- ⬜ Supabase REST API로 비인증 상태 draft 문서 조회 시 빈 배열 반환 확인:
  ```bash
  curl 'https://[project].supabase.co/rest/v1/documents?status=eq.draft' \
    -H 'apikey: [anon-key]'
  ```
  예상 응답: `[]` (RLS 차단)

### 메뉴 CRUD 검증

- ⬜ `/admin/menus` — 메뉴 관리 페이지 로드 확인
- ⬜ 새 메뉴 추가 → 사용자 사이드바에 반영 확인
- ⬜ 메뉴 이름 수정 → 사이드바에 변경 사항 반영 확인
- ⬜ 메뉴 삭제 → 사이드바에서 제거 확인

### 이미지 업로드 검증

- ⬜ 문서 편집 페이지에서 이미지 클립보드 붙여넣기 → 편집기 내 이미지 표시 확인
- ⬜ 업로드된 이미지 URL이 `[project].supabase.co/storage` 도메인인지 확인
- ⬜ Supabase Storage 대시보드에서 `document-images` 버킷에 파일 존재 확인
- ⬜ 로컬 `public/uploads/` 디렉토리에 새 파일이 생성되지 않는지 확인

### 사용자 관리 검증

- ⬜ `/admin/users` — 관리자 목록 DB 데이터 렌더링 확인
- ⬜ "관리자 추가" 버튼 → 이메일 입력 → Supabase 초대 이메일 발송 확인
- ⬜ 활성/비활성 토글 동작 확인

---

## 코드 리뷰 지적 사항 (Sprint 4 이전 처리 권장)

아래 항목은 검증 보고서(`docs/sprint/sprint3/playwright-report.md`)에서 Important로 분류된 이슈입니다:

- ⬜ **[Important-1]** `src/app/api/upload-image/route.ts` — 업로드 전 인증 세션 확인 로직 추가
- ⬜ **[Important-2]** `src/app/admin/documents/page.tsx` — `handleDelete` 에러 처리 추가
- ⬜ **[Important-3]** `src/app/admin/users/page.tsx` — `handleToggleActive` 실패 시 롤백 추가
- ⬜ **[Important-4]** `src/app/(user)/page.tsx` — 문서 없을 때 `notFound()` 직접 호출로 변경

---

## Vercel 배포 (선택 사항)

- ⬜ Vercel 프로젝트에 환경변수 설정 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- ⬜ `main` 브랜치 머지 후 Vercel 자동 배포 확인
- ⬜ 프로덕션 URL에서 로그인 플로우 동작 확인

---

*체크리스트 형식: ✅ 완료 | ⬜ 미완료*
*최종 갱신일: 2026-03-13*
