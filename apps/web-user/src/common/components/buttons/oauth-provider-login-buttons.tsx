import * as React from "react";
import { cn } from "@/apps/web-user/common/lib/utils";

/** OAuth 로그인 버튼 공통 — 아이콘 `Image`에 함께 사용 (20×20) */
export const oauthLoginButtonIconClassName = "size-[20px] shrink-0 object-contain";

export const oauthKakaoLoginButtonClassName = cn(
  "flex h-[52px] w-full items-center justify-center gap-[6px] rounded-2lg border-0 bg-[#FFEB00] text-base font-bold leading-none text-gray-900",
);

export const oauthGoogleLoginButtonClassName = cn(
  "flex h-[52px] w-full items-center justify-center gap-[6px] rounded-2lg border border-solid border-gray-100 bg-white text-base font-bold leading-none text-gray-900",
);

export const OAuthKakaoLoginButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(oauthKakaoLoginButtonClassName, className)}
    {...props}
  />
));
OAuthKakaoLoginButton.displayName = "OAuthKakaoLoginButton";

export const OAuthGoogleLoginButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(oauthGoogleLoginButtonClassName, className)}
    {...props}
  />
));
OAuthGoogleLoginButton.displayName = "OAuthGoogleLoginButton";
