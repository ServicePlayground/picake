"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "@/apps/web-user/common/components/bottom-sheets/BottomSheet";
import { Button } from "@/apps/web-user/common/components/buttons/Button";
import { Icon } from "@/apps/web-user/common/components/icons";
import { Modal } from "@/apps/web-user/common/components/modals/Modal";
import { Toast } from "@/apps/web-user/common/components/toast/Toast";
import { OrderResponse, OrderStatus } from "@/apps/web-user/features/order/types/order.type";
import { useMyOrders } from "@/apps/web-user/features/order/hooks/queries/useMyOrders";
import { usePaymentComplete } from "@/apps/web-user/features/order/hooks/mutations/usePaymentComplete";
import {
  resolveDeadlineMs,
  usePaymentCountdown,
} from "@/apps/web-user/features/order/hooks/usePaymentCountdown";
import { useMypageProfile } from "@/apps/web-user/features/mypage/hooks/queries/useMypageProfile";
import { isWebViewEnvironment } from "@/apps/web-user/common/utils/webview.bridge";
import { PATHS } from "@/apps/web-user/common/constants/paths.constant";

const STORAGE_KEY = "picake:payment-pending-launch-shown";

// true 면 앱(웹뷰)에서만 노출
const APP_ONLY = true;

function readShownIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeShownIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage 사용 불가 환경은 무시
  }
}

function formatPickupDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dow = dayNames[date.getDay()];
  const hours = date.getHours();
  const period = hours >= 12 ? "오후" : "오전";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}.${mo}.${d}(${dow}) · ${period} ${h12}:${min}`;
}

function LaunchInfoRow({
  label,
  value,
  valueBold,
}: {
  label: string;
  value: string;
  valueBold?: boolean;
}) {
  return (
    <div className="flex items-start gap-10 text-sm">
      <span className="w-[52px] shrink-0 text-gray-500">{label}</span>
      <span className={`flex-1 text-gray-900 ${valueBold ? "font-bold" : ""}`}>{value}</span>
    </div>
  );
}

function LaunchSheetView({
  order,
  onClose,
  onPaid,
}: {
  order: OrderResponse;
  onClose: () => void;
  onPaid: () => void;
}) {
  const router = useRouter();
  const countdown = usePaymentCountdown(order);
  const { data: profile } = useMypageProfile();
  const { mutate: paymentComplete, isPending } = usePaymentComplete();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const extraCount = order.orderItems.length - 1;
  const productLabel = extraCount > 0 ? `${order.productName} 외 ${extraCount}` : order.productName;

  const handleGoPay = () => {
    onClose();
    router.push(PATHS.ORDER.DETAIL(order.id));
  };

  const handlePaymentComplete = () => {
    if (isPending) return;
    setIsConfirmOpen(false);
    // 입금자명: 주문 시 입력한 예약자명 우선, 없으면 프로필 이름
    const depositorName =
      order.reservationContactName?.trim() || profile?.name?.trim() || "";
    paymentComplete({ orderId: order.id, depositorName }, { onSuccess: onPaid });
  };

  return (
    <>
    <BottomSheet
      isOpen
      onClose={onClose}
      title="입금 대기 중인 예약이 있어요"
      footerShadow={false}
      footer={
        <div className="flex flex-col gap-2 px-5 py-4">
          <Button variant="outline" onClick={() => setIsConfirmOpen(true)}>
            이미 입금했어요
          </Button>
          <Button variant="primary" onClick={handleGoPay}>
            <span className="inline-flex items-center justify-center gap-1">
              입금하러 가기
              <Icon name="arrow" width={20} height={20} className="rotate-90" />
            </span>
          </Button>
        </div>
      }
    >
      <div className="px-5 py-8 flex flex-col items-center">
        {/* 입금 마감 카운트다운 말풍선 */}
        <div className="relative mb-[30px]">
          <div className="px-3 py-1 bg-blue-50 rounded-lg">
            <span className="text-2xl font-bold tabular-nums text-blue-400">{countdown.text}</span>
          </div>
          <span className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[14px] border-l-transparent border-r-transparent border-t-blue-50" />
        </div>

        {/* 예약 정보 */}
        <div className="w-full rounded-lg border border-gray-50 px-5 py-4 flex flex-col gap-2">
          <LaunchInfoRow label="픽업장소" value={order.storeName} />
          <LaunchInfoRow label="픽업날짜" value={formatPickupDate(order.pickupDate)} />
          <LaunchInfoRow label="예약상품" value={productLabel} />
          <LaunchInfoRow
            label="총 금액"
            value={`${order.totalPrice.toLocaleString()}원`}
            valueBold
          />
        </div>
      </div>
    </BottomSheet>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="입금 완료하셨나요?"
        description={
          <>
            입금 완료 버튼을 누르면
            <br />
            판매자에게 확인 알림이 전달되며,
            <br />
            <span className="text-primary font-bold">입금 확인 후 예약이 확정</span>됩니다.
          </>
        }
        confirmText="취소"
        confirmVariant="outline"
        cancelText="입금 완료"
        cancelVariant="primary"
        onConfirm={() => setIsConfirmOpen(false)}
        onCancel={handlePaymentComplete}
      />
    </>
  );
}

/**
 * 앱(웹뷰) 콜드 스타트 시, 입금대기 중인 예약이 있으면 1회 안내 바텀시트를 노출한다.
 *
 * - 앱(웹뷰) 환경에서만 동작
 * - 입금대기가 여러 건이면 마감까지 시간이 가장 적게 남은 예약부터 노출
 * - 노출한 예약 id는 localStorage에 기록 → 다음 콜드 스타트엔 그 다음으로 적게 남은 예약 노출
 * - 모든 입금대기 예약을 노출한 뒤에는 더 띄우지 않음
 */
export function PaymentPendingLaunchSheet() {
  const { data, isLoading } = useMyOrders({ type: "UPCOMING" });
  const [targetOrder, setTargetOrder] = useState<OrderResponse | null>(null);
  const [showPaidToast, setShowPaidToast] = useState(false);
  const decidedRef = useRef(false);

  useEffect(() => {
    if (decidedRef.current) return;
    // 앱(웹뷰)에서만 동작 (APP_ONLY=false 인 동안은 웹에서도 노출 — 테스트용)
    if (APP_ONLY && !isWebViewEnvironment()) {
      decidedRef.current = true;
      return;
    }
    if (isLoading || !data) return;
    decidedRef.current = true;

    const now = Date.now();
    const pending = data.pages
      .flatMap((page) => page.data)
      .filter((order) => order.orderStatus === OrderStatus.PAYMENT_PENDING)
      .map((order) => ({ order, deadline: resolveDeadlineMs(order) }))
      .filter(
        (entry): entry is { order: OrderResponse; deadline: number } =>
          entry.deadline != null && entry.deadline > now,
      )
      .sort((a, b) => a.deadline - b.deadline);

    if (pending.length === 0) return;

    const shownIds = readShownIds();
    const next = pending.find((entry) => !shownIds.includes(entry.order.id));
    // 모든 입금대기 예약을 이미 노출함 → 더 띄우지 않음
    if (!next) return;

    setTargetOrder(next.order);

    // 더 이상 입금대기가 아닌 stale id는 정리하고, 이번 노출분을 기록
    const pendingIds = pending.map((entry) => entry.order.id);
    writeShownIds([...shownIds.filter((id) => pendingIds.includes(id)), next.order.id]);
  }, [isLoading, data]);

  return (
    <>
      {targetOrder && (
        <LaunchSheetView
          order={targetOrder}
          onClose={() => setTargetOrder(null)}
          onPaid={() => {
            setTargetOrder(null);
            setShowPaidToast(true);
          }}
        />
      )}
      {showPaidToast && (
        <Toast
          message="입금 확인 후 예약이 확정됩니다."
          iconName="checkCircle"
          iconClassName="text-green-400"
          duration={3000}
          onClose={() => setShowPaidToast(false)}
        />
      )}
    </>
  );
}
