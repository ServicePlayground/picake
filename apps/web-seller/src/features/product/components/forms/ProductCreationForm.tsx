import React, { useState, useEffect } from "react";
import { BaseButton as Button } from "@/apps/web-seller/common/components/buttons/BaseButton";
import { Card, CardContent } from "@/apps/web-seller/common/components/cards/Card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/apps/web-seller/common/components/tabs/Tabs";
import {
  EnableStatus,
  OptionRequired,
  CakeSizeOptionDto,
  CakeFlavorOptionDto,
  ProductCategoryType,
  CakeSizeDisplayName,
} from "@/apps/web-seller/features/product/types/product.dto";
import type { ProductForm } from "@/apps/web-seller/features/product/types/product.ui";
import { ProductCreationBasicInfoSection } from "@/apps/web-seller/features/product/components/sections/ProductCreationBasicInfoSection";
import { ProductCreationCakeOptionsSection } from "@/apps/web-seller/features/product/components/sections/ProductCreationCakeOptionsSection";
import { ProductCreationLetteringPolicySection } from "@/apps/web-seller/features/product/components/sections/ProductCreationLetteringPolicySection";
import { ProductCreationDetailDescriptionSection } from "@/apps/web-seller/features/product/components/sections/ProductCreationDetailDescriptionSection";
import { ProductCreationProductNoticeSection } from "@/apps/web-seller/features/product/components/sections/ProductCreationProductNoticeSection";
import { validateProductForm } from "@/apps/web-seller/features/product/utils/validateProductForm";

interface Props {
  onSubmit: (data: ProductForm) => void;
  initialValue?: ProductForm;
  onChange?: (data: ProductForm) => void;
  disabled?: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export const defaultForm: ProductForm = {
  images: [],
  name: "",
  originalPrice: 0,
  salePrice: 0,
  salesStatus: EnableStatus.ENABLE,
  visibilityStatus: EnableStatus.ENABLE,
  cakeSizeOptions: [
    {
      visible: EnableStatus.ENABLE,
      displayName: CakeSizeDisplayName.DOSIRAK,
      lengthCm: 0,
      price: 0,
      description: "1~2인용",
    },
  ],
  cakeFlavorOptions: [
    {
      visible: EnableStatus.ENABLE,
      displayName: "초콜릿",
      price: 0,
    },
  ],
  letteringVisible: EnableStatus.ENABLE,
  letteringRequired: OptionRequired.OPTIONAL,
  letteringMaxLength: 1,
  imageUploadEnabled: EnableStatus.ENABLE,
  productCategoryTypes: [],
  searchTags: [],
  detailDescription: "",
  productNoticeFoodType: "",
  productNoticeProducer: "",
  productNoticeOrigin: "",
  productNoticeAddress: "",
  productNoticeManufactureDate: "",
  productNoticeExpirationDate: "",
  productNoticePackageCapacity: "",
  productNoticePackageQuantity: "",
  productNoticeIngredients: "",
  productNoticeCalories: "",
  productNoticeSafetyNotice: "",
  productNoticeGmoNotice: "",
  productNoticeImportNotice: "",
  productNoticeCustomerService: "",
};

export const ProductCreationForm: React.FC<Props> = ({
  onSubmit,
  initialValue,
  onChange,
  disabled = false,
  onDelete,
  isDeleting = false,
}) => {
  const [form, setForm] = useState<ProductForm>(initialValue || defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (initialValue) {
      setForm(initialValue);
      setErrors({});
    }
  }, [initialValue]);

