"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DragHandleBottomSheet } from "@/apps/web-user/common/components/bottom-sheets/DragHandleBottomSheet";
import {
  oauthGoogleLoginButtonClassName,
  oauthKakaoLoginButtonClassName,
  oauthLoginButtonIconClassName,
} from "@/apps/web-user/common/components/buttons/oauth-provider-login-buttons";
import {
  getGoogleOAuthLoginUrl,
  getKakaoOAuthLoginUrl,
} from "@/apps/web-user/features/auth/utils/oauth-login-url.util";
import { useLoginSheetStore } from "@/apps/web-user/common/store/login-sheet.store";

/**
 * 비로그인 사용자에게 노출되는 로그인 / 회원가입 바텀시트.
 * 카카오·구글 OAuth 시작 버튼 노출.
 *
 * 전역 useLoginSheetStore 로 isOpen/close 를 관리하며, RootWrapperLayout 에 1회만 마운트된다.
 * 각 화면에서는 useLoginSheetStore().openLoginSheet() 으로 호출.
 */
export function LoginBottomSheet() {
  const isOpen = useLoginSheetStore((s) => s.isOpen);
  const closeLoginSheet = useLoginSheetStore((s) => s.closeLoginSheet);
  const [googleAuthHref, setGoogleAuthHref] = useState<string | null>(null);
  const [kakaoAuthHref, setKakaoAuthHref] = useState<string | null>(null);

  useEffect(() => {
    setGoogleAuthHref(getGoogleOAuthLoginUrl());
    setKakaoAuthHref(getKakaoOAuthLoginUrl());
  }, []);

  return (
    <DragHandleBottomSheet isOpen={isOpen} onClose={closeLoginSheet} draggable={false}>
      <div className="px-5 py-4">
        <h2 className="text-xl font-bold text-gray-900">로그인 / 회원가입 하기</h2>
        <p className="mt-2 text-sm text-gray-500">픽케이크에서 케이크 예약을 쉽고 빠르게</p>

        <div className="mt-14 flex flex-col gap-3">
          {kakaoAuthHref && (
            <a href={kakaoAuthHref} className={oauthKakaoLoginButtonClassName}>
              <Image
                src="/images/contents/kakaotalk.png"
                alt=""
                width={20}
                height={20}
                className={oauthLoginButtonIconClassName}
              />
              카카오로 시작하기
            </a>
          )}
          {googleAuthHref && (
            <a href={googleAuthHref} className={oauthGoogleLoginButtonClassName}>
              <Image
                src="/images/contents/google.png"
                alt=""
                width={20}
                height={20}
                className={oauthLoginButtonIconClassName}
              />
              구글로 시작하기
            </a>
          )}
        </div>
      </div>
    </DragHandleBottomSheet>
  );
}
