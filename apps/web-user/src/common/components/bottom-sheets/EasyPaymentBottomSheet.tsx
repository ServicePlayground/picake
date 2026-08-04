"use client";

import { useEffect, useRef, useState } from "react";
import { BottomSheet } from "@/apps/web-user/common/components/bottom-sheets/BottomSheet";
import { Modal } from "@/apps/web-user/common/components/modals/Modal";
import { BottomSheetOptionList } from "./BottomSheetOptionList";
import { APP_ONLY_MODAL } from "@/apps/web-user/common/constants/messages.constant";
import {
  isWebViewEnvironment,
  toExternalAppSchemeUrl,
} from "@/apps/web-user/common/utils/webview.bridge";

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isIOSDevice(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** 스키마 실행 후 이탈이 없으면 미설치로 판단하는 대기 시간 */
const APP_LAUNCH_TIMEOUT_MS = 1500;

type EasyPaymentApp = "toss" | "kakaopay";

const EASY_PAYMENT_APPS: Record<
  EasyPaymentApp,
  { title: string; description: string; iosStoreUrl: string; androidStoreUrl: string }
> = {
  toss: {
    title: "토스 앱이 필요해요",
    description: "토스 앱을 설치한 뒤 다시 시도해주세요.",
    iosStoreUrl: "https://apps.apple.com/kr/app/id839333328",
    androidStoreUrl: "https://play.google.com/store/apps/details?id=viva.republica.toss",
  },
  kakaopay: {
    title: "카카오톡 앱이 필요해요",
    description: "카카오페이 송금은 카카오톡 앱에서 이용할 수 있습니다.",
    iosStoreUrl: "https://apps.apple.com/kr/app/id362057947",
    androidStoreUrl: "https://play.google.com/store/apps/details?id=com.kakao.talk",
  },
};

interface EasyPaymentBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  amount: number;
}

export function EasyPaymentBottomSheet({
  isOpen,
  onClose,
  bankAccountNumber,
  bankName,
  amount,
}: EasyPaymentBottomSheetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notInstalledApp, setNotInstalledApp] = useState<EasyPaymentApp | null>(null);

  // 실행 감지 중인 리스너/타이머 정리 함수
  const cleanupRef = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanupRef.current?.(), []);

  /**
   * 외부 앱 스키마 실행 후 앱 전환 여부로 설치 상태를 판단한다.
   * 앱이 열리면 페이지가 백그라운드로 내려가고, 미설치면 화면에 그대로 남는다.
   */
  const handleDeepLink = (url: string, app: EasyPaymentApp) => {
    if (!isMobileDevice()) {
      setIsModalOpen(true);
      return;
    }

    cleanupRef.current?.();

    let hasLeftPage = false;
    const markLeftOnHidden = () => {
      if (document.hidden) hasLeftPage = true;
    };
    const markLeft = () => {
      hasLeftPage = true;
    };

    document.addEventListener("visibilitychange", markLeftOnHidden);
    window.addEventListener("pagehide", markLeft);
    window.addEventListener("blur", markLeft);

    const timer = window.setTimeout(() => {
      cleanup();
      // 앱으로 전환됐다면 시트를 닫고, 그대로 남아 있으면 미설치로 안내
      if (hasLeftPage || document.hidden) {
        onClose();
        return;
      }
      setNotInstalledApp(app);
    }, APP_LAUNCH_TIMEOUT_MS);

    const cleanup = () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", markLeftOnHidden);
      window.removeEventListener("pagehide", markLeft);
      window.removeEventListener("blur", markLeft);
      cleanupRef.current = null;
    };
    cleanupRef.current = cleanup;

    // 웹뷰에서는 Flutter가 가로채 외부 앱을 실행하도록 커스텀 스키마로 감싼다
    window.location.href = isWebViewEnvironment() ? toExternalAppSchemeUrl(url) : url;
  };

  const notInstalledInfo = notInstalledApp ? EASY_PAYMENT_APPS[notInstalledApp] : null;

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title="간편 입금하기"
        footerShadow={false}
        footer={
          <div className="px-5 py-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full h-[52px] rounded-xl border border-gray-100 text-base font-bold text-gray-900"
            >
              취소
            </button>
          </div>
        }
      >
        <div className="pt-5 px-5">
          <div className="flex flex-col gap-0.5 px-3.5 py-2.5 bg-gray-50 rounded-lg">
            <p className="text-xs font-bold text-gray-700">간편 입금이란?</p>
            <p className="text-xs text-gray-700">
              계좌정보를 자동으로 인식해 바로 이체할 수 있는 서비스입니다.
            </p>
          </div>
        </div>
        <BottomSheetOptionList
          items={[
            {
              icon: { type: "image", src: "/images/contents/toss.png", alt: "토스" },
              label: "토스",
              onClick: () =>
                handleDeepLink(
                  `supertoss://send?bank=${bankName}&accountNo=${bankAccountNumber}&amount=${amount}`,
                  "toss",
                ),
            },
            {
              icon: { type: "image", src: "/images/contents/kakao.png", alt: "카카오페이" },
              label: "카카오페이",
              onClick: () => handleDeepLink("kakaotalk://kakaopay/money/to", "kakaopay"),
            },
          ]}
        />
      </BottomSheet>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={APP_ONLY_MODAL.title}
        description={APP_ONLY_MODAL.description}
        confirmText="취소"
        confirmVariant="outline"
        cancelText="앱 다운로드"
        cancelVariant="primary"
        onConfirm={() => setIsModalOpen(false)}
        onCancel={() => {
          window.open("https://pickcake.app/download", "_blank");
          setIsModalOpen(false);
        }}
      />

      <Modal
        isOpen={!!notInstalledInfo}
        onClose={() => setNotInstalledApp(null)}
        title={notInstalledInfo?.title ?? ""}
        description={notInstalledInfo?.description}
        confirmText="취소"
        confirmVariant="outline"
        cancelText="설치하러 가기"
        cancelVariant="primary"
        onConfirm={() => setNotInstalledApp(null)}
        onCancel={() => {
          if (notInstalledInfo) {
            window.open(
              isIOSDevice() ? notInstalledInfo.iosStoreUrl : notInstalledInfo.androidStoreUrl,
              "_blank",
            );
          }
          setNotInstalledApp(null);
        }}
      />
    </>
  );
}
