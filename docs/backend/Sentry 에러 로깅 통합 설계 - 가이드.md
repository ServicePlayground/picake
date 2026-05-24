# Sentry 에러 로깅 통합 설계 가이드

## 📋 개요

본 문서는 Picake 백엔드에 구현된 Sentry 에러 로깅 시스템의 구조와 동작 방식을 설명하는 가이드입니다.

**최종 업데이트**: 2025-01-23  
**대상**: `apps/backend` 디렉토리

---

## 1. 시스템 아키텍처

### 1.1 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    NestJS Application                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Global Exception Filter                        │  │
│  │  (ErrorResponseInterceptor)                            │  │
│  │  - 모든 예외 캐치                                       │  │
│  │  - 민감 정보 마스킹 (SensitiveDataUtil)                 │  │
│  │  - 로깅 (LoggerUtil)                                    │  │
│  │  - Sentry 전송 (SentryUtil)                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         LoggerUtil (Static Utility)                   │  │
│  │  - 개발/검증 환경에서만 로깅                            │  │
│  │  - NestJS Logger 래퍼                                   │  │
│  │  - 콘솔 출력                                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         SentryUtil (Static Utility)                   │  │
│  │  - 검증/상용 환경에서만 전송                            │  │
│  │  - 5xx 에러만 전송                                      │  │
│  │  - 에러 레벨 결정                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Sentry SDK (@sentry/nestjs)                    │  │
│  │  - 초기화: sentry.config.ts                             │  │
│  │  - 검증/상용 환경에서만 활성화                           │  │
│  │  - Transaction 비활성화 (에러만 전송)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────┐
        │   Sentry Cloud          │
        │   (검증/상용 환경)        │
        └─────────────────────────┘
```

### 1.2 디렉토리 구조

```
apps/backend/src/
├── common/
│   ├── config/
│   │   └── sentry.config.ts              # Sentry 초기화 설정
│   ├── interceptors/
│   │   └── error-response.interceptor.ts # 전역 예외 필터
│   └── utils/
│       ├── logger.util.ts                # 로깅 유틸리티
│       ├── sentry.util.ts                 # Sentry 유틸리티
│       └── sensitive-data.util.ts         # 민감 정보 마스킹
├── main.ts                                # 애플리케이션 진입점
└── ...
```

---

## 2. Sentry 초기화 설정

**위치**: `apps/backend/src/common/config/sentry.config.ts`

**역할**: Sentry SDK 초기화 및 환경별 설정

**주요 설정**:

- 검증(staging) 또는 상용(production) 환경에서만 초기화
- `tracesSampleRate: 0`: Transaction 비활성화 (에러 이벤트만 전송하여 비용 절감)
- `sendDefaultPii: false`: 기본 PII 데이터 수집 비활성화 (개인정보 보호)
- `environment`: 환경 태그 자동 설정

## 3. 환경별 동작 방식

### 3.1 개발 환경 (development)

**로깅**:

- ✅ `LoggerUtil.log()`: 콘솔에 로그 출력
- ✅ `morgan`: HTTP 요청 로깅 (main.ts에서 설정)
- ❌ Sentry: 비활성화

**에러 확인 방법**:

- 로컬 콘솔에서 직접 확인
- 개발 서버 실행 시 터미널에 모든 로그 출력

**설정**:

```env
NODE_ENV=development
SENTRY_DSN=  # 비어있거나 설정하지 않음
```

### 3.2 검증 환경 (staging)

**로깅**:

- ✅ `LoggerUtil.log()`: 콘솔에 로그 출력
- ✅ `morgan`: HTTP 요청 로깅
- ✅ Sentry: 활성화 (5xx 에러만 전송)

**에러 확인 방법**:

- **로깅**: SSH로 서버에 직접 접속하여 로그 확인
  ```bash
  # 서버 접속 후
  docker logs -f <container-name>
  # 또는
  journalctl -u <service-name> -f
  ```
- **에러**: Sentry 대시보드에서 확인

**설정**:

```env
NODE_ENV=staging
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 3.3 상용 환경 (production)

