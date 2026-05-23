/** StrictMode remount 후에도 회원가입(휴대폰 인증) 플로우 유지 */
export type PendingGoogleRegister = {
  provider: "google";
  googleId: string;
  googleEmail: string;
};

export type PendingKakaoRegister = {
  provider: "kakao";
  kakaoId: string;
  kakaoEmail: string;
};

export type PendingOAuthRegister = PendingGoogleRegister | PendingKakaoRegister;

let pendingRegister: PendingOAuthRegister | null = null;

export function setPendingOAuthRegister(data: PendingOAuthRegister): void {
  pendingRegister = data;
}

export function getPendingOAuthRegister(): PendingOAuthRegister | null {
  return pendingRegister;
}

export function clearPendingOAuthRegister(): void {
  pendingRegister = null;
}
