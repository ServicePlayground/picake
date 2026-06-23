"use client";

import { useState } from "react";
import { Toast } from "@/apps/web-user/common/components/toast/Toast";
import { useAuthStore } from "@/apps/web-user/common/store/auth.store";
import { useLoginSheetStore } from "@/apps/web-user/common/store/login-sheet.store";
import { useRequestStoreEntry } from "@/apps/web-user/features/store/hooks/mutations/useRequestStoreEntry";
import { useStoreEntryRequestExists } from "@/apps/web-user/features/store/hooks/queries/useStoreEntryRequestExists";

/** 지도에서 클릭한 미입점 스토어(카카오 장소) */
export interface MapUnenteredStore {
  kakaoPlaceId: string;
  name: string;
  address?: string;
  roadAddress?: string;
  phone?: string;
  categoryName?: string;
  placeUrl?: string;
  latitude: number;
  longitude: number;
}

interface MapUnenteredStoreCardProps {
  store: MapUnenteredStore;
}

/** 미입점 스토어 마커 클릭 시 하단에 표시되는 입점 요청 카드 */
export function MapUnenteredStoreCard({ store }: MapUnenteredStoreCardProps) {
  const { isAuthenticated } = useAuthStore();
  const openLoginSheet = useLoginSheetStore((s) => s.openLoginSheet);
  const { mutate: requestEntry, isPending } = useRequestStoreEntry();
  const { data: existsData } = useStoreEntryRequestExists(store.kakaoPlaceId, isAuthenticated);

  const [showToast, setShowToast] = useState(false);
  const [requestedLocally, setRequestedLocally] = useState(false);

  const alreadyRequested = requestedLocally || (existsData?.requested ?? false);
  const disabled = isPending || alreadyRequested;

  const handleRequestEntry = () => {
    if (!isAuthenticated) {
      openLoginSheet();
      return;
    }
    if (disabled) return;
    requestEntry(
      {
        kakaoPlaceId: store.kakaoPlaceId,
        placeName: store.name,
        address: store.address,
        roadAddress: store.roadAddress,
        phone: store.phone,
        categoryName: store.categoryName,
        placeUrl: store.placeUrl,
        latitude: store.latitude,
        longitude: store.longitude,
      },
      {
        onSuccess: () => {
          setRequestedLocally(true);
          setShowToast(true);
        },
      },
    );
  };

  const buttonLabel = alreadyRequested ? "입점 요청 완료" : "입점 요청하기";

  return (
    <>
      <div
        className="overflow-hidden"
        style={{
          boxShadow: "0px 4px 16px 0px #00000029",
          background: "#FFFFFF",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div className="flex items-center" style={{ gap: 6, marginBottom: 14 }}>
          <h3
            className="min-w-0 truncate font-bold text-gray-900"
            style={{ fontSize: 16, lineHeight: "140%" }}
          >
            {store.name}
          </h3>
          <span
            className="shrink-0 whitespace-nowrap"
            style={{
              fontWeight: 700,
              fontSize: 11,
              lineHeight: "140%",
              padding: "2px 4px",
              borderRadius: 4,
              background: "#F5F5F5",
              color: "#82817D",
            }}
          >
            미입점
          </span>
        </div>

        <button
          type="button"
          onClick={handleRequestEntry}
          disabled={disabled}
          className={`w-full font-bold text-white ${
            alreadyRequested ? "bg-gray-300" : "bg-primary"
          } ${isPending ? "opacity-60" : ""}`}
          style={{ height: 52, borderRadius: 12, fontSize: 16, lineHeight: "140%" }}
        >
          {buttonLabel}
        </button>
      </div>

      {showToast && (
        <Toast
          message="입점 요청이 접수됐어요!"
          iconName="checkCircle"
          iconClassName="text-green-400"
          variant="row"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
