# Vercel 배포 가이드

## 개요

Sweet Order 프로젝트의 web-user, web-seller, web-admin 애플리케이션을 Vercel에 배포하고 관리하는 가이드입니다.

## Vercel을 선택한 이유

### 1. Next.js 최적화

- Next.js 프레임워크에 특화된 배포 플랫폼
- 자동 최적화 및 성능 향상
- Edge Network를 통한 글로벌 CDN

### 2. 개발자 경험

- GitHub 연동을 통한 자동 배포
- 간단한 설정과 빠른 배포

### 3. 비용 효율성

- 무료 티어 제공
- 사용량 기반 과금

## 주요 설정

### 1. vercel.json 설정

프로젝트 루트에 `vercel.json` 파일을 생성하여 Git 기반 자동 배포를 비활성화합니다.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": false
  }
}
```

이 설정은 웹훅을 통한 수동 배포만 사용한다는 의미입니다.

### 2. Vercel 콘솔 설정

#### 2.1 프로젝트 구성

총 6개의 Vercel 프로젝트를 생성합니다:

| 프로젝트명            | 환경       | 브랜치    | 배포 타입  |
| --------------------- | ---------- | --------- | ---------- |
| web-user-staging      | staging    | `staging` | Production |
| web-user-production   | production | `main`    | Production |
| web-seller-staging    | staging    | `staging` | Production |
| web-seller-production | production | `main`    | Production |
| web-admin-staging     | staging    | `staging` | Production |
| web-admin-production  | production | `main`    | Production |

**중요 사항:**

- staging과 production 환경 모두 별도의 Vercel 프로젝트로 구성됩니다
- 각 프로젝트는 바라보는 브랜치만 다릅니다 (staging 브랜치 또는 main 브랜치)
- 모든 프로젝트는 Production 타입으로 배포됩니다

#### 2.2 프로젝트 생성

1. Vercel 대시보드에서 새 프로젝트 생성 (총 6개)
2. GitHub 저장소 연결
   - web-user-staging: `staging` 브랜치 연결
   - web-user-production: `main` 브랜치 연결
   - web-seller-staging: `staging` 브랜치 연결
   - web-seller-production: `main` 브랜치 연결
   - web-admin-staging: `staging` 브랜치 연결
   - web-admin-production: `main` 브랜치 연결
3. 빌드 설정:
   - Framework: Next.js (web-user) / Vite (web-seller, web-admin)
   - Build Command: `next build` (web-user) / `yarn build` (web-seller, web-admin)
   - Install Command: `yarn install`
   - Root Directory: `apps/web-user` 또는 `apps/web-seller` 또는 `apps/web-admin`
   - Output Directory: `.next` (web-user) / `dist` (web-seller) / `dist` (web-admin)

#### 2.3 환경변수 설정

1. Vercel 대시보드 → 프로젝트 설정 → Environment Variables
2. 필요한 환경변수 추가

| 프로젝트 | 환경변수 | staging 예시 |
| -------- | -------- | ------------ |
| web-user | (프로젝트별 설정) | — |
| web-seller | `VITE_PUBLIC_API_DOMAIN` | `https://api-staging.sweetorders.com` |
| web-admin | `VITE_PUBLIC_API_DOMAIN` | `https://api-staging.sweetorders.com` |

#### 2.4 Deploy Hook 생성 (웹훅)

1. Vercel 대시보드 → 프로젝트 설정 → Git → Deploy Hooks
2. Deploy Hook 생성
3. 생성된 웹훅 URL 복사 (다음 단계에서 사용)

### 3. GitHub 환경변수 설정

1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. New repository secret 클릭
3. 다음 Secrets 추가:
   - `VERCEL_WEBHOOK_URL_WEB_USER_STAGING`: web-user 스테이징 환경 Vercel 웹훅 URL
   - `VERCEL_WEBHOOK_URL_WEB_SELLER_STAGING`: web-seller 스테이징 환경 Vercel 웹훅 URL
   - `VERCEL_WEBHOOK_URL_WEB_ADMIN_STAGING`: web-admin 스테이징 환경 Vercel 웹훅 URL

### 4. GitHub 워크플로 생성 (태그 기반)

`.github/workflows/deploy-staging-web.yml` 파일을 생성하여 태그 기반 배포 워크플로를 설정합니다.

**워크플로 트리거:**

- `web-user/staging-*` 태그 푸시 시 web-user 배포
- `web-seller/staging-*` 태그 푸시 시 web-seller 배포
- `web-admin/staging-*` 태그 푸시 시 web-admin 배포

**워크플로 동작:**

1. 태그에서 프로젝트명과 환경 추출
2. 프로젝트명과 환경 유효성 검증
3. 프로젝트별 Vercel 웹훅 URL 가져오기
4. Vercel 웹훅 호출하여 배포 트리거

자세한 워크플로 내용은 `.github/workflows/deploy-staging-web.yml` 파일을 참고하세요.

### 5. 도메인 구성 (선택사항)

커스텀 도메인 설정은 [AWS Route53(도메인) - 가이드](<../aws/AWS%20Route53(도메인)%20-%20가이드.md>)를 참고하세요.

## 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel 성능 최적화](https://vercel.com/docs/analytics)
