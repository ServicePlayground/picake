---
name: picake-review-ios-app-store
description: Picake web-user가 겉면만 Flutter로 감싼 웹뷰 앱으로 iOS 앱스토어 심사를 준비하거나 반려에 대응할 때 사용합니다. "iOS 심사 준비해줘", "심사노트 써줘", "리젝됐어 대응해야 돼", "애플 반려 사유 확인" 같은 요청에 이 skill을 따르세요. 이 저장소(web-user/backend)에 이미 구현된 심사 대응 장치(심사용 로그인, Apple 로그인, 계정삭제, 딥링크 수정)를 안내하고 App Store Connect 심사노트 문구 초안을 제공합니다. 네이티브 Flutter 앱 자체(별도 저장소)의 Info.plist·권한 문구·스크린샷·App Privacy 설문은 이 skill 범위 밖이며 앱담당자 확인이 필요합니다.
---

# iOS 앱스토어 심사 대응

Picake web-user는 겉면만 Flutter로 감싼 **웹뷰 앱**입니다 — 로그인부터 주문·결제까지 대부분의 로직이 `apps/web-user`(Next.js)와 `apps/backend`에 있고, 네이티브 Flutter 쪽은 스플래시, FCM 푸시 토큰, 위치 브릿지(`window.mylocation`), 딥링크 스킴 처리 정도만 담당합니다(`apps/web-user/src/common/utils/webview.bridge.ts` 참고). 이 구조 자체가 Apple 심사에서 반복적으로 걸리는 지점이므로, **반려 메일을 받으면 먼저 이 문서에서 해당 가이드라인 번호를 찾아 이미 구현된 대응이 있는지 확인하고, 없는 부분만 새로 작업하세요.**

## 0. 이 저장소에서 할 수 있는 일 vs 없는 일

- 네이티브 Flutter iOS 앱은 **별도 저장소**(이 모노레포에 없음, `find`로 확인해도 `.xcodeproj`/`pubspec.yaml`이 없음). 여기서 실제로 고칠 수 있는 건 web-user/backend 코드뿐입니다.
- 다음 항목은 **앱담당자 확인이 필요** — 임의로 답하거나 추측해서 심사노트에 쓰지 않습니다:
  - Info.plist 권한 사용 설명 문구(위치·알림 등), 앱 아이콘, 스크린샷, 앱 이름/부제
  - App Store Connect의 **App Privacy(개인정보 수집 항목 설문)** — 실제 수집 항목(휴대폰번호, 위치, 소셜 로그인 식별자 등, [[picake-legal-terms]] skill의 개인정보처리방침 항목과 일치해야 함)과 어긋나면 그 자체로 반려 사유가 됨
  - Associated Domains capability 설정 여부(현재 iOS는 Universal Links를 껐으므로 **켜져 있으면 안 됨** — 아래 §1의 딥링크 항목 참고)
- 실제 반려/재현 이력: **4.8 (Sign in with Apple 누락)**, **Universal Links로 인한 iOS 자체 백그라운드 전환 버그**(크래시성 동작으로 반려·재현 가능성 있었음). 아래 §1에서 원인과 대응을 정리합니다.

## 1. 가이드라인별 위험 지점과 이 저장소의 대응 현황

### 4.2 Minimum Functionality — "그냥 웹사이트를 감싼 것" 반려, 상시 최대 위험

웹뷰 비중이 높은 앱에서 가장 흔한 반려 사유입니다. 이 앱이 단순 웹사이트 래핑이 아니라는 근거로 심사노트·질의응답에 쓸 수 있는 사실:

- 네이티브 브릿지로 OS 기능을 실제로 사용: FCM 푸시 토큰 등록/해제(`requestFcmTokenUpsert`/`requestFcmTokenRemove`), 위치 정보 요청(`requestLocationFromWebView`, 앱 진입 시 자동 요청), OS 설정 화면 열기(`requestOpenAppSettings`) — 전부 `webview.bridge.ts`.
- 커스텀 URL 스킴(`picake://`)으로 카카오 알림톡 등 외부에서 앱을 직접 열 수 있음 ([[picake-link-app-deep-links]] skill).
- 콘텐츠가 100% 웹 렌더링이 아니라 위치 기반 필터링, FCM 실시간 알림 등 디바이스 상태에 반응하는 기능이 있음.
- **반려 근거로 계속 쓰였다면**: 웹뷰 비중을 줄이라는 요구일 수 있으므로, 반려 메일의 정확한 문구를 사용자에게 받아 어떤 하위 사유(4.2.1 기능 없음 / 4.2.2 사업성 등)인지 먼저 특정하세요 — 뭉뚱그려 "웹뷰라서"로 판단하지 않습니다.

