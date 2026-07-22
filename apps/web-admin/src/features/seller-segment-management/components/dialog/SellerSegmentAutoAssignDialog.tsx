import { useState } from "react";
import { Button } from "@/apps/web-admin/common/components/buttons/Button";
import { Input } from "@/apps/web-admin/common/components/inputs/Input";
import { Label } from "@/apps/web-admin/common/components/labels/Label";
import { LIST_CARD_TITLE } from "@/apps/web-admin/common/constants/list-typography.constant";
import { useAutoAssignBySignupDate } from "@/apps/web-admin/features/seller-segment-management/hooks/mutations/useSellerSegmentManagementMutation";
import type { SellerSegmentResponseDto } from "@/apps/web-admin/features/seller-segment-management/types/seller-segment-management.dto";

interface SellerSegmentAutoAssignDialogProps {
  segment: SellerSegmentResponseDto | null;
  onClose: () => void;
}

/**
 * 가입일 기준 자동 편입 — 기준일을 지정하면 그 이전(포함) 가입한 판매자를 이 세그먼트에 편입한다.
 * 이미 소속된 판매자는 건너뛰므로 여러 번 실행해도 안전하다.
 */
export function SellerSegmentAutoAssignDialog({
  segment,
  onClose,
}: SellerSegmentAutoAssignDialogProps) {
  const [cutoffDate, setCutoffDate] = useState("");
  const autoAssignMutation = useAutoAssignBySignupDate();

  if (!segment) return null;

  const handleClose = () => {
    setCutoffDate("");
    onClose();
  };

  const handleRun = async () => {
    if (!cutoffDate) return;
    await autoAssignMutation.mutateAsync({
      id: segment.id,
      dto: { cutoffDate: new Date(cutoffDate).toISOString() },
    });
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-border bg-card text-card-foreground shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-6 py-4">
          <h3 className={LIST_CARD_TITLE}>가입일 기준 자동 편입</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {segment.label} ({segment.key}) · 현재 소속 {segment.memberCount.toLocaleString()}명
          </p>
        </div>

        <div className="space-y-3 px-6 py-5">
          <p className="text-sm text-muted-foreground">
            기준일 이전(포함)에 가입한 판매자를 한 번에 편입합니다. 이미 소속된 판매자는 건너뛰므로
            여러 번 실행해도 안전합니다.
          </p>
          <div className="space-y-2">
            <Label htmlFor="segment-cutoff-date">가입일 기준일</Label>
            <Input
              id="segment-cutoff-date"
              type="datetime-local"
              value={cutoffDate}
              onChange={(e) => setCutoffDate(e.target.value)}
              disabled={autoAssignMutation.isPending}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={autoAssignMutation.isPending}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={() => void handleRun()}
            disabled={!cutoffDate || autoAssignMutation.isPending}
          >
            {autoAssignMutation.isPending ? "편입 중..." : "자동 편입 실행"}
          </Button>
        </div>
      </div>
    </div>
  );
}
