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
  disabled?: boolean;
}

// 상품 등록 폼 - 옵션 섹션
export const ProductCreationOptionsSection: React.FC<ProductCreationOptionsSectionProps> = ({
  form,
  errors,
  onLetteringVisibleChange,
  onLetteringMaxLengthChange,
  onImageUploadEnabledChange,
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
        </div>
      </CardContent>
    </Card>
  );
};
