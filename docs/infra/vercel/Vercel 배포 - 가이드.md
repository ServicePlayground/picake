# Vercel 배포 가이드

## 개요

Picake 프로젝트의 web-user, web-seller, web-admin 애플리케이션을 Vercel에 배포하고 관리하는 가이드입니다.

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

이 설정은 브랜치 push 시 Vercel 자동 배포를 막고, **태그 + GitHub Actions**로만 배포한다는 의미입니다.

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

| 프로젝트   | 환경변수                 | staging 예시                      |
| ---------- | ------------------------ | --------------------------------- |
| web-user   | (프로젝트별 설정)        | —                                 |
| web-seller | `VITE_PUBLIC_API_DOMAIN` | `https://api-staging.picakes.com` |
| web-admin  | `VITE_PUBLIC_API_DOMAIN` | `https://api-staging.picakes.com` |

#### 2.4 Vercel 토큰 및 프로젝트 ID 확인

1. https://vercel.com/account/settings/tokens url직접 입력 -> 토큰 생성 및 깃허브 VERCEL_TOKEN secrets 설정
2. Vercel → 팀 선택 → Settings → General → Team ID 복사 및 깃허브 VERCEL_ORG_ID secrets 설정
3. Vercel → 팀 선택 → 각 프로젝트 -> Settings -> General -> Project ID 복사 및 깃허브 VERCEL_PROJECT_ID secrets 설정

#### 2.5 Discord 웹훅 (배포 알림)

1. Discord 서버 → 채널 설정 → 연동 → 웹후크 만들기
2. 웹훅 URL을 GitHub Secret `DISCORD_WEBHOOK_URL_WEB_FE`에 등록

| Secret                                 | 설명                           |
| -------------------------------------- | ------------------------------ |
| `VERCEL_TOKEN`                         | Vercel API 토큰                |
| `VERCEL_ORG_ID`                        | Vercel 팀/개인 Org ID          |
| `VERCEL_PROJECT_ID_WEB_USER_STAGING`   | web-user-staging 프로젝트 ID   |
| `VERCEL_PROJECT_ID_WEB_SELLER_STAGING` | web-seller-staging 프로젝트 ID |
| `VERCEL_PROJECT_ID_WEB_ADMIN_STAGING`  | web-admin-staging 프로젝트 ID  |
| `DISCORD_WEBHOOK_URL_WEB_FE`           | 배포 결과 Discord 알림 웹훅    |

> 이전 Deploy Hook용 `VERCEL_WEBHOOK_URL_*` 시크릿은 더 이상 사용하지 않습니다.

### 4. GitHub 워크플로 (태그 기반 + Discord 알림)

`.github/workflows/deploy-staging-web.yml`에서 태그 푸시 시 Vercel CLI로 빌드·배포하고, 성공/실패 시 Discord로 알립니다.

**워크플로 트리거:**

- `web-user/staging-*` 태그 푸시 시 web-user 배포
- `web-seller/staging-*` 태그 푸시 시 web-seller 배포
- `web-admin/staging-*` 태그 푸시 시 web-admin 배포

**워크플로 동작:**

1. 태그에서 프로젝트명·환경 추출 및 검증
2. 모노레포 의존성 설치 (`yarn install`)
3. `vercel pull` → `vercel build` → `vercel deploy` (배포 완료까지 대기)
4. Discord에 성공/실패, 배포 URL, GitHub Actions 로그 링크, Vercel 빌드 로그 일부 전송

자세한 워크플로 내용은 `.github/workflows/deploy-staging-web.yml` 파일을 참고하세요.

### 4. 도메인 구성 (선택사항)

커스텀 도메인 설정은 [AWS Route53(도메인) - 가이드](<../aws/AWS%20Route53(도메인)%20-%20가이드.md>)를 참고하세요.

## 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel 성능 최적화](https://vercel.com/docs/analytics)
