# AGENTS.md

> 이 문서는 AI 코딩 에이전트(Cursor, Claude, Codex 등)가 **Picake** 저장소에서 작업할 때 따라야 하는 가이드입니다.
> 모든 에이전트는 작업 전 이 문서를 먼저 참고하세요. 사람 대상의 더 상세한 문서는 [`README.md`](./README.md)와 [`docs/`](./docs)에 있습니다.

## 최우선 원칙 — 기존 코드와의 일관성 (가장 중요)

> 🚨 **기능을 개발하거나 코드를 수정할 때, 무엇보다 "기존 코드와의 일관성"을 최우선으로 지킵니다.**
> 새 코드는 마치 기존 작성자가 이어서 쓴 것처럼 자연스러워야 합니다.

작업 전, 같은 도메인/유사 기능의 **기존 코드를 먼저 읽고 그 방식을 그대로 따릅니다.**

- **기존 코드(구현)**: 비슷한 기능이 이미 있으면 그 구현을 참고해 같은 흐름으로 작성합니다. 중복 로직은 기존 유틸/훅/서비스를 재사용합니다.
- **기존 코드 스타일**: 네이밍, 따옴표, 포맷, 주석 톤 등 주변 코드의 스타일을 그대로 맞춥니다.
- **기존 코드 패턴**: 데이터 패칭(TanStack Query 훅), 상태 관리(Zustand), 에러/로딩 처리, DTO·서비스 분리 등 이미 쓰이는 패턴을 동일하게 사용합니다.
- **기존 코드 구조**: 아래 "디렉토리 / 네이밍 컨벤션"의 `features/<도메인>` · `modules/<도메인>` 구조와 파일 배치 규칙을 그대로 따릅니다.

❌ 임의로 새로운 라이브러리·패턴·폴더 구조·스타일을 도입하지 않습니다.
✅ 더 나은 방식이 필요하다고 판단되면, 임의로 바꾸지 말고 **먼저 사용자에게 제안**합니다.

> 판단이 서지 않을 때의 기준: "이 저장소의 다른 코드는 이걸 어떻게 하고 있지?"를 먼저 확인하고, 그 방식을 따릅니다.

## 기본 규칙

- **응답 언어: 한국어.** 사용자와의 모든 대화/설명은 한국어로 작성합니다.
- 추측하지 말고, 모르면 코드/문서를 먼저 확인합니다.
- 기존 코드의 컨벤션·패턴을 최우선으로 따릅니다. 새 패턴 도입은 명확한 이유가 있을 때만.

## 프로젝트 개요

Picake는 **Yarn Berry(node_modules linker) 기반 모노레포**로 구성된 디저트 주문 플랫폼입니다.

| 앱                   | 위치              | 스택                                                                   | 비고                                        |
| -------------------- | ----------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| `@picake/backend`    | `apps/backend`    | NestJS 10 · Prisma 6 · PostgreSQL · Passport/JWT · Socket.io · Sentry  | API 서버 (포트 3000)                        |
| `@picake/web-user`   | `apps/web-user`   | Next.js 15 · React 19 · Tailwind · Zustand · TanStack Query · Radix    | 사용자 웹 (포트 3001), Flutter WebView 대상 |
| `@picake/web-seller` | `apps/web-seller` | Vite · React 18 · react-router 7 · Tailwind · Zustand · TanStack Query | 판매자 웹 (포트 3002)                       |
| `@picake/web-admin`  | `apps/web-admin`  | Vite · React 18 · react-router 7 · Tailwind                            | 관리자 웹                                   |

- 패키지 매니저: **Yarn 4.9.4** (`packageManager` 고정). `npm`/`pnpm` 사용 금지.
- 모든 워크스페이스 TypeScript `strict` 모드.

## 디렉토리 / 네이밍 컨벤션

작업 시 **반드시 기존 구조를 그대로 따릅니다.**

### 프론트엔드 (web-user / web-seller / web-admin)

기능(feature) 단위로 폴더를 나눕니다.

```
src/
  features/<도메인>/
    apis/         # *.api.ts        (서버 통신)
    components/   # PascalCase.tsx  (UI 컴포넌트, 필요시 하위 폴더로 그룹화)
    constants/    # *.constant.ts   (쿼리 키 등 포함: *QueryKeys.constant.ts)
    hooks/
      queries/    # useXxx.ts       (TanStack Query 조회)
      mutations/  # useXxx.ts       (TanStack Query 변경)
    types/        # *.type.ts
    utils/        # *.util.ts
  common/         # 앱 공용 (components, hooks, lib, store, styles, utils, config, constants, types)
  app/ 또는 pages/ # 라우팅 (Next.js: app/, Vite: pages/)
```

