"use client";

import { useState } from "react";
import Link from "next/link";
import {
  OrderItemResponse,
  OrderResponse,
  OrderStatus,
  OrderMyReviewUiStatus,
} from "@/apps/web-user/features/order/types/order.type";
import { NavigationBottomSheet } from "@/apps/web-user/common/components/bottom-sheets/NavigationBottomSheet";
import { StoreInquiryBottomSheet } from "@/apps/web-user/common/components/bottom-sheets/StoreInquiryBottomSheet";
import { Toast } from "@/apps/web-user/common/components/toast/Toast";
import { ReservationInfoSection } from "./ReservationInfoSection";
import { PaymentInfoSection } from "./PaymentInfoSection";
import { ReservationItemsSection } from "./ReservationItemsSection";
import { NoticeSection } from "./NoticeSection";
import { PaymentPendingCountdownHeader } from "./PaymentPendingCountdownHeader";
import { PickupDateChangeBottomSheet } from "./PickupDateChangeBottomSheet";
import { OptionChangeBottomSheet } from "./OptionChangeBottomSheet";
import { InfoNotice } from "@/apps/web-user/common/components/notice/InfoNotice";
import { Button } from "@/apps/web-user/common/components/buttons/Button";
import { PATHS } from "@/apps/web-user/common/constants/paths.constant";
import { useStoreDetail } from "@/apps/web-user/features/store/hooks/queries/useStoreDetail";

function getStatusNotice(order: OrderResponse): {
  message: string;
  description?: string;
  isRed: boolean;
} | null {
  switch (order.orderStatus) {
    case OrderStatus.PAYMENT_COMPLETED:
      return { message: "판매자의 입금 확인 후 예약이 확정됩니다.", isRed: false };
    case OrderStatus.CANCEL_REFUND_PENDING:
      return { message: "환불까지 영업일 기준 1-2일 소요될 수 있습니다.", isRed: false };
    case OrderStatus.CANCEL_REFUND_COMPLETED:
      return { message: "환불 완료된 취소 건입니다.", isRed: false };
    // 취소완료: 판매자 취소(사유 표시) / 구매자 취소(표시 안 함) / 미입금 자동취소 구분
    case OrderStatus.CANCEL_COMPLETED:
      if (order.sellerCancelReason) {
        return {
          message: "판매자 요청으로 예약 취소되었습니다.",
          description: order.sellerCancelReason,
          isRed: false,
        };
      }
      // 구매자 취소는 안내 없음
      if (order.userCancelReason) return null;
      // 사유 없음 = 미입금으로 인한 자동취소
      return { message: "미입금으로 인해 예약 취소되었습니다.", isRed: false };
    case OrderStatus.NO_SHOW:
      return {
        message: "노쇼 처리된 예약입니다.",
        description: order.sellerNoShowReason ?? undefined,
        isRed: true,
      };
    default:
      return null;
  }
}

interface OrderDetailViewProps {
  order: OrderResponse;
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  // 픽업 날짜 변경 바텀시트의 캘린더 휴무일/영업시간 적용용
  const { data: storeDetail } = useStoreDetail(order.storeId);
  const [isMapSheetOpen, setIsMapSheetOpen] = useState(false);
  const [isInquirySheetOpen, setIsInquirySheetOpen] = useState(false);
  const [isPickupDateSheetOpen, setIsPickupDateSheetOpen] = useState(false);
  const [showPickupDateUpdatedToast, setShowPickupDateUpdatedToast] = useState(false);
  const [optionEditTargetItem, setOptionEditTargetItem] = useState<OrderItemResponse | null>(null);
  const [showOptionUpdatedToast, setShowOptionUpdatedToast] = useState(false);

  const isPaymentPending = order.orderStatus === OrderStatus.PAYMENT_PENDING;
  const canWriteReview = order.myReviewUiStatus === OrderMyReviewUiStatus.WRITABLE;

  return (
    <div className={`pt-5 ${canWriteReview ? "pb-[92px]" : ""}`}>
      {/* 입금대기: 상단 카운트다운 + 결제정보 → 예약정보 순서 */}
      {isPaymentPending && (
        <div className="-mt-5 mb-3">
          <PaymentPendingCountdownHeader order={order} />
        </div>
      )}
      {(() => {
        const notice = getStatusNotice(order);
        if (!notice) return null;
        return (
          <div className="px-5 py-4">
            <InfoNotice
              tone={notice.isRed ? "red" : "gray"}
              message={notice.message}
              description={notice.description}
            />
          </div>
        );
      })()}
      <div className="flex flex-col gap-10">
        {isPaymentPending ? (
          <div className="flex flex-col gap-10">
            <PaymentInfoSection order={order} />
            <ReservationInfoSection
              order={order}
              onInquiryClick={() => setIsInquirySheetOpen(true)}
              onMapClick={() => setIsMapSheetOpen(true)}
              onChangePickupDate={() => setIsPickupDateSheetOpen(true)}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <ReservationInfoSection
              order={order}
              onInquiryClick={() => setIsInquirySheetOpen(true)}
              onMapClick={() => setIsMapSheetOpen(true)}
              onChangePickupDate={() => setIsPickupDateSheetOpen(true)}
            />
            <PaymentInfoSection order={order} />
          </div>
        )}

        <ReservationItemsSection
          order={order}
          onChangeOptions={(item) => setOptionEditTargetItem(item)}
        />
        <NoticeSection refundCancellationPolicy={order.storeRefundCancellationPolicy} />

        <NavigationBottomSheet
          isOpen={isMapSheetOpen}
          onClose={() => setIsMapSheetOpen(false)}
          latitude={order.pickupLatitude}
          longitude={order.pickupLongitude}
          storeName={order.storeName}
        />
        <StoreInquiryBottomSheet
          isOpen={isInquirySheetOpen}
          onClose={() => setIsInquirySheetOpen(false)}
          kakaoChannelUrl={null}
          instagramUrl={null}
          phoneNumber={storeDetail?.phoneNumber}
        />
        <PickupDateChangeBottomSheet
          isOpen={isPickupDateSheetOpen}
          onClose={() => setIsPickupDateSheetOpen(false)}
          orderId={order.id}
          initialPickupDate={order.pickupDate}
          onSuccess={() => setShowPickupDateUpdatedToast(true)}
          businessCalendar={storeDetail?.businessCalendar}
        />
        <OptionChangeBottomSheet
          isOpen={optionEditTargetItem !== null}
          onClose={() => setOptionEditTargetItem(null)}
          order={order}
          item={optionEditTargetItem}
          onSuccess={() => setShowOptionUpdatedToast(true)}
        />
      </div>

      {canWriteReview && (
        <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[638px] bg-white px-5 py-2.5 shadow-[0_12px_48px_-12px_rgba(0,0,0,0.16)]">
          <Link href={PATHS.REVIEW_WRITE(order.id)}>
            <Button variant="outline">후기 작성</Button>
          </Link>
        </div>
      )}

      {showPickupDateUpdatedToast && (
        <Toast
          message="날짜 변경 완료"
          iconName="checkCircle"
          iconClassName="text-green-400"
          variant="column"
          position="center"
          duration={2000}
          onClose={() => setShowPickupDateUpdatedToast(false)}
        />
      )}

      {showOptionUpdatedToast && (
        <Toast
          message="옵션 변경 완료"
          iconName="checkCircle"
          iconClassName="text-green-400"
          variant="column"
          position="center"
          duration={2000}
          onClose={() => setShowOptionUpdatedToast(false)}
        />
      )}
    </div>
  );
}
