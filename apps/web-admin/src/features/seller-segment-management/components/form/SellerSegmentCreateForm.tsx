import { useState } from "react";
import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import { Input } from "@/apps/web-admin/common/components/inputs/Input";
import { Label } from "@/apps/web-admin/common/components/labels/Label";
import { useCreateSellerSegment } from "@/apps/web-admin/features/seller-segment-management/hooks/mutations/useSellerSegmentManagementMutation";

const KEY_PATTERN = /^[A-Z0-9_]+$/;

export function SellerSegmentCreateForm() {
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateSellerSegment();
  const isBusy = createMutation.isPending;

  const resetForm = () => {
    setKey("");
    setLabel("");
    setFormError(null);
  };

  const handleSubmit = async () => {
    const trimmedKey = key.trim().toUpperCase();
    if (!trimmedKey) {
      setFormError("세그먼트 키를 입력해주세요.");
      return;
    }
    if (!KEY_PATTERN.test(trimmedKey)) {
      setFormError("키는 영문 대문자·숫자·언더스코어(_)만 사용할 수 있습니다.");
      return;
    }
    if (!label.trim()) {
      setFormError("이름을 입력해주세요.");
      return;
    }

    await createMutation.mutateAsync({ key: trimmedKey, label: label.trim() });
    resetForm();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        혜택 내용·인원·기간이 정해지지 않아도 먼저 "누구를 구분해둘지" 그룹만 만들어둘 수 있습니다.
        나중에 혜택이 정해지면 이 세그먼트를 대상으로 지급하면 됩니다. 이름에 기준·목적을 함께 적어두면
        나중에 알아보기 쉽습니다.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="segment-key">세그먼트 키</Label>
          <Input
            id="segment-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="예: EARLY_BIRD_2026"
            disabled={isBusy}
          />
          <p className="text-xs text-muted-foreground">등록 후 변경 불가. 영문 대문자·숫자·_만 사용</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="segment-label">이름</Label>
          <Input
            id="segment-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="예: 오픈 초기 가입 판매자 (~2026-08-31)"
            disabled={isBusy}
          />
        </div>
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <div className="flex justify-end border-t pt-4">
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isBusy || !key.trim() || !label.trim()}
        >
          {isBusy ? "등록 중..." : "세그먼트 등록"}
        </Button>
      </div>
    </div>
  );
}
