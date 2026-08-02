---
name: data-report
description: 사용자 데이터, 전환율, PostHog 지표, 회원수 등 Picake의 종합 데이터를 보여달라는 요청을 받으면 사용합니다. "사용자 데이터 보여줘", "전환율 어때", "이번 주 지표 알려줘", "회원수 몇 명이야" 같은 요청에 이 skill을 참고해 PostHog(행동 데이터)와 관리자 통계(DB 데이터)를 함께 조회해 리포트를 보여주세요.
---

# 종합 데이터 리포트

Picake의 데이터는 두 곳에 나뉘어 있습니다. **행동 데이터(페이지뷰·클릭·전환 퍼널)는 PostHog**, **DB가 원본인 지표(회원수·주문·매출·스토어)는 백엔드 관리자 통계 API**입니다 (`apps/backend/src/apis/admin/controllers/statistics.controller.ts` 주석에 명시된 설계). 이 skill은 둘을 한 번에 모아 예쁜 대시보드로 보여주는 절차입니다.

## 0. 범위 확인

사용자 요청에서 아래가 불명확하면 짧게 확인하되, 굳이 다 묻지 말고 합리적 기본값으로 진행합니다.

- **환경**: `production`(`https://api.picakes.com`) 또는 `staging`(`https://api-staging.picakes.com`). 언급 없으면 production 기준으로 진행. 사용자가 명확히 밝히지 않으면 두 환경 중 어디를 보여줄지, DB 통계는 관리자 토큰이 필요하다는 점을 먼저 물어봐도 됩니다.
- **기간**: 일별 추이는 기본 최근 30일.
- 특정 카테고리만 요청한 경우(예: "회원가입 전환율만") 해당 섹션만 조회해도 됩니다.

## 1. PostHog 데이터 수집

프로젝트는 이미 `.mcp.json`에 연결되어 있습니다 (`posthog` MCP, project id `497749`, org "picake"). `mcp__posthog__exec` 도구로 아래를 조회하세요.

### 기본 제품 분석 지표 (PostHog 기본 기능)

- 활성 사용자: DAU / WAU / MAU (고유 사용자 수 트렌드)
- `$pageview` 총 건수, 신규 vs 재방문 사용자 비율
- 이미 PostHog에 저장된 Insight/Dashboard가 있다면 함께 조회해서 보여주세요 (팀이 이미 만들어둔 지표를 놓치지 않기 위함) — `insight`/`dashboard` 도메인 조회.

### 커스텀 이벤트 기반 전환 퍼널 (팀이 추가한 기능)

전체 이벤트 정의는 `apps/web-user/src/common/types/analytics.type.ts`에 있습니다 (총 65개, `view_*`=화면 노출 `engage_*`=클릭 `request_*`=요청 전송 `success_*`/`fail_*`=서버 응답 네이밍 규칙). 아래 퍼널 단위로 단계별 전환율을 HogQL/퍼널 쿼리로 계산하세요.

| 퍼널                 | 이벤트 순서                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------- |
| 예약(주문)           | `view_product_detail` → `engage_reservation` → `request_reservation` → `success_reservation` |
| 회원가입             | `view_login_entry` → `engage_social_select` → `request_signup` → `success_signup`            |
| 검색                 | `engage_search_bar` → `request_search` → `view_search_result`                                |
| 지도 탐색            | `view_map` → `engage_store_pin`                                                              |
| 미입금 리마인드 대응 | `view_payment_alarm` → `engage_easy_payment` → `success_payment_complete`                    |
| 리뷰 작성            | `engage_review_write` → `success_review_submit`                                              |
| 예약 취소            | `engage_cancel_reservation` → `request_cancel_reservation` → `success_cancel_reservation`    |
| 환불 정보 등록       | `request_refund_info` → `success_refund_info`                                                |

사용자가 위 목록에 없는 세부 질문(특정 이벤트의 기간별 추이, 특정 유저 세그먼트 등)을 하면 같은 MCP로 자유롭게 추가 질의하세요.

