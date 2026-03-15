# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개요

이 저장소는 Claude Code 설정(에이전트, 스킬)을 공유하기 위한 템플릿 레포지토리입니다. 빌드/테스트/린트 명령어가 없으며, 모든 파일은 Markdown 형식입니다.


## 저장소 구조

```
.claude/
  agents/          # Claude Code 서브 에이전트 정의
    code-reviewer.md
    prd-to-roadmap.md
    sprint-close.md
    sprint-planner.md
  skills/          # Claude Code 스킬 정의
    karpathy-guidelines/
    writing-plans/
docs/
  PRD.md           # 제품 요구사항 문서 (사용하는 프로젝트에서 생성)
  ROADMAP.md       # 프로젝트 로드맵 (prd-to-roadmap 에이전트가 생성)
  plans/           # 구현 계획 문서 (YYYY-MM-DD-<feature-name>.md)
  sprint/          # 스프린트 문서 및 검증 보고서
    sprint{N}.md
    sprint{N}/     # 스크린샷, Playwright 보고서
README.md          # 저장소 소개 및 사용 방법
CLAUDE.md          # Claude Code 설정 파일
```

## 에이전트 파일 형식 (`.claude/agents/*.md`)

각 에이전트 파일은 YAML frontmatter로 시작합니다:

```yaml
---
name: agent-name
description: 에이전트 설명
model: inherit | opus | sonnet | haiku
color: red | blue | green | ...
memory: project   # 프로젝트 메모리 자동 주입
---
```

**중요:** 에이전트 파일에 절대 경로(`/Users/...`)를 하드코딩하지 않습니다. `memory: project`가 런타임에 올바른 경로를 자동 주입합니다.

## 스킬 파일 형식 (`.claude/skills/<name>/SKILL.md`)

```yaml
---
name: skill-name
description: 스킬 설명
---
```

## 스프린트 워크플로우

1. **prd-to-roadmap** 에이전트: `docs/PRD.md` → `docs/ROADMAP.md` 생성
2. **sprint-planner** 에이전트: ROADMAP 기반으로 `docs/sprint/sprint{N}.md` 생성
3. 구현 (writing-plans 스킬로 세부 계획 수립 → 실행)
4. **sprint-close** 에이전트: ROADMAP 업데이트 → PR 생성 → 코드 리뷰 → Playwright 검증 → 검증 보고서 저장

## 핵심 에이전트 역할

| 에이전트 | 역할 | 주요 입력 | 주요 출력 |
|----------|------|-----------|-----------|
| `prd-to-roadmap` | PRD → 로드맵 변환 | `docs/PRD.md` | `docs/ROADMAP.md` |
| `sprint-planner` | 스프린트 계획 수립 | `ROADMAP.md` | `docs/sprint/sprint{N}.md` |
| `sprint-close` | 스프린트 마무리 | 현재 브랜치 | PR, 검증 보고서 |
| `code-reviewer` | 코드 리뷰 | 구현 완료 단계 | 이슈 분류 보고 (Critical/Important/Suggestion) |

## Playwright MCP 검증

`sprint-close` 및 `prd-to-roadmap` 에이전트는 Playwright MCP 도구(`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_console_messages`, `browser_network_requests` 등)를 사용하여 `npm run dev` 실행 상태에서 UI를 직접 검증합니다. 검증 결과는 `docs/sprint/sprint{N}/playwright-report.md`에 저장합니다.

## 언어 및 커뮤니케이션 규칙

- 기본 응답 언어: 한국어
- 코드 주석: 한국어로 작성
- 커밋 메시지: 한국어로 작성
- 문서화: 한국어로 작성
- 변수명/함수명: 영어 (코드 표준 준수)

## 개발시 유의해야할 사항

- sprint 관련 문서 구조:
  - 스프린트 계획/완료 문서: `docs/sprint/sprint{n}.md`
  - 스프린트 첨부 파일 (스크린샷, 보고서 등): `docs/sprint/sprint{n}/`
- sprint 개발이 plan 모드로 진행될 때는 다음을 꼭 준수합니다.
  - karpathy-guidelines skill을 준수하세요.
  - sprint 가 새로 시작될 때는 새로 branch를 sprint{n} 이름으로 생성하고 해당 브랜치에서 작업해주세요. (worktree 사용하지 말아주세요)
  - 다음과 같이 agent를 활용합니다.
    1. sprint-planner agent가 계획 수립 작업을 수행하도록 해주세요.
    2. 구현/검증 단계에서는 각 task의 내용에 따라 적절한 agent가 있는지 확인 한 후 적극 활용해주세요.
    3. 스프린트 구현이 완료되면 sprint-close agent를 사용하여 마무리 작업(ROADMAP 업데이트, PR 생성, 코드 리뷰, 자동 검증)을 수행해주세요.

