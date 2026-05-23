export interface MypageProfile {
  id: string;
  phone: string;
  name: string;
  nickname: string;
  profileImageUrl: string;
  isPhoneVerified: boolean;
  isActive: boolean;
  googleId: string;
  googleEmail: string;
  kakaoId: string;
  kakaoEmail: string;
  createdAt: string;
  lastLoginAt: string;
  /** 서비스 이용약관 동의 시각 (미동의 시 null) */
  agreedToTermsAt: string | null;
  /** 개인정보 처리방침 동의 시각 (미동의 시 null) */
  agreedToPrivacyAt: string | null;
  /** 개인정보 제3자 제공 동의 시각 (미동의 시 null) */
  agreedToThirdPartyAt: string | null;
  /** 위치기반서비스 이용약관 동의 시각 (선택 동의 — 미동의 시 null) */
  agreedToLocationTermsAt: string | null;
}
