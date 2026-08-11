import React from "react";
import { EnableStatus } from "@/apps/web-seller/features/product/types/product.dto";
import type { ProductForm } from "@/apps/web-seller/features/product/types/product.ui";
import { ENABLE_DISABLE_OPTIONS } from "@/apps/web-seller/features/product/constants/product.constant";
import { SelectBox } from "@/apps/web-seller/common/components/selects/SelectBox";
import { NumberInput } from "@/apps/web-seller/common/components/inputs/NumberInput";
import { Label } from "@/apps/web-seller/common/components/labels/Label";
import { Card, CardContent } from "@/apps/web-seller/common/components/cards/Card";

export interface ProductCreationOptionsSectionProps {
  form: ProductForm;
  errors: Partial<Record<keyof ProductForm, string>>;
  onLetteringVisibleChange: (value: EnableStatus) => void;
  onLetteringMaxLengthChange: (value: number | undefined) => void;
  onImageUploadEnabledChange: (value: EnableStatus) => void;
  /** 상담 후 가격 결정 토글 (커스텀 상품에서만 노출) */
  onRequiresQuoteChange?: (value: boolean) => void;
  disabled?: boolean;
}

// 상품 등록 폼 - 옵션 섹션
export const ProductCreationOptionsSection: React.FC<ProductCreationOptionsSectionProps> = ({
  form,
  errors,
  onLetteringVisibleChange,
  onLetteringMaxLengthChange,
  onImageUploadEnabledChange,
  onRequiresQuoteChange,
  disabled = false,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-2">옵션</h2>
        <div className="border-t mb-6" />

        <div className="grid grid-cols-1 gap-6">
          <div>
            <SelectBox
              label="레터링 문구 사용 여부"
              value={form.letteringVisible}
              onChange={(value) => onLetteringVisibleChange(value as EnableStatus)}
              options={ENABLE_DISABLE_OPTIONS}
              error={errors.letteringVisible}
              required
            />
          </div>

          {form.letteringVisible === EnableStatus.ENABLE && (
            <div>
              <Label className="after:content-['*'] after:ml-0.5 after:text-destructive">
                최대 글자 수
              </Label>
              <NumberInput
                value={form.letteringMaxLength}
                onChange={onLetteringMaxLengthChange}
                placeholder="예: 10"
                min={1}
                className={errors.letteringMaxLength ? "border-destructive" : ""}
                disabled={disabled}
              />
              {errors.letteringMaxLength && (
                <p className="text-sm text-destructive mt-1">{errors.letteringMaxLength}</p>
              )}
            </div>
          )}

          <div>
            <SelectBox
              label="이미지 등록"
              value={form.imageUploadEnabled}
              onChange={(value) => onImageUploadEnabledChange(value as EnableStatus)}
              options={ENABLE_DISABLE_OPTIONS}
              error={errors.imageUploadEnabled}
              required
            />
          </div>

          {/* 상담 후 가격 결정 — 커스텀 상품(이미지 등록 사용)일 때만 선택 가능 */}
          {form.imageUploadEnabled === EnableStatus.ENABLE && onRequiresQuoteChange && (
            <div>
              <Label>판매 방식</Label>
              <label className="mt-2 flex cursor-pointer items-start gap-3 rounded-md border border-input p-3 hover:bg-accent/40">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-input"
                  checked={Boolean(form.requiresQuote)}
                  onChange={(e) => onRequiresQuoteChange(e.target.checked)}
                  disabled={disabled}
                />
                <span>
                  <span className="font-medium">상담 후 가격 결정</span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    디자인마다 가격이 달라 등록 시점에 가격을 정하기 어려운 상품에 사용합니다. 손님이
                    사진과 요청사항을 보내면 사장님이 건별로 견적을 제시합니다.
                  </p>
                </span>
              </label>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
