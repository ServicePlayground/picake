import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customOrderApi } from "@/apps/web-seller/features/custom-order/apis/custom-order.api";
import { BaseButton as Button } from "@/apps/web-seller/common/components/buttons/BaseButton";
import { NumberInput } from "@/apps/web-seller/common/components/inputs/NumberInput";
import { Input } from "@/apps/web-seller/common/components/inputs/Input";
import { Badge } from "@/apps/web-seller/common/components/badges/Badge";
import { useAlertStore } from "@/apps/web-seller/common/store/alert.store";
import getApiMessage from "@/apps/web-seller/common/utils/getApiMessage";

interface Props {
  requestId: string;
}

/** 희망 픽업 일시를 "8/15(금) 오후 2:00" 형태로 */
function formatPickupDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "견적 대기중",
  QUOTED: "견적 보냄",
  ACCEPTED: "주문 확정",
  DECLINED: "거절됨",
  CANCELLED: "취소됨",
};

/**
 * 채팅 타임라인의 맞춤 주문 요청/견적 카드 (판매자용)
 * REQUESTED 상태에서만 견적을 입력할 수 있습니다(견적 1회 원칙).
 */
export const CustomOrderRequestCard: React.FC<Props> = ({ requestId }) => {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();
  const [quotedPrice, setQuotedPrice] = useState<number | undefined>();
  const [sellerNote, setSellerNote] = useState("");

  const { data: request, isLoading } = useQuery({
    queryKey: ["custom-order-request", requestId],
    queryFn: () => customOrderApi.getById(requestId),
  });

  const quoteMutation = useMutation({
    mutationFn: () =>
      customOrderApi.quote(requestId, { quotedPrice: quotedPrice ?? 0, sellerNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-order-request", requestId] });
      addAlert({ severity: "success", message: "견적을 보냈습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
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

  return (
    <div className="max-w-[420px] rounded-lg border border-primary/40 bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">맞춤 주문 요청</span>
        <Badge variant={request.status === "QUOTED" ? "default" : "secondary"}>
          {STATUS_LABEL[request.status] ?? request.status}
        </Badge>
      </div>

      {request.images.length > 0 && (
        <div className="mb-2 flex gap-1.5">
          {request.images.slice(0, 4).map((url) => (
            <img
              key={url}
              src={url}
              alt="요청 참고 이미지"
              className="h-14 w-14 rounded object-cover"
            />
          ))}
        </div>
      )}

      <p className="text-sm">{request.requirementsText}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {[
          `수량 ${request.quantity}개`,
          budgetText,
          `픽업 희망 ${formatPickupDateTime(request.desiredDate)}`,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>

      {request.status === "REQUESTED" ? (
        <div className="mt-3 space-y-2 border-t pt-3">
          <span className="text-xs font-bold">견적 제시</span>
          <NumberInput
            value={quotedPrice}
            onChange={setQuotedPrice}
            placeholder="견적가 (원)"
            min={0}
          />
          <Input
            value={sellerNote}
            onChange={(e) => setSellerNote(e.target.value)}
            placeholder="코멘트 (선택) · 예: 사이즈 1호 기준입니다"
          />
          <Button
            className="w-full"
            size="sm"
            disabled={!quotedPrice || quoteMutation.isPending}
            onClick={() => quoteMutation.mutate()}
          >
            {quoteMutation.isPending ? "보내는 중…" : "견적 보내기"}
          </Button>
          <p className="text-[11px] text-muted-foreground">
            견적은 한 번만 보낼 수 있어요. 조율이 필요하면 채팅으로 먼저 이야기해보세요.
          </p>
        </div>
      ) : (
        request.quotedPrice !== null && (
          <div className="mt-3 border-t pt-3">
            <p className="text-lg font-bold text-primary">
              {request.quotedPrice.toLocaleString()}원
            </p>
            {request.sellerNote && (
              <p className="mt-0.5 text-xs text-muted-foreground">{request.sellerNote}</p>
            )}
          </div>
        )
      )}
    </div>
  );
};