  const validate = (): {
    isValid: boolean;
    errors: Partial<Record<keyof ProductForm, string>>;
  } => {
    const newErrors = validateProductForm(form);
    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleChange =
    (key: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (disabled) return;
      const value = e.target.value;
      const next = { ...form, [key]: value };
      setForm(next);
      onChange?.(next);
    };

  const handleOriginalPriceChange = (value: number) => {
    if (disabled) return;
    const next = { ...form, originalPrice: value };
    setForm(next);
    onChange?.(next);
  };

  const handleSalePriceChange = (value: number) => {
    if (disabled) return;
    const next = { ...form, salePrice: value };
    setForm(next);
    onChange?.(next);
  };

  const handleSalesStatusChange = (value: EnableStatus) => {
    if (disabled) return;
    const next = { ...form, salesStatus: value };
    setForm(next);
    onChange?.(next);
  };

  const handleVisibilityStatusChange = (value: EnableStatus) => {
    if (disabled) return;
    const next = { ...form, visibilityStatus: value };
    setForm(next);
    onChange?.(next);
  };

  const handleMainImageChange = (url: string) => {
    // 대표 이미지 변경 시: 새로운 대표 이미지 + 기존 추가 이미지들을 합쳐서 images 배열 생성
    const additionalImages = form.images?.slice(1) || [];
    const newImages = url ? [url, ...additionalImages] : additionalImages;
    const next = { ...form, images: newImages };
    setForm(next);
    onChange?.(next);
  };

  const handleAdditionalImagesChange = (urls: string[]) => {
    // 추가 이미지 변경 시: 기존 대표 이미지 + 새로운 추가 이미지들을 합쳐서 images 배열 생성
    const mainImage = form.images?.[0] || "";
    const newImages = mainImage ? [mainImage, ...urls] : urls;
    const next = { ...form, images: newImages };
    setForm(next);
    onChange?.(next);
  };

  const handleCakeSizeOptionsChange = (options: CakeSizeOptionDto[]) => {
    const next = { ...form, cakeSizeOptions: options };
    setForm(next);
    onChange?.(next);
  };

  const handleCakeFlavorOptionsChange = (options: CakeFlavorOptionDto[]) => {
    const next = { ...form, cakeFlavorOptions: options };
    setForm(next);
    onChange?.(next);
  };

  const handleLetteringVisibleChange = (value: EnableStatus) => {
    const next = {
      ...form,
      letteringVisible: value,
      ...(value === EnableStatus.ENABLE && form.letteringMaxLength < 1
        ? { letteringMaxLength: 1 }
        : {}),
    };
    setForm(next);
    onChange?.(next);
  };

  const handleLetteringRequiredChange = (value: OptionRequired) => {
    const next = { ...form, letteringRequired: value };
    setForm(next);
    onChange?.(next);
  };

  const handleLetteringMaxLengthChange = (value: number) => {
    if (disabled) return;
    const next = { ...form, letteringMaxLength: value };
    setForm(next);
    onChange?.(next);
  };

  const handleImageUploadEnabledChange = (value: EnableStatus) => {
    const next = { ...form, imageUploadEnabled: value };
    setForm(next);
    onChange?.(next);
  };

  const handleProductCategoryTypesChange = (value: ProductCategoryType[]) => {
    if (disabled) return;
    const next = { ...form, productCategoryTypes: value };
    setForm(next);
    onChange?.(next);
  };

  const handleSearchTagsChange = (value: string[]) => {
    if (disabled) return;
    const next = { ...form, searchTags: value };
    setForm(next);
    onChange?.(next);
  };

  const handleDetailDescriptionChange = (value: string) => {
    const next = { ...form, detailDescription: value };
    setForm(next);
    onChange?.(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validate();
    if (!isValid) {
      // 첫 번째 에러가 있는 탭으로 이동
      const errorKeys = Object.keys(validationErrors);
      if (errorKeys.length > 0) {
        // 에러가 있는 탭으로 이동
        if (validationErrors.detailDescription) {
          setActiveTab("detail"); // 상세정보 탭
        } else if (
          validationErrors.productNoticeFoodType ||
          validationErrors.productNoticeProducer ||
          validationErrors.productNoticeOrigin ||
          validationErrors.productNoticeAddress ||
          validationErrors.productNoticeManufactureDate ||
          validationErrors.productNoticeExpirationDate ||
          validationErrors.productNoticePackageCapacity ||
          validationErrors.productNoticePackageQuantity ||
          validationErrors.productNoticeIngredients ||
          validationErrors.productNoticeCalories ||
          validationErrors.productNoticeSafetyNotice ||
          validationErrors.productNoticeGmoNotice ||
          validationErrors.productNoticeImportNotice ||
          validationErrors.productNoticeCustomerService
        ) {
          setActiveTab("notice"); // 상품정보제공고시 탭
        } else {
          setActiveTab("basic"); // 기본 정보 탭
        }
      }
      return;
    }

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="detail">상세정보</TabsTrigger>
              <TabsTrigger value="notice">상품정보제공고시</TabsTrigger>
            </TabsList>

            {/* 기본 정보 탭 */}
            <TabsContent value="basic" className="space-y-6 mt-6">
              <ProductCreationBasicInfoSection
                form={form}
                errors={errors}
                onSalesStatusChange={handleSalesStatusChange}
                onVisibilityStatusChange={handleVisibilityStatusChange}
                onProductCategoryTypesChange={handleProductCategoryTypesChange}
                onSearchTagsChange={handleSearchTagsChange}
                onMainImageChange={handleMainImageChange}
                onAdditionalImagesChange={handleAdditionalImagesChange}
                onChange={handleChange}
                onOriginalPriceChange={handleOriginalPriceChange}
                onSalePriceChange={handleSalePriceChange}
                disabled={disabled}
              />

              {/* 케이크 옵션 섹션 */}
              <ProductCreationCakeOptionsSection
                form={form}
                errors={errors}
                onCakeSizeOptionsChange={handleCakeSizeOptionsChange}
                onCakeFlavorOptionsChange={handleCakeFlavorOptionsChange}
              />

              {/* 레터링 정책 섹션 */}
              <ProductCreationLetteringPolicySection
                form={form}
                errors={errors}
                onLetteringVisibleChange={handleLetteringVisibleChange}
                onLetteringRequiredChange={handleLetteringRequiredChange}
                onLetteringMaxLengthChange={handleLetteringMaxLengthChange}
                onImageUploadEnabledChange={handleImageUploadEnabledChange}
                disabled={disabled}
              />
            </TabsContent>

            {/* 상세정보 탭 */}
            <TabsContent value="detail" className="mt-6">
              <ProductCreationDetailDescriptionSection
                form={form}
                errors={errors}
                onChange={handleDetailDescriptionChange}
              />
            </TabsContent>

            {/* 상품정보제공고시 탭 */}
            <TabsContent value="notice" className="mt-6">
              <ProductCreationProductNoticeSection
                form={form}
                errors={errors}
                onChange={handleChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {!disabled && (
        <div className="flex justify-center gap-4 pt-6">
          {initialValue && onDelete && (
            <Button
              type="button"
              size="lg"
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              삭제하기
            </Button>
          )}
          <Button type="submit" size="lg" disabled={isDeleting}>
            {initialValue ? "수정하기" : "등록하기"}
          </Button>
        </div>
      )}
    </form>
  );
};