### 4.8 Sign in with Apple — 실제 반려 이력 2건, 둘 다 대응 완료

**1차 반려(2026-08-02)**: Google 로그인을 제공하면서 Apple 로그인 자체가 없었음. `apps/web-user`에 Apple 로그인 구현 완료 — 상세는 [[picake-auth-social-login]] skill §5, 작업 배경은 memory `project-apple-signin-web-user` 참고.

**2차 반려(2026-08-04, 가이드라인 4 — 디자인/UX 요구사항)**: "Apple로 로그인 사용 후 인증 프레임워크가 이미 제공한 이름/이메일을 사용자에게 다시 입력하도록 요구함." 원인은 Apple OAuth authorize URL이 `scope=email`만 요청해 Apple의 `user`(이름) 객체를 아예 안 받았고, 그래서 `AppleRegisterVerificationScreen.tsx`의 "이름" 필드가 항상 빈 채로 강제 입력을 요구했기 때문 — 이메일은 원래도 사용자에게 재입력을 요구하지 않았음(백엔드가 조용히 전달).
**수정 완료(2026-08-04)**: `getAppleOAuthLoginUrl()`(`oauth-login-url.util.ts`)의 scope를 `name email`로 변경 → Apple이 **최초 인가 1회 한정**으로 보내는 `user` JSON(form_post 바디)을 `/auth/login/apple/route.ts`가 파싱(`extractAppleDisplayName`)해 `appleName` 쿼리로 콜백(`login/apple/callback/page.tsx`) → 회원가입 화면(`AppleRegisterVerificationScreen.tsx`)까지 전달, "이름" 필드를 미리 채워둠(수정은 여전히 가능 — Apple도 편집 가능한 pre-filled 필드는 허용). **재발 방지 포인트**: Apple은 두 번째 로그인부터는 `user`를 다시 안 보내므로(계정 재인가 등) 그때는 정상적으로 빈 입력을 받는 게 맞음 — "왜 이번엔 이름이 안 채워지지"라고 이걸 다시 버그로 오인하지 말 것.
**제출 전 확인**: `NEXT_PUBLIC_APPLE_CLIENT_ID`가 `web-user-staging`/`web-user-production` Vercel 프로젝트에 실제로 설정돼 있는지, staging Return URL이 Apple 쪽에 등록됐는지 — 이 두 가지는 로컬에서 재현 불가능하므로 실기기/스테이징에서 **탈퇴 후 재가입** 등으로 최초 인가 상태를 만들어 이름이 실제로 채워지는지 검증하세요(같은 Apple 계정으로 이미 한 번 이 앱에 인가했다면 `user`가 다시 안 옴 — Apple ID 설정 > 로그인 및 보안 > Apple로 로그인 사용 중인 앱에서 Picake 연결을 해제해야 최초 인가 상태로 재현 가능).

### 5.1.1(v) 계정 삭제 — 대응 완료

앱 내에서 고객센터 문의 없이 바로 탈퇴 가능해야 합니다. `apps/web-user/src/app/mypage/setting/account/page.tsx` + `WithdrawBottomSheet` + `useWithdraw` 훅으로 마이페이지 > 설정 > 계정에서 즉시 탈퇴 가능. Apple 계정으로 가입한 경우 탈퇴 시 `POST https://appleid.apple.com/auth/revoke`까지 호출([[picake-auth-social-login]] skill §5 "탈퇴 시 revoke 필수"). 진행 중인 주문이 있으면 탈퇴가 막히는데(`WITHDRAW_BLOCKED_ACTIVE_ORDERS`), 이건 정상 비즈니스 로직이지 심사 반려 사유가 아님 — 다만 심사관 계정에 진행 중 주문이 남아있으면 탈퇴 테스트가 막히니 심사 전 확인.

