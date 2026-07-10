# Picake Web User

Picake 플랫폼을 위한 Next.js 기반 사용자 웹 애플리케이션입니다. React 19와 최신 웹 기술을 활용하여 최적화된 사용자 경험을 제공합니다.

## 🏗️ 주요 기능

### ✅ 구현 완료

- **인증 시스템**: Flutter WebView 연동 + Google/Kakao OAuth 콜백
- **홈 / 탐색**: 상품 목록, 배너 슬라이더, 카테고리 필터, 검색, 지역 기반 필터링
- **상품**: 상품 목록, 상세 페이지, 줌/핀치 이미지 뷰어 (react-zoom-pan-pinch)
- **스토어**: 스토어 상세 페이지, 스토어 피드
- **주문**: 주문 생성, 주문 목록, 주문 상세, 예약
- **리뷰**: 리뷰 작성 및 조회
- **좋아요 / 저장**: 좋아요 추가/제거, 저장 목록 (Saved)
- **마이페이지**: 사용자 정보 조회/수정, 주문 내역
- **채팅**: Socket.IO 기반 (현재 `/chat` 경로는 홈으로 리다이렉트)
- **알림**: FCM 푸시 알림 + 실시간 알림 목록
- **지도**: 위치 기반 스토어 검색 (Map)
- **검색**: 통합 검색 기능
- **Q&A**: 상품/스토어 문의
- **상태 관리**: Zustand를 활용한 전역 상태 관리
- **API 통신**: TanStack Query + Axios를 활용한 서버 상태 관리
- **에러 처리**: Error Boundary, global-error, Sentry 연동
- **분석**: PostHog (환경 변수 설정 시)
- **반응형 UI**: 모바일 우선 반응형 디자인 (Flutter WebView 환경 최적화)
- **SEO 최적화**: Next.js 메타데이터 API 활용

### 🔄 개발 중

- 결제 시스템

## 🔗 주요 페이지

### 홈 / 탐색

- **홈페이지**: `/` - 메인 페이지 (상품 목록, 배너, 카테고리)
- **검색**: `/search` - 통합 검색
- **지도**: `/map` - 지역 기반 스토어 지도 검색

### 인증 관련 (OAuth 콜백)

- **Google 로그인 콜백**: `/auth/login/google`
- **Kakao 로그인 콜백**: `/auth/login/kakao`
- **Google 회원가입 콜백**: `/auth/register/google`
- **Kakao 회원가입 콜백**: `/auth/register/kakao`

> 기본 로그인·회원가입은 Flutter WebView 앱에서 처리합니다.

### 상품 / 스토어

- **상품 상세**: `/product/:productId` - 상품 상세 페이지
- **스토어 상세**: `/store/:storeId` - 스토어 홈 및 피드

### 주문 / 예약

- **주문 목록**: `/mypage/order` - 주문 내역
- **주문 상세**: `/order/:orderId` - 주문 상세
- **예약 완료**: `/reservation/complete` - 예약 완료

### 마이페이지

- **마이페이지**: `/mypage` - 사용자 정보
- **저장 목록**: `/saved`, `/mypage/saved` - 좋아요/저장 목록

### 커뮤니케이션

- **채팅**: `/chat` - 현재 홈(`/`)으로 리다이렉트
- **알림**: `/alarm` - 알림 목록
- **Q&A**: `/qa` - 상품/스토어 문의

### 개발 서버

- **로컬 개발**: http://localhost:3001
