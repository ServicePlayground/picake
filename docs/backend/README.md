# Picake Backend

Picake 플랫폼을 위한 NestJS 백엔드 서비스입니다. 3-way 분리된 API 구조로 Consumer, Seller, Admin 역할별로 독립적인 API를 제공합니다.

## 🏗️ 주요 기능

### ✅ 구현 완료

- **3-way API 분리**: Consumer, Seller, Admin 역할별 독립적인 API
- **통합 인증 시스템**: JWT + Google OAuth + Kakao OAuth + 휴대폰 인증
- **상품 관리**: 상품 CRUD, 좋아요, 필터링, 검색 기능
- **스토어 관리**: 스토어 등록, 수정, 목록 조회, 캘린더
- **주문 관리**: 주문 생성, 조회, 상태 관리
- **피드 관리**: 피드 작성, 조회, 상세
- **리뷰 시스템**: 리뷰 작성 및 조회
- **좋아요 / 최근 본 상품**: 좋아요 추가/제거, 최근 본 상품 기록
- **알림 시스템**: FCM 기반 푸시 알림 + WebSocket 실시간 알림
- **채팅 시스템**: Socket.IO 기반 WebSocket 채팅 (개발 중)
- **통계**: 판매자 매출/주문 통계
- **사업자진위확인**: 국세청 API 연동을 통한 사업자등록번호 진위확인
- **역할 기반 접근 제어**: 통합 `@Auth` 데코레이터로 권한 관리
- **데이터베이스**: Prisma ORM + PostgreSQL
- **API 문서**: Swagger 3-way 분리 문서
- **보안**: Rate Limiting, CORS, Helmet
- **파일 업로드**: S3 + CloudFront, 백엔드 경유 업로드 (10MB 제한, MIME/확장자 검증)
- **에러 모니터링**: Sentry 통합
- **헬스 체크**: `/health` 엔드포인트 (DB 연결 상태 포함)

### 🔄 개발 중

- 채팅 시스템 고도화
- Admin API 확장

## 📚 상세 문서

자세한 개발 가이드와 API 문서는 `/docs` 폴더를 참고하세요.

## 🔗 API 엔드포인트

### Consumer API (`/v1/consumer`)

- **인증**: `/v1/consumer/auth/*` - 로그인, 회원가입, 휴대폰 인증, Google/Kakao OAuth
- **상품**: `/v1/consumer/products/*` - 상품 조회, 필터링, 검색
- **스토어**: `/v1/consumer/store/*` - 스토어 조회
- **주문**: `/v1/consumer/orders/*` - 주문 생성 및 조회
- **피드**: `/v1/consumer/feed/*` - 피드 조회
- **리뷰**: `/v1/consumer/reviews/*` - 리뷰 작성 및 조회
- **좋아요**: `/v1/consumer/like/*` - 좋아요 추가/제거
- **마이페이지**: `/v1/consumer/mypage/*` - 사용자 정보 조회/수정
- **알림**: `/v1/consumer/notifications/*` - 알림 목록 조회
- **FCM 토큰**: `/v1/consumer/fcm-token/*` - 푸시 알림 토큰 등록
- **업로드**: `/v1/consumer/uploads/file` - 파일 업로드 (POST, multipart/form-data)

### Seller API (`/v1/seller`)

- **인증**: `/v1/seller/auth/*` - 판매자 로그인, 회원가입, Google/Kakao OAuth
- **사업자**:
  - `/v1/seller/business/validate` - 사업자등록번호 진위확인 (POST)
  - `/v1/seller/business/online-trading-company/detail` - 통신판매사업자 등록상세 조회 (GET)
- **스토어**:
  - `/v1/seller/store/create` - 스토어 생성 (POST)
  - `/v1/seller/store/list` - 내 스토어 목록 조회 (GET)
  - `/v1/seller/store/:storeId` - 스토어 상세 조회/수정
- **상품**: `/v1/seller/products/*` - 상품 CRUD
- **주문**: `/v1/seller/orders/*` - 주문 관리
- **피드**: `/v1/seller/feed/*` - 피드 CRUD
- **통계**: `/v1/seller/statistics/*` - 매출/주문 통계
- **알림**: `/v1/seller/notifications/*` - 알림 목록/설정
- **홈**: `/v1/seller/home/*` - 판매자 홈 대시보드
- **마이페이지**: `/v1/seller/mypage/*` - 판매자 정보 조회/수정
- **업로드**: `/v1/seller/uploads/file` - 파일 업로드 (POST, multipart/form-data)

### Admin API (`/v1/admin`)

- **인증**: `/v1/admin/auth/*` - TOTP 기반 관리자 인증
- **마이페이지**: `/v1/admin/mypage/*` - 관리자 정보 조회

### WebSocket

- **채팅**: `ws://localhost:3000/` (namespace: `/`) - 채팅 메시지
- **알림**: `ws://localhost:3000/notifications` (namespace: `/notifications`) - 실시간 주문 알림 (Seller + Consumer)

### API 문서

- **Consumer API**: http://localhost:3000/v1/docs/consumer
- **Seller API**: http://localhost:3000/v1/docs/seller
- **Admin API**: http://localhost:3000/v1/docs/admin