**주의**: 위 이벤트 이름은 `analytics.type.ts`의 타입 정의 기준이며, 실제로 `trackEvent(...)` 호출까지 코드에 있어도 PostHog에 단 한 번도 수집되지 않았을 수 있습니다 (버그로 전송이 안 됐거나, 아직 그 인터랙션을 아무도 실행하지 않은 경우). `read-data-schema`(`kind: events`)로 실제 존재하는 이벤트만 먼저 확인하고, 목록에 없는 이벤트는 퍼널에서 빼거나 실재하는 근접 이벤트로 대체하세요. 이때 "이벤트가 없다"를 "아무도 안 눌러서 데이터가 없다"로 단정하지 말고, DB 통계(예: 주문 건수)와 대조해서 크게 어긋나면(예: DB엔 주문이 여러 건인데 `request_reservation`/`success_reservation`이 0건) 트래킹 누락 가능성으로 사용자에게 알려주세요.

## 2. 관리자(DB) 통계 수집

백엔드 관리자 통계 API를 호출합니다. 관리자 로그인은 아이디/비번 + Google OTP(TOTP)가 필수라 자동화된 토큰이 없습니다. **저장된 비밀번호나 OTP secret을 요구하거나 대신 로그인을 시도하지 마세요** — 대신 사용자에게 해당 환경의 유효한 관리자 액세스 토큰(Bearer)을 요청하세요. (web-admin에 로그인한 뒤 브라우저 개발자도구 → localStorage 또는 네트워크 탭에서 확인 가능하다고 안내하면 됩니다.)

토큰을 받으면 아래 엔드포인트를 `Authorization: Bearer <token>`으로 호출합니다 (base URL은 0번에서 정한 환경 기준). **API에는 전역 prefix `/v1`이 붙습니다** (`apps/backend/src/common/constants/app.constants.ts`의 `API_PREFIX`) — `/admin/statistics/...`가 아니라 `/v1/admin/statistics/...`로 호출해야 합니다. prefix를 빼먹으면 404(Not Found)가 납니다.

| 메서드/경로                                                                                                                 | 응답 형태                                                                          |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `GET /v1/admin/statistics/users`                                                                                            | `{ consumers: {total, today, last7Days, last30Days, withdrawn}, sellers: {...} }`  |
| `GET /v1/admin/statistics/orders`                                                                                           | `{ total, gmv, byStatus: [{status, count}] }`                                      |
| `GET /v1/admin/statistics/stores`                                                                                           | `{ stores: {total, today, last7Days, last30Days}, businessVerifiedStores: {...} }` |
| `GET /v1/admin/statistics/store-entry-requests`                                                                             | `{ storeEntryRequests: {total, today, last7Days, last30Days} }`                    |
| `GET /v1/admin/statistics/daily-trends?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&metrics=signups,orders,stores,entryRequests` | `{ days: [...] }` (날짜는 Asia/Seoul 기준)                                         |

예: `https://api.picakes.com/v1/admin/statistics/users`, `https://api-staging.picakes.com/v1/admin/statistics/orders`.

토큰이 만료됐거나 401이 오면 사용자에게 재로그인 후 새 토큰을 요청하세요.

## 3. 대시보드로 표시

1. `dataviz` skill을 먼저 로드해서 카드/스탯 타일/차트 스타일 가이드를 따르세요.
2. Artifact(HTML)로 대시보드를 렌더링합니다. 섹션 구성:
   - ① 회원/가입 현황 (구매자·판매자 총계, 오늘/7일/30일 신규, 탈퇴)
   - ② 주문·매출 (총 주문 수, GMV, 상태별 건수)
   - ③ 스토어·입점 현황 (스토어 총계, 사업자 인증 완료, 입점 요청)
   - ④ PostHog 행동 지표 (DAU/WAU/MAU, pageview) 및 전환 퍼널
   - ⑤ 일별 추이 (신규가입/주문/스토어/입점요청 라인 또는 바 차트)
3. 채팅 답변에는 대시보드와 별도로 핵심 하이라이트 3~5개(눈에 띄는 수치, 전일/전주 대비 변화 등)를 텍스트로 짧게 요약하세요.
