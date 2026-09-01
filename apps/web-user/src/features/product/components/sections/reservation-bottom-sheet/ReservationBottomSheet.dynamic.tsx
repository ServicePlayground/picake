"use client";

import dynamic from "next/dynamic";

const loadReservationBottomSheet = () =>
  import("./ReservationBottomSheet").then((module) => ({
    default: module.ReservationBottomSheet,
  }));

export const ReservationBottomSheet = dynamic(loadReservationBottomSheet, {
  ssr: false,
  /**
   * 청크 도착 전에는 아무것도 그리지 않는다(기존 UI 변화 없음).
   * preload로 대부분 미리 받아두므로 실제로 노출될 일은 거의 없다.
   */
  loading: () => null,
});

/**
 * 예약 시트 청크를 미리 받아둡니다.
 *
 * 시트를 `isOpen`과 무관하게 항상 마운트하면 상품 상세 진입만으로 청크가 즉시 내려와
 * (실측: 프로덕션 gzip 24KB) 이미지·LCP와 대역폭을 나눠 씁니다.
 * 그래서 마운트는 열릴 때만 하고, 청크는 idle 시점이나 버튼 hover/touch 시점에 미리 받습니다.
 */
export function preloadReservationBottomSheet() {
  void loadReservationBottomSheet();
}