- 스프린트 검증 원칙 — **자동화 가능한 항목은 sprint-close 시점에 직접 실행**:
  - ✅ **자동 실행**: `docker compose exec backend pytest -v` — 백엔드 통합 테스트
  - ✅ **자동 실행**: API 동작 검증 (curl/httpx) — Docker 컨테이너가 실행 중인 경우 sprint-close agent가 직접 실행
  - ✅ **자동 실행**: 데모 모드 API 검증 — 마찬가지로 서버 실행 중이면 자동 실행
  - ❌ **수동 필요**: `docker compose up --build` — 새 코드 반영을 위한 Docker 재빌드 (타이밍을 사용자가 결정)
  - ❌ **수동 필요**: `alembic upgrade head` — prod DB 스키마 변경 (되돌릴 수 없으므로 사용자가 직접 실행)
  - ❌ **수동 필요**: 브라우저 UI 시각적 확인 (프론트엔드 렌더링, 버튼 동작 등)
  - sprint-close agent는 자동 실행 항목을 실행하고 결과를 deploy.md에 기록해야 합니다.
  - deploy.md에는 "자동 검증 완료" 항목과 "수동 검증 필요" 항목을 명확히 구분하여 기재합니다.

- 사용자가 직접 수행해야 하는 작업은 deploy.md 파일을 생성하거나 기존에 존재하는 deploy.md에 수행해야하는 작업을 자세히 정리해주세요.
- 체크리스트 작성 형식:
  - 완료 항목: `- ✅ 항목 내용`
  - 미완료 항목: `- ⬜ 항목 내용`
  - GFM `[x]`/`[ ]` 대신 이모지를 사용하여 마크다운 미리보기에서 시각적 구분을 보장합니다.

## 테스트 규칙


## 테스트 규칙
- Playwright MCP를 이용하여 테스트를 진행한다.
- 아래 시나리오를 이해하고 테스트를 진행한다.
- 테스트 계정: 이메일 `test@cc.com` / 비밀번호 `1234QWER`

---

### 사용자 시나리오

#### T-U01. 사이드바 메뉴 표시
- **조건**: 게시된 문서가 1개 이상 존재
- **절차**: 사용자 페이지 접속 → 사이드바 메뉴 클릭
- **기대 결과**: 클릭한 메뉴가 펼쳐지며 하위 항목이 표시된다.

#### T-U02. 문서 내용 표시
- **조건**: 메뉴에 게시된 문서가 연결되어 있음
- **절차**: 사이드바에서 문서 링크 클릭
- **기대 결과**: 해당 문서의 제목과 본문 내용이 표시된다. 404 오류가 나지 않는다.

#### T-U03. 전체 메뉴 확장 오류 없음
- **절차**: 사이드바의 모든 메뉴 항목을 순서대로 클릭하여 확장
- **기대 결과**: 콘솔 오류 없이 모든 메뉴가 정상 확장된다.

#### T-U04. 미게시(draft) 문서 접근 차단
- **조건**: draft 상태 문서의 URL을 사전에 확인
- **절차**: 로그아웃 상태에서 draft 문서 URL 직접 입력 접근
- **기대 결과**: 404 페이지가 표시된다. 문서 내용이 노출되지 않는다.

---

### 관리자 시나리오

#### T-A01. 로그인 — 정상
- **절차**: `/admin/login` 접속 → 이메일 `test@cc.com` / 비밀번호 `1234QWER` 입력 → 로그인 버튼 클릭
- **기대 결과**: 문서 관리 페이지(`/admin/documents`)로 이동한다.

#### T-A02. 로그인 — 잘못된 정보
- **절차**: 잘못된 이메일 또는 비밀번호 입력 → 로그인 버튼 클릭
- **기대 결과**: 오류 메시지가 표시된다. 페이지 이동이 없다.

#### T-A03. 미인증 상태 관리자 페이지 접근 차단
- **조건**: 로그아웃 상태
- **절차**: `/admin/documents` URL 직접 입력 접근
- **기대 결과**: `/admin/login` 페이지로 리다이렉트된다.

#### T-A04. 로그아웃
- **조건**: 로그인 상태
- **절차**: 우측 상단 로그아웃 버튼 클릭
- **기대 결과**: 로그인 페이지로 이동한다. 이후 `/admin/documents` 직접 접근 시 로그인 페이지로 리다이렉트된다.

#### T-A05. 새 문서 작성 — 정상
- **절차**: 문서 관리 → 새 문서 작성 선택 → 제목 "의사랑 테스트 + 날짜시간" 입력 → URL 경로 영문으로 입력 → 본문 내용 입력 → 저장 클릭
- **기대 결과**: 오류 없이 저장되고 문서 목록으로 이동한다. 목록에 새 문서가 표시된다.

#### T-A06. 새 문서 작성 — 제목 누락
- **절차**: 제목을 비운 채로 저장 버튼 클릭
- **기대 결과**: 오류 메시지가 표시된다. 저장되지 않는다.

#### T-A07. 슬러그 입력 제한
- **절차**: 새 문서 작성 화면에서 URL 경로 필드에 한글 입력 시도
- **기대 결과**: 한글이 입력되지 않는다. 영문 소문자·숫자·하이픈(-)만 허용된다.

#### T-A08. 중복 슬러그 저장
- **조건**: 이미 존재하는 슬러그 값을 사전에 확인
- **절차**: 동일한 슬러그로 새 문서 저장 시도
- **기대 결과**: 오류 메시지가 표시된다. 저장되지 않는다.