### 2.1(a) 필요한 정보 / 데모 콘텐츠 — 실제 반려 이력, 근본 원인은 "활성 지역" 판정 버그, 대응 완료

**반려 내용(2026-08-04)**: "앱의 전체 또는 일부에 성공적으로 접근할 수 없음 — 모든 계정 유형의 모든 기능을 확인할 방법이 필요하며, 데모 계정에는 케이크 콘텐츠·홈페이지 상점 목록 같은 미리 채워진 콘텐츠가 포함돼야 함." 첨부 스크린샷 기준 재현: 심사관 위치(미국 Cupertino 지역)뿐 아니라 **한국 실제 구(예: 종로구)를 지역 선택 시트에서 직접 선택해도** 홈 화면 "신규케이크"/"인기케이크" 섹션이 계속 "등록된 상품이 없습니다"로 비어 있었음.

**근본 원인**: 지역이 "선택 가능(활성)"인지 판정하는 `StoreListService.getRegionCounts()`(`apps/backend/src/modules/store/services/store-list.service.ts`)가 **그 지역에 스토어 레코드가 하나라도 있는지**만 셌지, **노출 가능한 상품이 있는지**는 확인하지 않았음. 그래서 셀러가 스토어만 등록하고 상품을 아직 안 올렸거나(또는 전부 비공개) 하는 지역도 `storeCount > 0`으로 잡혀 `RegionSelectSheet`(선택 가능 목록 필터: `d.storeCount > 0`)에서 정상 선택 가능한 지역으로 노출되고, `Header.tsx`의 GPS 자동 매칭도 그 지역을 "활성"으로 판단해 넘어갔음. 실제 홈 화면 상품 목록(`ProductListService.getProductsForUser`)은 `visibilityStatus: ENABLE` 상품만 필터링하므로 이 둘의 기준이 어긋나 있었음 — 심사관이 어느 지역을 고르든(또는 자동 매칭되든) 상품 없는 지역에 걸리면 "앱이 안 된다"는 인상을 주는 구조.

**수정 완료(2026-08-04)**: `getRegionCounts()`의 스토어 카운트 조건에 `products: { some: { visibilityStatus: EnableStatus.ENABLE } }`를 추가 — 이제 노출 가능한 상품을 1개 이상 가진 스토어가 있어야만 그 지역이 "활성"으로 집계되고, `RegionSelectSheet`/GPS 자동 매칭 양쪽 모두 실제로 콘텐츠가 있는 지역만 사용자에게 보여줌.

**남은 확인 필요 사항(코드로 해결 불가, 운영 데이터 문제)**: 이 수정은 "비어있는 지역을 활성으로 잘못 보여주는" 버그만 고친 것이지, 상품이 아예 없는 지역에서 콘텐츠가 저절로 생기는 게 아닙니다. 심사 제출 전 반드시:
1. 프로덕션 DB에 `visibilityStatus: ENABLE` 상품을 가진 스토어가 실제로 존재하는지, 몇 개 지역에 분포하는지 확인 (관리자 페이지 또는 `db:studio` 등으로).
2. 활성 지역이 극소수(예: 강남구 하나)라면, 심사관이 그 지역으로 자동/수동 유도되는지 실기기로 직접 검증 — 특히 GPS 위치가 한국이 아닌 경우(Apple 심사는 대체로 해외에서 진행) `Header.tsx`의 "outside" 분기(`handleOutsideConfirm`)가 기본 지역(강남구)으로 정상 리셋되는지 확인.
3. 가능하면 활성 지역을 1곳보다 늘려서(실제 셀러 온보딩 또는 데모용 스토어/상품 등록) 심사관이 지역을 이리저리 눌러봐도 빈 화면을 안 만나게 하는 게 가장 안전합니다.

### 2.1 App Completeness — 로그인 없이 둘러보기 가능한지 확인 완료

홈/상품/스토어 상세는 로그인 없이 열람 가능 (`useRequireLogin`은 주문 상세(`useOrderDetail.ts`) 등 사용자 전용 데이터에만 적용, 홈 목록/검색/지도에는 없음). 심사관이 로그인 없이 앱을 처음 켰을 때 빈 화면이나 강제 로그인 벽을 만나지 않는지 실제로 확인하세요.

