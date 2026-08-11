"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customOrderApi } from "@/apps/web-user/features/custom-order/apis/custom-order.api";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";
import { PATHS } from "@/apps/web-user/common/constants/paths.constant";
import type { CustomOrderRequestStatus } from "@/apps/web-user/features/custom-order/types/custom-order.type";

interface Props {
  requestId: string;
}

const STATUS_STYLE: Record<CustomOrderRequestStatus, { label: string; className: string }> = {
  REQUESTED: { label: "견적 대기중", className: "bg-gray-50 text-gray-500" },
  QUOTED: { label: "견적 도착", className: "bg-green-50 text-green-400" },
  ACCEPTED: { label: "주문 확정", className: "bg-primary-50 text-primary" },
  DECLINED: { label: "거절함", className: "bg-gray-50 text-gray-400" },
  CANCELLED: { label: "취소됨", className: "bg-gray-50 text-gray-400" },
};

function formatPickupDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** 채팅 타임라인의 맞춤 주문 요청/견적 카드 (구매자용) */
export const CustomOrderRequestCard: React.FC<Props> = ({ requestId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAlert } = useAlertStore();

  const { data: request, isLoading } = useQuery({
    queryKey: ["custom-order-request", requestId],
    queryFn: () => customOrderApi.getById(requestId),
  });

  const acceptMutation = useMutation({
    mutationFn: () => customOrderApi.accept(requestId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["custom-order-request", requestId] });
      router.push(PATHS.ORDER.DETAIL(data.orderId));
    },
    onError: (error) => {
      showAlert({ type: "error", title: "오류", message: getApiMessage.error(error) });
    },
  });

  const declineMutation = useMutation({
    mutationFn: () => customOrderApi.decline(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-order-request", requestId] });
    },
    onError: (error) => {
      showAlert({ type: "error", title: "오류", message: getApiMessage.error(error) });
    },
  });

  if (isLoading || !request) {
    return (
      <div className="rounded-lg border border-gray-100 px-[14px] py-[12px] text-sm text-gray-300">
        맞춤 주문 요청을 불러오는 중…
      </div>
    );
  }

  const budgetText =
    request.desiredBudgetMin || request.desiredBudgetMax
      ? `예산 ${(request.desiredBudgetMin ?? 0).toLocaleString()}~${(request.desiredBudgetMax ?? 0).toLocaleString()}원`
      : null;
  const isQuoted = request.status === "QUOTED" && request.quotedPrice !== null;
  const statusStyle = STATUS_STYLE[request.status];

  return (
    <div
      className={`max-w-[85%] rounded-lg border bg-white p-[14px] ${
        isQuoted ? "border-green-200" : "border-gray-100"
      }`}
    >
      <div className="mb-[10px] flex items-center justify-between gap-[8px]">
        <span className="text-sm font-bold text-gray-900">맞춤 주문 요청</span>
        <span className={`rounded-full px-[8px] py-[2px] text-xs font-bold ${statusStyle.className}`}>
          {statusStyle.label}
        </span>
      </div>

      {request.images.length > 0 && (
        <div className="mb-[10px] flex gap-[6px]">
          {request.images.slice(0, 3).map((url) => (
            <img
              key={url}
              src={url}
              alt="요청 참고 이미지"
              className="h-[56px] w-[56px] rounded-lg border border-gray-100 object-cover"
            />
          ))}
        </div>
      )}

      <p className="text-sm text-gray-900">{request.requirementsText}</p>
      <p className="mt-[6px] text-xs text-gray-400">
        {[
          `수량 ${request.quantity}개`,
          budgetText,
          `${formatPickupDateTime(request.desiredDate)} 픽업 희망`,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>

      {isQuoted && (
        <div className="mt-[12px] border-t border-gray-100 pt-[12px]">
          <p className="text-xl font-bold text-gray-900">
            {request.quotedPrice?.toLocaleString()}원
          </p>
          {request.sellerNote && (
            <p className="mt-[2px] text-xs text-gray-400">{request.sellerNote}</p>
          )}
          <div className="mt-[12px] flex gap-[6px]">
            <button
              type="button"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="h-[40px] flex-1 rounded-lg bg-primary text-sm font-bold text-white disabled:opacity-50"
            >
              {acceptMutation.isPending ? "처리 중…" : "승인하기"}
            </button>
            <button
              type="button"
              onClick={() => declineMutation.mutate()}
              disabled={declineMutation.isPending}
              className="h-[40px] flex-1 rounded-lg border border-gray-100 bg-white text-sm font-bold text-gray-900 disabled:opacity-50"
            >
              거절
            </button>
          </div>
          <p className="mt-[8px] text-xs text-gray-400">
            승인하면 입금 안내를 알림톡으로 보내드려요.
          </p>
        </div>
      )}

      {request.status === "ACCEPTED" && (
        <p className="mt-[8px] text-xs text-gray-400">
          주문이 확정됐어요. 입금 안내는 알림톡을 확인해주세요.
        </p>
      )}
    </div>
  );
};
