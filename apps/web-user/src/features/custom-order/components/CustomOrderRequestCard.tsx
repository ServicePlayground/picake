"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customOrderApi } from "@/apps/web-user/features/custom-order/apis/custom-order.api";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";

interface Props {
  requestId: string;
}

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "견적 대기중",
  QUOTED: "견적 도착",
  ACCEPTED: "주문 확정",
  DECLINED: "거절함",
  CANCELLED: "취소됨",
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
      router.push(`/orders/${data.orderId}`);
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
      <div className="rounded-lg border border-input p-3 text-sm text-muted-foreground">
        맞춤 주문 요청을 불러오는 중…
      </div>
    );
  }

  const budgetText =
    request.desiredBudgetMin || request.desiredBudgetMax
      ? `예산 ${(request.desiredBudgetMin ?? 0).toLocaleString()}~${(request.desiredBudgetMax ?? 0).toLocaleString()}원`
      : null;
  const isQuoted = request.status === "QUOTED" && request.quotedPrice !== null;

  return (
    <div
      className={`max-w-[85%] rounded-xl border bg-card p-3 shadow-sm ${
        isQuoted ? "border-emerald-500" : "border-primary/40"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">맞춤 주문 요청</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
            isQuoted ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"
          }`}
        >
          {STATUS_LABEL[request.status] ?? request.status}
        </span>
      </div>

      {request.images.length > 0 && (
        <div className="mb-2 flex gap-1.5">
          {request.images.slice(0, 4).map((url) => (
            <img
              key={url}
              src={url}
              alt="요청 참고 이미지"
              className="h-12 w-12 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      <p className="text-sm">{request.requirementsText}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {[
          `수량 ${request.quantity}개`,
          budgetText,
          `${formatPickupDateTime(request.desiredDate)} 픽업 희망`,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>

      {isQuoted && (
        <div className="mt-3 border-t pt-3">
          <p className="text-xl font-bold text-emerald-700">
            {request.quotedPrice?.toLocaleString()}원
          </p>
          {request.sellerNote && (
            <p className="mt-0.5 text-xs text-muted-foreground">{request.sellerNote}</p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {acceptMutation.isPending ? "처리 중…" : "승인하기"}
            </button>
            <button
              type="button"
              onClick={() => declineMutation.mutate()}
              disabled={declineMutation.isPending}
              className="flex-1 rounded-lg border border-input py-2 text-sm font-medium text-muted-foreground disabled:opacity-50"
            >
              거절
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            승인하면 입금 안내를 알림톡으로 보내드려요.
          </p>
        </div>
      )}

      {request.status === "ACCEPTED" && (
        <p className="mt-2 text-xs text-muted-foreground">
          주문이 확정됐어요. 입금 안내는 알림톡을 확인해주세요.
        </p>
      )}
    </div>
  );
};
