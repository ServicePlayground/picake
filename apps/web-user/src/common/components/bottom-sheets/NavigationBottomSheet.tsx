"use client";

import { BottomSheet } from "@/apps/web-user/common/components/bottom-sheets/BottomSheet";
import { BottomSheetOptionList } from "./BottomSheetOptionList";

interface NavigationBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  storeName: string;
}

function openKakaoNavigation(lat: number, lng: number, name: string) {
  const encodedName = encodeURIComponent(name);
  window.open(`https://map.kakao.com/link/to/${encodedName},${lat},${lng}`, "_blank");
}

function openNaverNavigation(lat: number, lng: number, name: string) {
  const encodedName = encodeURIComponent(name);
  window.open(
    `https://map.naver.com/p/directions/-/${lng},${lat},${encodedName},,PLACE_POI/-/transit`,
    "_blank",
  );
}

function openAppleNavigation(lat: number, lng: number, name: string) {
  const encodedName = encodeURIComponent(name);
  window.open(`https://maps.apple.com/?daddr=${lat},${lng}&q=${encodedName}`, "_blank");
}

export function NavigationBottomSheet({
  isOpen,
  onClose,
  latitude,
  longitude,
  storeName,
}: NavigationBottomSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="길찾기"
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
      <BottomSheetOptionList
        items={[
          {
            icon: { type: "image", src: "/images/contents/map_naver.png", alt: "네이버 지도" },
            label: "네이버 지도",
            onClick: () => {
              openNaverNavigation(latitude, longitude, storeName);
              onClose();
            },
          },
          {
            icon: { type: "image", src: "/images/contents/map_kakao.png", alt: "카카오 지도" },
            label: "카카오 지도",
            onClick: () => {
              openKakaoNavigation(latitude, longitude, storeName);
              onClose();
            },
          },
          {
            icon: {
              type: "element",
              element: (
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"
                      fill="white"
                    />
                    <circle cx="12" cy="9" r="2.5" fill="black" />
                  </svg>
                </div>
              ),
            },
            label: "Apple 지도",
            onClick: () => {
              openAppleNavigation(latitude, longitude, storeName);
              onClose();
            },
          },
        ]}
      />
    </BottomSheet>
  );
}
