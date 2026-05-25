"use client";

import { BottomSheet } from "@/apps/web-user/common/components/bottom-sheets/BottomSheet";
import { TermsDocumentScreen } from "@/apps/web-user/features/terms/components/TermsDocumentScreen";
import type { TermsType } from "@/apps/web-user/features/terms/types/terms.dto";

interface TermsPreviewBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  termsType: TermsType;
}

export function TermsPreviewBottomSheet({
  isOpen,
  onClose,
  title,
  termsType,
}: TermsPreviewBottomSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      fullScreen
      scrollResetKey={termsType}
    >
      <TermsDocumentScreen termsType={termsType} />
    </BottomSheet>
  );
}
