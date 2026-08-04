"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "@/apps/web-user/common/components/bottom-sheets/BottomSheet";
import { Button } from "@/apps/web-user/common/components/buttons/Button";
import { Input } from "@/apps/web-user/common/components/inputs/Input";
import { isValidVerificationCode } from "@/apps/web-user/common/utils/validator.util";
import { useReviewLogin } from "@/apps/web-user/features/auth/hooks/mutations/useAuthMutation";

interface ReviewLoginBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 앱스토어/플레이스토어 심사 대응 전용 로그인 진입점.
 * 버전정보 화면의 숨겨진 탭 제스처로만 열리며, 서버에 설정된 6자리 코드가 맞으면 심사용 계정으로 로그인 처리.
 */
export function ReviewLoginBottomSheet({ isOpen, onClose }: ReviewLoginBottomSheetProps) {
  const [code, setCode] = useState("");
  const reviewLoginMutation = useReviewLogin();

  useEffect(() => {
    if (isOpen) {
      setCode("");
    }
  }, [isOpen]);

  const codeValid = isValidVerificationCode(code);
  const canSubmit = codeValid && !reviewLoginMutation.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await reviewLoginMutation.mutateAsync(code);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="심사용 로그인"
      footer={
        <div className="flex gap-2 px-5 py-4">
          <span className="flex-1">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
          </span>
          <span className="flex-[2]">
            <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
              로그인
            </Button>
          </span>
        </div>
      }
    >
      <div className="px-5 pt-6 pb-10 flex flex-col gap-5">
        <div>
          <p className="text-sm font-bold text-gray-900 mb-2">코드 입력</p>
          <Input
            variant="register"
            placeholder="6자리 코드 입력"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            inputMode="numeric"
          />
        </div>
      </div>
    </BottomSheet>
  );
}
