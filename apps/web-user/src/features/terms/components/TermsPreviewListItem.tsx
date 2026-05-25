"use client";

import { useState } from "react";
import { Icon } from "@/apps/web-user/common/components/icons";
import { TermsPreviewBottomSheet } from "@/apps/web-user/features/terms/components/TermsPreviewBottomSheet";
import type { TermsType } from "@/apps/web-user/features/terms/types/terms.dto";

interface TermsPreviewListItemProps {
  label: string;
  termsType: TermsType;
}

export function TermsPreviewListItem({ label, termsType }: TermsPreviewListItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between border-b border-gray-100 px-5 py-4 text-left"
      >
        <span className="text-sm font-bold text-gray-900">{label}</span>
        <Icon name="arrow" width={20} height={20} className="rotate-90 text-gray-900" />
      </button>

      <TermsPreviewBottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={label}
        termsType={termsType}
      />
    </>
  );
}
