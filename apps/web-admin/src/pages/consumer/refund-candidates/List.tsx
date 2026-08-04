import React, { useEffect, useState } from "react";
import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import { Card } from "@/apps/web-admin/common/components/cards/Card";
import { EmptyState } from "@/apps/web-admin/common/components/fallbacks/EmptyState";
import { BaseInput } from "@/apps/web-admin/common/components/inputs/BaseInput";
import { Label } from "@/apps/web-admin/common/components/labels/Label";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/apps/web-admin/common/components/selects/Select";
import {
  LIST_CARD,
  LIST_FILTER_PANEL,
  LIST_SCREEN_HEADING,
  LIST_SECTION_GAP,
  LIST_STATS_TEXT,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { RevertRefundDialog } from "@/apps/web-admin/features/order-management/components/detail/RevertRefundDialog";
import { RefundCandidateTable } from "@/apps/web-admin/features/order-management/components/list/RefundCandidateTable";
import { OrderManagementPagination } from "@/apps/web-admin/features/order-management/components/shared/OrderManagementPagination";
import { REFUND_CANDIDATE_LIST_PAGE_SIZE } from "@/apps/web-admin/features/order-management/constants/orderManagement.constant";
import { useRevertOrderToRefundPending } from "@/apps/web-admin/features/order-management/hooks/mutations/useOrderManagementMutation";
import { useRefundCandidateList } from "@/apps/web-admin/features/order-management/hooks/queries/useOrderManagementQuery";
import type { AdminOrderResponseDto } from "@/apps/web-admin/features/order-management/types/order-management.dto";

type OriginFilter = "ALL" | "PAYMENT_EXPIRED";

/**
 * 환불 누락 관리 화면.
 *
 * 취소완료는 원래 되돌릴 수 없는 종착 상태입니다. 그런데 계좌이체 방식이라 서버는 입금 여부를 알 수 없어,
 * 실제로 입금한 손님이 이 상태에 빠지면 환불받을 방법이 없습니다. 그런 주문을 찾아 환불 처리로
 * 되돌리는 것이 이 화면의 목적입니다.
 */
export const RefundCandidatesListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [origin, setOrigin] = useState<OriginFilter>("ALL");
  const [excludeReverted, setExcludeReverted] = useState(true);
  const [orderNumberInput, setOrderNumberInput] = useState("");
  const [depositorNameInput, setDepositorNameInput] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | undefined>(undefined);
  const [depositorName, setDepositorName] = useState<string | undefined>(undefined);
  const [target, setTarget] = useState<AdminOrderResponseDto | null>(null);

  useEffect(() => {
    setPage(1);
  }, [origin, excludeReverted, orderNumber, depositorName]);

  const { data, isLoading } = useRefundCandidateList({
    page,
    limit: REFUND_CANDIDATE_LIST_PAGE_SIZE,
    onlyPaymentExpired: origin === "PAYMENT_EXPIRED" ? true : undefined,
    excludeReverted: excludeReverted ? true : undefined,
    orderNumber,
    depositorName,
  });
  const revertMutation = useRevertOrderToRefundPending();

  const items = data?.data ?? [];
  const meta = data?.meta;
  const isBusy = revertMutation.isPending;

  const handleSearch = () => {
    setOrderNumber(orderNumberInput.trim() || undefined);
    setDepositorName(depositorNameInput.trim() || undefined);
  };

  const handleConfirmRevert = (reason: string) => {
    if (!target) return;
    revertMutation.mutate(
      { orderId: target.id, dto: { reason } },
      { onSuccess: () => setTarget(null) },
    );
  };

  return (
    <div className={LIST_SECTION_GAP}>
      <div className="flex items-center justify-between">
        <h1 className={LIST_SCREEN_HEADING}>환불 누락 관리</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        취소완료된 주문 중 실제로 입금됐을 수 있는 건을 찾아 환불 처리로 되돌립니다. 입금자명이 남은
        주문과 입금 기한 만료로 자동 취소된 주문이 위에 표시됩니다.
      </p>

      {/* 필터 */}
      <div className={LIST_FILTER_PANEL}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className={LIST_STATS_TEXT}>
            총 <span className="font-semibold text-foreground">{meta?.totalItems ?? 0}</span>건
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0 space-y-1">
            <Label>주문번호</Label>
            <BaseInput
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="ORD-20240101"
            />
          </div>
          <div className="min-w-0 space-y-1">
            <Label>입금자명</Label>
            <div className="flex gap-2">
              <BaseInput
                value={depositorNameInput}
                onChange={(e) => setDepositorNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="통장에 찍힌 이름"
              />
              <Button variant="outline" onClick={handleSearch}>
                검색
              </Button>
            </div>
          </div>
          <div className="min-w-0 space-y-1">
            <Label>취소 경위</Label>
            <Select value={origin} onValueChange={(value) => setOrigin(value as OriginFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="PAYMENT_EXPIRED">기한 만료 자동 취소만</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 space-y-1">
            <Label>처리 여부</Label>
            <Select
              value={excludeReverted ? "PENDING" : "ALL"}
              onValueChange={(value) => setExcludeReverted(value === "PENDING")}
            >
              <SelectTrigger>
                <SelectValue placeholder="미처리만" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">미처리만</SelectItem>
                <SelectItem value="ALL">되돌린 건 포함</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 목록 */}
      {isLoading ? (
        <ContentLoading variant="section" message="주문을 불러오는 중…" className="py-12" />
      ) : (
        <>
          {items.length === 0 ? (
            <EmptyState message="해당 조건의 취소완료 주문이 없습니다." />
          ) : (
            <>
              <Card className={LIST_CARD}>
                <RefundCandidateTable items={items} onRevert={setTarget} isBusy={isBusy} />
              </Card>
              {meta && (
                <OrderManagementPagination page={page} meta={meta} onPageChange={setPage} />
              )}
            </>
          )}
        </>
      )}

      <RevertRefundDialog
        order={target}
        isBusy={isBusy}
        onClose={() => setTarget(null)}
        onConfirm={handleConfirmRevert}
      />
    </div>
  );
};
