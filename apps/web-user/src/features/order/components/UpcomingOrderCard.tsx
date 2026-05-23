"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { useMyOrders } from "@/apps/web-user/features/order/hooks/queries/useMyOrders";
import { OrderStatus } from "@/apps/web-user/features/order/types/order.type";
import { Icon } from "@/apps/web-user/common/components/icons";
import { PaymentPendingCard } from "./PaymentPendingCard";
import { ConfirmedOrderCard } from "./ConfirmedOrderCard";

function UpcomingOrderCardSkeleton() {
  return (
    <div className="mb-4 px-5">
      <div className="rounded-xl border border-gray-100 p-[18px] animate-pulse">
        <div className="h-4 w-40 bg-gray-100 rounded mb-4" />
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="h-4 w-10 bg-gray-100 rounded" />
          <div className="h-4 w-48 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-3 mb-3.5">
          <div className="w-[64px] h-[64px] rounded-lg bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3.5 w-24 bg-gray-100 rounded" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
            <div className="h-3.5 w-28 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-[32px] bg-gray-100 rounded-lg" />
          <div className="flex-1 h-[32px] bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

const MAX_VISIBLE_CARDS = 3;

export function UpcomingOrderCard() {
  const router = useRouter();
  const { data, isLoading } = useMyOrders({ type: "UPCOMING" });
  const hasPeeked = useRef(false);
  const hasNavigated = useRef(false);

  if (isLoading) return <UpcomingOrderCardSkeleton />;

  const HIDDEN_STATUSES: string[] = [
    OrderStatus.RESERVATION_REQUESTED,
    OrderStatus.PAYMENT_COMPLETED,
    OrderStatus.CANCEL_COMPLETED,
    OrderStatus.CANCEL_REFUND_PENDING,
    OrderStatus.CANCEL_REFUND_COMPLETED,
    OrderStatus.NO_SHOW,
    OrderStatus.PICKUP_COMPLETED,
  ];
  const orders = data?.pages
    .flatMap((p) => p.data)
    .filter((o) => !HIDDEN_STATUSES.includes(o.orderStatus))
    .sort((a, b) => {
      const aIsPending = a.orderStatus === OrderStatus.PAYMENT_PENDING ? 0 : 1;
      const bIsPending = b.orderStatus === OrderStatus.PAYMENT_PENDING ? 0 : 1;
      return aIsPending - bIsPending;
    });
  if (!orders || orders.length === 0) return null;

  const hasMore = orders.length > MAX_VISIBLE_CARDS;
  const visibleOrders = hasMore ? orders.slice(0, MAX_VISIBLE_CARDS) : orders;

  const handleSwiperInit = (swiper: SwiperType) => {
    if (visibleOrders.length > 1 && !hasPeeked.current) {
      hasPeeked.current = true;
      const wrapper = swiper.wrapperEl;
      if (!wrapper) return;

      let cancelled = false;
      const cancelPeek = () => {
        cancelled = true;
        wrapper.style.transition = "";
        wrapper.style.transform = "";
        swiper.allowTouchMove = true;
        wrapper.removeEventListener("touchstart", cancelPeek);
        wrapper.removeEventListener("pointerdown", cancelPeek);
      };

      wrapper.addEventListener("touchstart", cancelPeek, { once: true });
      wrapper.addEventListener("pointerdown", cancelPeek, { once: true });
      swiper.allowTouchMove = false;

      setTimeout(() => {
        if (cancelled) return;
        wrapper.style.transition = "transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)";
        wrapper.style.transform = "translate3d(-15px, 0, 0)";
        setTimeout(() => {
          if (cancelled) return;
          wrapper.style.transition = "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)";
          wrapper.style.transform = "translate3d(0, 0, 0)";
          setTimeout(() => {
            if (cancelled) return;
            wrapper.style.transition = "";
            swiper.allowTouchMove = true;
            wrapper.removeEventListener("touchstart", cancelPeek);
            wrapper.removeEventListener("pointerdown", cancelPeek);
          }, 600);
        }, 350);
      }, 500);
    }
  };

  const renderCard = (order: (typeof orders)[number]) =>
    order.orderStatus === OrderStatus.PAYMENT_PENDING ? (
      <PaymentPendingCard order={order} />
    ) : (
      <ConfirmedOrderCard order={order} />
    );

  if (visibleOrders.length === 1 && !hasMore) {
    return <div className="mb-4 px-5">{renderCard(visibleOrders[0])}</div>;
  }

  return (
    <div className="mb-4 pl-5">
      <Swiper
        slidesPerView="auto"
        spaceBetween={10}
        slidesOffsetAfter={20}
        className="!overflow-visible"
        onAfterInit={handleSwiperInit}
        onTouchEnd={(swiper) => {
          if (!hasMore || hasNavigated.current) return;
          // 손가락 이동 거리가 아니라, 콘텐츠가 끝 위치 너머로 실제로 밀린 거리(overscroll) 기준
          const overshoot = swiper.maxTranslate() - swiper.translate;
          if (!(swiper.isEnd && overshoot > 80)) return;
          hasNavigated.current = true;

          const wrapper = swiper.wrapperEl;
          if (!wrapper) {
            router.push("/mypage/order");
            return;
          }
          swiper.allowTouchMove = false;
          // maxTranslate()는 "모두보기" 영역까지 스크롤된 끝 위치 →
          // 마지막 카드가 정렬되는 위치(slidesGrid 마지막 값)로 복귀시킴
          const lastIndex = swiper.slides.length - 1;
          const rest =
            lastIndex >= 0 && swiper.slidesGrid[lastIndex] != null
              ? -swiper.slidesGrid[lastIndex]
              : swiper.maxTranslate();

          // swiper 기본 스냅 대신, 당겨진 위치에서 spring으로 튕겨 마지막 카드로 복귀 후 이동
          setTimeout(() => {
            const transformStr = getComputedStyle(wrapper).transform;
            const currentX =
              transformStr && transformStr !== "none"
                ? new DOMMatrixReadOnly(transformStr).m41
                : rest - 14;
            // 현재(당겨진) 위치에 고정 후 reflow → spring 이징으로 제자리 복귀
            wrapper.style.transition = "none";
            wrapper.style.transform = `translate3d(${currentX}px, 0, 0)`;
            void wrapper.offsetWidth;
            wrapper.style.transition = "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)";
            wrapper.style.transform = `translate3d(${rest}px, 0, 0)`;
            setTimeout(() => router.push("/mypage/order"), 600);
          }, 0);
        }}
      >
        {visibleOrders.map((order, index) => (
          <SwiperSlide
            key={order.id}
            style={{
              width: "min(calc(100vw - 40px), 600px)",
              ...(index === visibleOrders.length - 1 && hasMore ? { overflow: "visible" } : {}),
            }}
          >
            <div className="relative">
              {renderCard(order)}
              {index === visibleOrders.length - 1 && hasMore && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-[10px] flex flex-col items-center gap-2 w-[100px]">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-300">
                    <Icon name="cardMore" width={20} height={20} className="text-gray-400" />
                  </span>
                  <span className="text-2sm text-gray-500">모두보기</span>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