### 3.1.1 / 3.1.5 인앱결제 — 구조상 해당 없음, 오해 방지용으로 심사노트에 명시 권장

실제 결제 수단은 PG 카드결제가 아니라 **스토어 정산 계좌로의 계좌이체(무통장입금)**입니다 (`apps/backend/src/modules/order`, [[picake-legal-terms]] skill §2 참고). 디지털 콘텐츠가 아니라 베이커리 등 실물/서비스 거래이므로 In-App Purchase 대상이 아니지만, 심사관이 "결제 버튼이 외부로 연결된다"고 오인해 3.1.1로 잘못 반려하는 경우가 있어 §3 심사노트 초안에 이 사실을 명시해 둡니다.

### Universal Links로 인한 iOS 백그라운드 전환 — 실제 버그, 대응 완료 (재활성화 금지)

카카오톡 인앱브라우저 등에서 Universal Links로 앱이 열리면 진입 직후(~1초) iOS가 자체적으로 앱을 백그라운드로 내리고 Safari를 다시 띄우는 현상이 실기기에서 확인됐습니다(앱 쪽 코드에 외부 브라우저를 여는 경로 없음 확인, iOS 자체 동작으로 판단). 이런 동작은 심사관에게 "앱이 예기치 않게 종료/전환된다"는 인상을 줘 반려·재현 조사로 이어질 수 있습니다. 현재 iOS만 Universal Links를 끄고 커스텀 스킴으로 전환한 상태 — 상세와 재활성화 시 주의사항은 [[picake-link-app-deep-links]] skill §2 참고. **AASA(`apple-app-site-association`)에 appID를 다시 채워 Universal Links를 켜는 작업은 이 버그의 원인 규명 없이 하지 않습니다.**

## 2. 심사관용 로그인 (Review Account)

앱스토어 심사관이 실제 휴대폰 인증 없이 로그인할 수 있도록 별도 진입점을 만들어 두었습니다.

1. 앱에서 **마이페이지 > 버전 정보**(`/mypage/version`, `VersionInfoScreen.tsx`)로 이동
2. "앱 버전" 라벨을 **2초 이내 간격으로 10회 연속 탭** → 심사용 로그인 바텀시트(`ReviewLoginBottomSheet`) 노출
3. 6자리 코드 입력 → `POST /v1/consumer/auth/review-login` 호출 → 심사용 계정(`phone: "REVIEW_ACCOUNT"`, 최초 호출 시 자동 생성)으로 로그인

**코드 값은 반드시 실제 사용 시점에 `apps/backend/src/modules/auth/constants/auth.constants.ts`의 `REVIEW_LOGIN_CODE`를 grep해서 확인하세요** — 기억이나 이 문서에 적힌 값을 그대로 믿지 않습니다. 소스 주석에 "심사가 끝나면 다른 값으로 교체하거나 라우트 자체를 제거하는 걸 권장"이라고 돼 있어 리젝-재제출을 반복하는 동안에도 값이 바뀌었을 수 있습니다. 코드를 바꾸면 §3 심사노트 초안의 값도 같이 갱신하세요.

## 3. App Store Connect 심사노트(App Review Information → Notes) 문구 초안

제출 전 §2에서 확인한 실제 코드 값으로 `{REVIEW_CODE}`를 채워서 사용하세요.

**한국어 초안:**

```
[로그인 방법]
1. 앱 실행 후 로그인 없이도 홈/상품/스토어를 둘러보실 수 있습니다.
2. 로그인이 필요한 화면(주문, 좋아요 등) 테스트를 위해 심사용 로그인을 제공합니다:
   마이페이지 > 버전 정보 화면에서 "앱 버전" 텍스트를 2초 이내 간격으로 10회 연속 탭하면
   심사용 로그인 창이 나타납니다. 코드 "{REVIEW_CODE}"를 입력하면 로그인됩니다.

[결제 안내]
본 서비스는 베이커리 등 실물 상품/서비스를 다루며, 결제는 인앱결제가 아니라
스토어 계좌로의 계좌이체(무통장입금) 방식입니다. 디지털 콘텐츠 판매가 아니므로
In-App Purchase 대상이 아닙니다.

[위치 정보 안내]
주변 스토어 검색을 위해 앱 진입 시 위치 권한을 요청합니다. 권한을 거부하거나
서비스 지역 밖(해외 등)에서 접속하시는 경우 기본 지역(서울 강남구) 기준으로
자동 전환되며, 등록된 케이크 상품을 바로 확인하실 수 있습니다.

문의사항이 있으시면 picakeee@gmail.com으로 연락 주시면 신속히 답변드리겠습니다.
```