### 백엔드 (backend)

도메인(module) 단위로 폴더를 나눕니다.

```
src/
  modules/<도메인>/
    <도메인>.module.ts
    <도메인>.service.ts
    constants/    # *.constants.ts
    dto/          # *.dto.ts (class-validator 사용)
    services/     # *-xxx.service.ts (책임별로 service 분리)
    types/        # *.types.ts
    utils/        # *.util.ts
  common/         # 전역 공용 (guard, interceptor, filter 등)
  infra/          # database(prisma), 외부 연동
  apis/           # 외부 API 클라이언트
  main.ts, app.module.ts
```

### 네이밍 요약

- 파일 접미사: `*.api.ts`, `*.constant.ts` / `*.constants.ts`, `*.type.ts` / `*.types.ts`, `*.util.ts`, `*.dto.ts`, `*.service.ts`, `*.module.ts`
- React 컴포넌트 파일·이름: PascalCase, 훅: `useXxx`
- 폴더명: kebab-case 또는 단일 도메인 단어

## 코드 스타일

ESLint + Prettier로 강제합니다. 수동으로 맞추지 말고 도구를 사용하세요.

- Prettier: `printWidth 100`, **더블쿼트(`"`)**, 세미콜론 필수, `trailingComma: all`, 들여쓰기 2칸, `arrowParens: always`, `endOfLine: lf`
- TypeScript `strict`. `any`는 허용되지만 가능하면 피합니다.
- `console`은 허용됩니다(린트에서 막지 않음).

## 작업 후 검증 (필수)

코드 변경 후 아래를 통과해야 합니다.

```bash
yarn common:lint          # ESLint (--max-warnings=0)
yarn common:format:check  # Prettier 검사
```

- 문제가 있으면 `yarn common:lint:fix`, `yarn common:format`으로 수정 후 다시 확인합니다.
- 빌드/실행 확인이 필요하면 아래 "주요 명령어"의 앱별 `dev`/`build`를 사용합니다.

## Git / 협업 규칙

- ⛔ **`main` 브랜치 직접 push 금지** (보호됨). 변경은 항상 `staging`을 거칩니다.
- ⛔ **사용자가 명시적으로 요청하지 않으면 커밋하지 않습니다.**
- 브랜치 네이밍: `{타입}/{설명}` — `feature/`, `fix/`, `hotfix/`, `refactor/`, `docs/`, `chore/`
- 작업 흐름: `feature/*` → PR → `staging` → `main`. (긴급 시 `hotfix/*` → `staging` 직접 push 허용)
- PR 전 체크리스트: `staging` 최신화, 동작 확인, `yarn common:lint` 통과, `yarn common:format:check` 통과

### 커밋 메시지 형식

`[프로젝트][타입]: 내용` 형태로 작성합니다. **내용(메시지 본문)은 한국어로 작성합니다.**

- 프로젝트: `[COMMON]` `[WEB-USER]` `[WEB-SELLER]` `[WEB-ADMIN]` `[BE]`
- 타입: `[TASK]` `[BUG]` `[FEATURE]` `[CHORE]` `[DOCS]` `[FIX]` `[REFACTOR]` `[REMOVE]` `[UI]` `[QUESTION]`

```
[WEB-USER][FEATURE]: 로그인 페이지 구현
[BE][FIX]: 인증 토큰 만료 처리 수정
```

## 주요 명령어 (루트에서 실행)

```bash
# 개발 서버
yarn backend:dev          # 백엔드 (3000)
yarn web-user:dev         # 사용자 웹 (3001)
yarn web-seller:dev       # 판매자 웹 (3002)
yarn web-admin:dev        # 관리자 웹

# 빌드
yarn backend:build:staging / yarn backend:build:production
yarn web-user:build / yarn web-seller:build / yarn web-admin:build

# 데이터베이스 (backend)
yarn db:migrate:dev       # 마이그레이션 (개발)
yarn db:migrate:status    # 마이그레이션 상태
yarn db:seed:dev          # 시드 (개발)
yarn db:studio:dev        # Prisma Studio

# 코드 품질
yarn common:lint / yarn common:lint:fix
yarn common:format / yarn common:format:check

# 스토리북
yarn web-user:storybook / yarn web-seller:storybook
```

## 참고 문서

- 협업 규칙·배포(태그 기반 CI/CD) 전문: [`README.md`](./README.md)
- 프로젝트 구조: [`docs/common/structure/`](./docs/common/structure)
- 인증(웹뷰/판매자): [`docs/common/feature/`](./docs/common/feature)
- 앱별 기술 스택: [`docs/backend/`](./docs/backend), [`docs/web-user/`](./docs/web-user), [`docs/web-seller/`](./docs/web-seller)
