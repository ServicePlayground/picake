"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "@/apps/web-user/common/components/bottom-sheets/BottomSheet";
import { Modal } from "@/apps/web-user/common/components/modals/Modal";
import { BottomSheetOptionList } from "./BottomSheetOptionList";
import { APP_ONLY_MODAL } from "@/apps/web-user/common/constants/messages.constant";
import { trackEvent } from "@/apps/web-user/common/utils/analytics.util";

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

interface EasyPaymentBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** 입금하려는 예약 고유 식별자 (애널리틱스용) */
  reservationId: string;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  amount: number;
}

export function EasyPaymentBottomSheet({
  isOpen,
  onClose,
  reservationId,
  bankAccountNumber,
  bankName,
  amount,
}: EasyPaymentBottomSheetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 간편 입금하기 바텀시트 노출
  useEffect(() => {
    if (isOpen) {
      trackEvent("view_easy_payment_option", { reservation_id: reservationId });
    }
  }, [isOpen, reservationId]);

  const handleDeepLink = (url: string) => {
    if (!isMobileDevice()) {
      setIsModalOpen(true);
      return;
    }
    window.open(url, "_blank");
    onClose();
  };

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
              onClick: () => {
                trackEvent("engage_easy_payment_option", {
                  reservation_id: reservationId,
                  payment_method: "toss",
                });
                handleDeepLink(
                  `supertoss://send?bank=${bankName}&accountNo=${bankAccountNumber}&amount=${amount}`,
                );
              },
            },
            {
              icon: { type: "image", src: "/images/contents/kakao.png", alt: "카카오페이" },
              label: "카카오페이",
              onClick: () => {
                trackEvent("engage_easy_payment_option", {
                  reservation_id: reservationId,
                  payment_method: "kakao",
                });
                handleDeepLink("kakaotalk://kakaopay/money/to");
              },
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
    </>
  );
}