**영문 초안:**

```
[How to sign in]
1. You can browse the home feed, products, and stores without signing in.
2. For features that require an account (orders, likes, etc.), we provide a
   reviewer login: go to My Page > App Version, tap the "App Version" label
   10 times within 2 seconds to reveal a review-login sheet, then enter the
   code "{REVIEW_CODE}" to sign in.

[About payment]
This app is for ordering real-world bakery goods/services. Payment is handled
via bank transfer to the store's settlement account, not In-App Purchase —
there is no digital content being sold, so IAP does not apply.

[About location]
The app requests location permission on launch to search nearby stores. If
denied, or if you're outside our service area, the app automatically falls
back to a default region (Gangnam-gu, Seoul) with cake products available.

If you have any questions, please contact us at picakeee@gmail.com.
```

## 4. 반려 메일을 받았을 때 대응 절차

1. 반려 메일의 **가이드라인 번호와 정확한 문구**를 사용자에게 그대로 받습니다 — 요약하지 말고 원문 그대로.
2. §1에서 해당 번호를 찾아 이미 대응이 있는지 확인. 있으면 왜 이번에도 걸렸는지(코드 값 미갱신, Vercel 환경변수 누락 등 §1 각 항목의 "제출 전 확인" 문구) 먼저 의심합니다.
3. 새로운 사유라면 원인을 코드에서 먼저 확인(추측 금지) 후 수정하고, 이 skill 문서(§1)에 새 항목으로 추가해 다음 제출/다음 담당자가 반복하지 않도록 합니다.
4. 네이티브 앱 쪽(Info.plist, 권한 문구, App Privacy 설문) 관련 반려면 §0의 "앱담당자 확인 필요" 목록에 해당 여부를 먼저 판단하고, 맞다면 이 저장소에서 할 수 있는 일이 없다는 걸 명확히 안내합니다.

## 5. 제출 전 체크리스트

- [ ] §2 심사용 로그인 코드가 `auth.constants.ts`의 현재 값과 일치하는지 확인 (grep)
- [ ] Apple 로그인이 스테이징/프로덕션에서 실제로 끝까지 되는지 실기기로 검증 (Vercel env, Apple Return URL 등록)
- [ ] Apple 로그인 최초 인가 시 "이름" 필드가 실제로 미리 채워지는지 검증 (Apple ID 설정에서 Picake 연결 해제 후 재인가해야 재현 가능 — §1의 4.8 항목 참고)
- [ ] 프로덕션에 `visibilityStatus: ENABLE` 상품을 가진 스토어가 실제로 존재하고, 심사관이 자동/기본으로 도달하는 지역(기본값: 강남구)에 그 상품이 보이는지 확인 (§1의 2.1(a) 항목 참고) — 활성 지역이 1곳뿐이면 심사관이 지역을 바꿔볼 경우를 대비해 늘리는 것을 권장
- [ ] 로그인 없이 홈/상품/스토어 진입이 실제로 되는지 확인 (강제 로그인 벽 없음)
- [ ] 마이페이지 > 설정 > 계정에서 탈퇴가 실제로 끝까지 되는지 확인, 심사 계정에 진행 중 주문이 남아있지 않은지 확인
- [ ] `curl https://picakes.com/.well-known/apple-app-site-association`가 `{ applinks: { details: [] } }`인지(Universal Links 비활성 유지) 확인
- [ ] App Store Connect의 App Privacy 설문이 [[picake-legal-terms]] skill의 개인정보처리방침(수집 항목)과 일치하는지 앱담당자에게 확인 요청
- [ ] §3 심사노트에 최신 코드 값·연락처를 채워 App Store Connect에 실제로 붙여넣기