#### T-A09. 문서 수정
- **절차**: 문서 목록에서 문서 선택 → 수정 → 제목 또는 본문 변경 → 저장
- **기대 결과**: 변경 내용이 저장되고 문서 목록에 반영된다.

#### T-A10. 문서 삭제
- **절차**: 문서 목록에서 문서 삭제 버튼 클릭 → 확인
- **기대 결과**: 문서가 목록에서 제거된다.

#### T-A11. 문서 게시 상태 전환 및 사용자 반영
- **절차**: draft 문서를 published로 변경 후 저장 → 사용자 페이지 사이드바 확인
- **기대 결과**: 사용자 페이지 사이드바에 해당 문서가 표시된다.

#### T-A12. 이미지 붙여넣기 업로드
- **조건**: 클립보드에 이미지 복사
- **절차**: 본문 편집기에 이미지 붙여넣기(Ctrl+V)
- **기대 결과**: 이미지가 편집기에 표시된다. 오류 메시지가 나타나지 않는다.

#### T-A13. 메뉴 추가
- **절차**: 메뉴 관리 → 최상위 메뉴 이름 입력 → 추가 버튼 클릭
- **기대 결과**: 메뉴 목록에 새 항목이 표시된다. 오류가 나지 않는다.

#### T-A14. 하위 메뉴 추가 및 사이드바 반영
- **절차**: 기존 메뉴에 마우스 오버 → "+ 추가" 클릭 → 하위 메뉴 이름 입력
- **기대 결과**: 계층 구조로 하위 메뉴가 추가된다. 사용자 페이지 사이드바에 반영된다.

#### T-A15. 메뉴 이름 수정
- **절차**: 메뉴 항목 더블클릭 → 이름 변경 → Enter
- **기대 결과**: 변경된 이름이 저장된다.

#### T-A16. 메뉴 삭제
- **절차**: 메뉴 항목 마우스 오버 → 삭제 클릭 → 확인
- **기대 결과**: 메뉴가 목록에서 제거된다. 사용자 페이지 사이드바에서도 제거된다.

#### T-A17. 사용자 관리 페이지 접근
- **절차**: 사용자 관리 메뉴 클릭
- **기대 결과**: 사용자 목록 페이지가 표시된다. 오류가 없다.

---

### 페이지 성능 및 스크린샷 검증

> **도구**: Chrome DevTools MCP (`chrome_devtools_*`)
> **측정 기준**: 각 페이지 접속 후 Network 탭 기준 로드 완료 시간 및 화면 캡처
> **저장 경로**: `docs/sprint/sprint{N}/screenshots/`
> **기준값**: 페이지 로드 3초 이내 (초과 시 주의 표기)

#### 대상 페이지 목록

| ID | 페이지 | URL | 인증 필요 |
|----|--------|-----|-----------|
| T-P01 | 사용자 홈 (첫 문서 리다이렉트) | `/` | 불필요 |
| T-P02 | 문서 뷰어 | `/docs/{slug}` | 불필요 |
| T-P03 | 검색 페이지 | `/search` | 불필요 |
| T-P04 | 관리자 로그인 | `/admin/login` | 불필요 |
| T-P05 | 관리자 문서 목록 | `/admin/documents` | 필요 |
| T-P06 | 새 문서 작성 | `/admin/documents/new` | 필요 |
| T-P07 | 문서 수정 | `/admin/documents/{id}/edit` | 필요 |
| T-P08 | 메뉴 관리 | `/admin/menus` | 필요 |
| T-P09 | 사용자 관리 | `/admin/users` | 필요 |

#### T-P01 ~ T-P09 공통 절차

각 페이지에 대해 아래 절차를 반복한다.

1. Chrome DevTools MCP로 페이지 접속
2. Network 탭에서 로드 완료 시간(Load) 기록
3. Console 탭에서 오류(error) 메시지 유무 확인
4. 화면 캡처 후 `docs/sprint/sprint{N}/screenshots/{page-id}.png`로 저장

#### 기대 결과 (공통)

- 모든 페이지 로드 시간이 **3초 이내**이다.
- Console에 **error 로그가 없다**.
- 캡처 화면에 레이아웃 깨짐, 빈 화면, 오류 메시지가 없다.

#### 성능 결과 기록 형식

테스트 완료 후 아래 표를 채워 `docs/sprint/sprint{N}/screenshots/performance.md`에 저장한다.

| ID | 페이지 | 로드 시간(ms) | Console 오류 | 스크린샷 | 판정 |
|----|--------|--------------|-------------|---------|------|
| T-P01 | 사용자 홈 | | | | |
| T-P02 | 문서 뷰어 | | | | |
| T-P03 | 검색 페이지 | | | | |
| T-P04 | 관리자 로그인 | | | | |
| T-P05 | 관리자 문서 목록 | | | | |
| T-P06 | 새 문서 작성 | | | | |
| T-P07 | 문서 수정 | | | | |
| T-P08 | 메뉴 관리 | | | | |
| T-P09 | 사용자 관리 | | | | |

