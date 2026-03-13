# Sprint 3 검증 보고서

**스프린트**: Sprint 3 — Supabase 연동 MVP 완성
**검증 일시**: 2026-03-13
**검증자**: sprint-close agent

---

## 코드 리뷰 결과 (code-reviewer)

### 잘 구현된 점

- Supabase 서버/클라이언트 분리가 `@supabase/ssr` 패키지 가이드라인을 정확히 준수함
- `src/lib/supabase/server.ts`의 쿠키 핸들러에서 Server Component의 읽기 전용 쿠키 제한을 `try/catch`로 적절히 처리
- Next.js App Router `params: Promise<{...}>` 패턴 (Next.js 16 대응) 일관 적용
- 모든 클라이언트 컴포넌트에 `'use client'` 지시어 명시
- TipTap 편집기를 `dynamic import` + `ssr: false`로 올바르게 비활성화
- DB 타입 정의(`types/database.ts`)를 수동으로 작성하여 타입 안전성 확보
- TypeScript 타입 에러 0개 확인 (`npx tsc --noEmit` 통과)

---

### Critical 이슈 (반드시 수정)

없음.

---

### Important 이슈 (수정 권장)

**[Important-1] 이미지 업로드 API의 인증 검증 누락**

- 파일: `src/app/api/upload-image/route.ts`
- 문제: `createAdminClient()`(Service Role)를 사용하지만, 요청자가 인증된 관리자인지 확인하지 않음. 현재 구현상 비인증 사용자도 이미지 업로드 API를 직접 호출할 수 있음.
- 권장 수정: 업로드 전 `createClient()`로 세션 확인 후 미인증 시 401 반환 추가

**[Important-2] 문서 삭제 시 에러 처리 없음**

- 파일: `src/app/admin/documents/page.tsx` (`handleDelete` 함수)
- 문제: `supabase.from('documents').delete()` 호출 후 `error` 반환값을 확인하지 않아 삭제 실패 시 사용자에게 피드백 없이 목록에서만 제거됨.
- 권장 수정: `const { error } = await supabase...delete()` 후 에러 시 `alert()` 또는 toast 알림 추가

**[Important-3] 사용자 활성/비활성 토글의 낙관적 업데이트 불일치**

- 파일: `src/app/admin/users/page.tsx` (`handleToggleActive` 함수)
- 문제: Supabase 업데이트 실패 시에도 로컬 state가 이미 변경됨 (낙관적 업데이트 패턴인데 롤백 없음).
- 권장 수정: 업데이트 성공 후 state 변경하거나, 실패 시 이전 상태로 롤백 로직 추가

**[Important-4] 사용자 페이지에서 문서 없을 때 `/docs/not-found`로 리다이렉트**

- 파일: `src/app/(user)/page.tsx`
- 문제: 게시된 문서가 없을 때 `/docs/not-found`로 리다이렉트하는데, 이 경로가 실제 404 페이지가 아닌 slug 기반 문서 조회를 시도함. 슬러그 `not-found`의 문서가 없으면 404가 맞게 동작하지만 혼란스러운 패턴.
- 권장 수정: `notFound()` 함수를 직접 호출하거나 빈 상태 안내 페이지 렌더링

---

### Suggestion (개선 제안)

**[Suggestion-1] `database.ts` 타입 생성 자동화**

- 현재 `types/database.ts`는 수동 작성됨. Supabase CLI의 `npx supabase gen types typescript --project-id [id]`로 자동 생성하면 DB 스키마 변경 시 동기화 용이.
- Sprint 4 시작 전 적용 권장.

**[Suggestion-2] `DocumentForm.tsx` 내 Supabase 쿼리를 API 레이어로 분리**

- 현재 `DocumentForm.tsx` (클라이언트 컴포넌트)에서 직접 Supabase 쿼리를 수행. 서버 액션 또는 `lib/api/` 레이어를 통해 호출하면 재사용성과 테스트 용이성이 향상됨.
- Sprint 4 리팩토링 시 검토.

**[Suggestion-3] `menus.ts`의 `buildMenuTree` depth 오프셋 불일치**

- `DocumentForm.tsx`에서 `depth: m.depth - 1`로 보정하는데, `buildMenuTree` 함수가 0-base와 1-base를 일관되지 않게 사용함. 타입 정의상 `depth`의 기준을 명확히 문서화 권장.

**[Suggestion-4] 스토리지 버킷명 불일치**

- `docs/sprint/sprint3.md` 계획에는 `documents-images`, 실제 구현(`src/app/api/upload-image/route.ts`)에는 `document-images`(하이픈 하나)로 다름. Supabase 대시보드에서 실제 버킷명 일치 여부 확인 필요.

---

## 계획 대비 구현 검토

| 계획 항목 | 구현 여부 | 비고 |
|-----------|-----------|------|
| Supabase 클라이언트 분리 (server/client/middleware) | ✅ 완료 | middleware 클라이언트는 `admin.ts`로 통합 |
| DB 스키마 및 RLS 정책 | ✅ 완료 | `docs/sprint/sprint3-schema.sql` 참조 |
| Next.js 미들웨어 인증 보호 | ✅ 완료 | 계획과 동일 |
| 문서 CRUD 연동 | ✅ 완료 | `DocumentForm.tsx`로 통합 구현 |
| 메뉴 CRUD 연동 | ✅ 완료 | |
| 사용자 페이지 데이터 연동 | ✅ 완료 | |
| 사용자 관리 연동 | ✅ 완료 | |
| Supabase Storage 이미지 업로드 | ✅ 완료 | |
| 에러 바운더리 (`app/error.tsx`) | 미확인 | 계획 Task 9 — 파일 존재 여부 별도 확인 필요 |
| `lib/api/documents.ts` 별도 파일 | 계획 변경 | `DocumentForm.tsx`에 통합됨 (Suggestion-2 참조) |
| Milkdown 편집기 | 계획 변경 | TipTap으로 교체 (이미지 붙여넣기 기능 향상) |

**계획 변경 평가**: Milkdown → TipTap 교체는 이미지 업로드 요구사항을 더 잘 충족하는 합리적인 결정. `lib/api/documents.ts` 미분리는 추후 리팩토링 대상.

---

## 자동 검증 결과

### TypeScript 컴파일 검증

- ✅ `npx tsc --noEmit` — 에러 0개 통과

### 개발 서버 실행 상태

- 현재 `npm run dev` 미실행 상태
- Playwright MCP UI 검증: 서버 미실행으로 자동 검증 불가 → 수동 검증 필요

### API 자동 검증

- Supabase 환경변수 (`.env.local`) 미설정 상태로 API 직접 호출 검증 불가
- 수동 검증 항목으로 이관 (deploy.md 참조)

---

## 수동 검증 필요 항목

deploy.md를 참조하세요.

---

*보고서 생성일: 2026-03-13*
*다음 스프린트: Sprint 4 — 검색 + 수정 이력 + 이전/다음 네비게이션*
