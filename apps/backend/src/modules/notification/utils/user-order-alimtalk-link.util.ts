/** 알림톡 WL 버튼 공통 링크 변수 (`USER_ORDER_ALIMTALK_BUTTON_URLS`와 함께 사용) */
export type UserOrderAlimtalkLinkVariables = {
  "#{도메인}": string;
  "#{주문ID}": string;
};

/** `PUBLIC_USER_DOMAIN`(`https://` 포함) → 카카오 `#{도메인}` 변수값(호스트만) */
export function toAlimtalkDomainHost(publicUserDomain: string): string | null {
  const value = publicUserDomain.trim();
  if (!value) return null;

  try {
    return new URL(value).host;
  } catch {
    const host = value.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    return host || null;
  }
}

/** 주문 알림톡 버튼 URL에 공통으로 쓰는 링크 변수 */
export function buildUserOrderAlimtalkLinkVariables(
  publicUserDomain: string,
  orderId: string,
): UserOrderAlimtalkLinkVariables | null {
  const domain = toAlimtalkDomainHost(publicUserDomain);
  if (!domain) return null;

  return {
    "#{도메인}": domain,
    "#{주문ID}": orderId,
  };
}
