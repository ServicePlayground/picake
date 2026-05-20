"use client";

import { BottomSheet } from "@/apps/web-user/common/components/bottom-sheets/BottomSheet";
import { BottomSheetOptionList } from "./BottomSheetOptionList";

interface StoreInquiryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  kakaoChannelUrl?: string | null;
  instagramUrl?: string | null;
  phoneNumber?: string | null;
}

export function StoreInquiryBottomSheet({
  isOpen,
  onClose,
  kakaoChannelUrl,
  instagramUrl,
  phoneNumber,
}: StoreInquiryBottomSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="스토어 문의"
      footerShadow={false}
      footer={
        <div className="px-5 py-4">
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
      <BottomSheetOptionList
        items={[
          {
            icon: { type: "image", src: "/images/contents/talk_kakao.png", alt: "카카오 채널" },
            label: "카카오톡 채널",
            onClick: () => {
              if (kakaoChannelUrl) {
                window.open(kakaoChannelUrl, "_blank");
                onClose();
              }
            },
            disabled: !kakaoChannelUrl,
          },
          {
            icon: { type: "image", src: "/images/contents/talk_insta.png", alt: "인스타그램" },
            label: "인스타그램",
            onClick: () => {
              if (instagramUrl) {
                window.open(instagramUrl, "_blank");
                onClose();
              }
            },
            disabled: !instagramUrl,
          },
          {
            icon: { type: "image", src: "/images/contents/talk_phone.png", alt: "전화 문의" },
            label: "전화 문의",
            onClick: () => {
              if (phoneNumber) {
                window.location.href = `tel:${phoneNumber.replace(/[^0-9+]/g, "")}`;
                onClose();
              }
            },
            disabled: !phoneNumber,
          },
        ]}
      />
    </BottomSheet>
  );
}
