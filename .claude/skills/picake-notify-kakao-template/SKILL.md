---
name: picake-notify-kakao-template
description: Picake의 카카오 알림톡 템플릿을 SOLAPI에 새로 등록하거나 승인요청(검수 제출)할 때 사용합니다. "카카오 템플릿 만들어줘", "솔라피에 템플릿 등록해줘", "알림톡 템플릿 승인요청 해줘" 같은 요청에 이 skill을 따르세요.
---

# 카카오 알림톡 템플릿 등록 (SOLAPI)

Picake는 SOLAPI를 통해 카카오 알림톡을 발송하며, 현재 9개의 승인된 주문 흐름 템플릿이 있습니다. 이 skill은 **새 템플릿을 기존 템플릿과 형식·톤을 맞춰 등록하고, 검수(승인요청)까지 제출**하는 절차입니다.

## 0. 연결 확인

`.mcp.json`에 `solapi` MCP 서버가 등록되어 있지만 세션 시작 시 자동 연결되지 않을 수 있습니다. `mcp__solapi__list_kakao_templates` 같은 도구가 안 보이면 사용자에게 `/mcp`로 재연결을 요청하세요. API Key/Secret이 없다는 에러(`solactl configure`)가 나면 `mcp__solapi__configure_setup`으로 등록을 안내하세요 (`~/.solactl/credentials.json`에 저장되어 세션 간 유지됨).

## 1. 기준선 확보 — 반드시 기존 템플릿부터 확인

새 템플릿을 만들기 전에 아래 두 곳에서 기존 관례를 확인합니다. 절대 임의로 새 스타일을 만들지 않습니다.

1. `apps/backend/src/modules/notification/constants/user-order-alimtalk.constants.ts` — 코드상 templateId 매핑의 authoritative source. 어떤 상태 전환에 어떤 템플릿이 쓰이는지, 버튼 URL 상수(`USER_ORDER_ALIMTALK_BUTTON_URLS`)가 어떻게 재사용되는지 확인.
2. `mcp__solapi__list_kakao_templates` (또는 `get_kakao_template`으로 특정 템플릿) — 실제 SOLAPI에 등록된 원본 구조(JSON) 확인.

### 고정 관례 (모든 기존 템플릿 공통)

- `channelId`: `KA01PF2607051137369106OMrBnNUEsh` (picake 채널 고정)
- `categoryCode`: `002003`
- `messageType`: `BA`, `emphasizeType`: `TEXT`
- `emphasizeSubtitle`: `"picake"` 고정
- `emphasizeTitle`: 2~6글자 핵심 문구 + "안내"/"완료" 등 (예: "입금 안내", "픽업 완료", "예약 취소 안내")
- `name`: `"동작요약(트리거 조건)"` 형식. 자동 발송 트리거면 조건을 명시 (예: `"픽업대기(픽업날짜와시간이일치하면자동전환, 24시간전 알림전송)"`, `"취소완료(입금 마감 시간이 지났을때 자동 전환)"`)
- 변수: `#{변수명}` 형식, 한글. **기존 변수명을 최대한 재사용**(`#{고객명}` `#{스토어명}` `#{주문번호}` `#{상품명}` `#{결제금액}` `#{도메인}` `#{주문ID}` 등) — 새 변수를 늘리면 발송 로직에서 매번 값을 채워야 하므로 꼭 필요할 때만 추가.
- 버튼: `WL`(웹링크) 타입이 기본, `linkMo`/`linkPc` 동일하게 채움, `targetOut: true`. URL은 가능하면 `USER_ORDER_ALIMTALK_BUTTON_URLS`에 이미 있는 패턴 재사용 (예: 주문 상세/입금 관련이면 `https://#{도메인}/order/#{주문ID}`).
- 본문(content)에는 **마크다운 서식(`**굵게**` 등)을 쓰지 않습니다** — 알림톡 본문은 순수 텍스트이며 볼드체는 실제로 렌더링되지 않습니다. 강조하고 싶은 문장은 그냥 평문으로 두거나 `emphasizeTitle`로 표현합니다.
- 본문 중간에 버튼을 언급할 땐 대괄호 관용구(`[입금 완료]`)를 문장 안에 자연스럽게 녹여 씁니다. 반면 **본문과 분리된 줄에 홀로 있는 `[버튼명]`은 실제 버튼(`buttons` 필드)으로 옮기라는 지시**로 해석합니다 — 본문 텍스트에 그대로 넣지 않습니다.

## 2. 초안 작성 후 반드시 미리보기로 확인

`create_kakao_template` / `update_kakao_template` / `inspect_kakao_template` 도구는 모두 `confirmed` 세이프티 게이트가 있습니다 (`false`/생략 시 SOLAPI를 호출하지 않고 미리보기만 반환).

1. 먼저 `confirmed`를 빼거나 `false`로 호출해 미리보기를 받습니다.
2. 원문 지시에서 애매했던 부분(서식 문법 제거, 대괄호 줄을 버튼으로 해석 등 이 skill이 자동으로 내린 판단)을 사용자에게 명시적으로 알리고, 최종 문구/버튼/변수 전체를 보여줍니다.
3. 사용자가 명시적으로 승인한 뒤에만 `confirmed: true`로 실제 생성합니다.

템플릿 등록과 검수 제출은 외부 검수기관(카카오)에 전달되는 행위이고 되돌리기 번거로우므로, 확인 없이 바로 `confirmed: true`를 쓰지 않습니다.

## 3. 검수(승인요청) 제출

생성된 템플릿의 `templateId`로 `mcp__solapi__inspect_kakao_template`을 호출합니다. 이것도 `confirmed: true`가 필요합니다 — 생성 확인과 별개로, 검수 제출 자체도 사용자가 "승인요청까지 해줘"라고 명시했는지 확인 후 진행합니다.

## 4. 승인 후 코드 연동 (범위 안내)

이 skill은 SOLAPI 템플릿 등록·검수 제출까지만 다룹니다. 승인이 완료된 뒤 실제 발송 로직에 연결하려면:

- `templateId`를 `USER_ORDER_ALIMTALK_TEMPLATE_IDS`(`user-order-alimtalk.constants.ts`)에 추가
- 필요시 `USER_ORDER_ALIMTALK_BUTTON_URLS`에 신규 버튼 URL 추가
- 발송 트리거(배치/훅) 코드 작성

은 별도 구현 작업이며, 사용자가 코드 작업을 요청하면 그때 진행합니다 (승인은 보통 카카오 검수에 시간이 걸리므로 템플릿 등록과 코드 연동을 같은 턴에 끝내지 않아도 됩니다).