**로깅**:

- ❌ `LoggerUtil.log()`: 로깅하지 않음 (성능 최적화)
- ❌ `morgan`: 비활성화
- ✅ Sentry: 활성화 (5xx 에러만 전송)

**에러 확인 방법**:

- **로깅**: 운영 환경에서는 로깅 비활성화 (성능 최적화)
- **에러**: Sentry 대시보드에서만 확인

**설정**:

```env
NODE_ENV=production
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 4. Sentry 프로젝트 설정

### 4.1 프로젝트 생성

1. **플랫폼**: Nest.js
2. **알림**: 중요 이슈, 이메일로 알림 (Slack, Discord는 유료 플랜)
3. **프로젝트 이름**: `picake-backend-staging` (검증 환경)

### 4.2 환경 변수 설정

각 환경별 `.env` 파일에 추가:

```env
# .env.development
NODE_ENV=development
SENTRY_DSN=  # 비어있거나 설정하지 않음

# .env.staging
NODE_ENV=staging
SENTRY_DSN=https://xxx@sentry.io/xxx

# .env.production
NODE_ENV=production
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 4.3 Sentry 초기화

`main.ts`에서 자동으로 초기화됩니다:

```typescript
// apps/backend/src/main.ts
import { initializeSentry } from "@apps/backend/common/config/sentry.config";
import { SentryUtil } from "@apps/backend/common/utils/sentry.util";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // LoggerUtil 초기화
  LoggerUtil.initialize(configService);

  // SentryUtil 초기화
  SentryUtil.initialize(configService);

  // Sentry 초기화
  initializeSentry(configService);

  // ... 나머지 설정 ...
}
```

---

## 5. 에러 추적 및 디버깅

### 5.1 Response ID를 통한 추적

모든 에러 응답에는 `responseId`가 포함되어 있으며, 이 ID는 Sentry의 태그로도 전송됩니다.

**클라이언트에서 사용**:

1. 에러 응답에서 `responseId` 추출
2. Sentry 대시보드에서 `responseId` 태그로 검색
3. 해당 에러의 상세 정보 확인

**예시**:

```json
{
  "success": false,
  "data": { ... },
  "responseId": "1706004000000-error-uuid-hex",
  "statusCode": 500
}
```

Sentry에서 태그: `responseId: 1706004000000-error-uuid-hex`

## 6. 민감 정보 보호

### 6.1 자동 마스킹

`SensitiveDataUtil`을 통해 자동으로 민감 정보가 마스킹됩니다:

- 이메일: `user@example.com` → `u***@example.com`
- 전화번호: `010-1234-5678` → `010-****-5678`
- 토큰: `Bearer abc123...` → `Bearer ***`
- 기타 민감 필드 자동 감지 및 마스킹

### 6.2 Sentry 전송 전 필터링

`ErrorResponseInterceptor`에서:

1. `SensitiveDataUtil.sanitizeError()`: 에러 객체의 민감 정보 제거
2. `SensitiveDataUtil.maskSensitiveFields()`: 응답 데이터의 민감 정보 마스킹

---

## 7. 에러 분류 및 전송 규칙

### 7.1 에러 분류

1. **5xx 에러 (서버 에러)**
   - 항상 Sentry로 전송
   - 예: DB 연결 실패, 외부 API 호출 실패, 예상치 못한 예외

2. **4xx 에러 (클라이언트 에러)**
   - Sentry로 전송하지 않음
   - 예: 잘못된 요청, 권한 없음, 리소스 없음
   - 이유: 노이즈 방지 (너무 많은 클라이언트 에러가 Sentry에 쌓임)

3. **비즈니스 로직 에러**
   - 서비스에서 직접 `SentryUtil.captureException()` 호출
   - 예: DB 연결 실패, WebSocket 연결 에러

### 7.2 에러 레벨

`SentryUtil.getErrorLevel()`에 의해 자동 결정:

- `500+`: `error`
- `400-499`: `warning` (하지만 전송하지 않음)
- 기타: `info`
