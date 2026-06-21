import {
  EnableStatus,
  CakeSizeDisplayName,
  ProductCategoryType,
} from "@/apps/web-seller/features/product/types/product.dto";

export const SALES_STATUS_OPTIONS = [
  { value: EnableStatus.ENABLE, label: "판매중" },
  { value: EnableStatus.DISABLE, label: "판매중지" },
] as const;

export const VISIBILITY_STATUS_OPTIONS = [
  { value: EnableStatus.ENABLE, label: "노출" },
  { value: EnableStatus.DISABLE, label: "숨김" },
] as const;

export const ENABLE_DISABLE_OPTIONS = [
  { value: EnableStatus.ENABLE, label: "사용" },
  { value: EnableStatus.DISABLE, label: "미사용" },
] as const;

/** 카테고리 타입 그룹별 옵션 (UI: [대상별], [서비스], [디자인]) */
export const PRODUCT_CATEGORY_GROUPS = [
  {
    label: "대상별",
    options: [
      { value: ProductCategoryType.BIRTHDAY, label: "생일" },
      { value: ProductCategoryType.LOVER, label: "연인" },
      { value: ProductCategoryType.FRIEND, label: "친구" },
      { value: ProductCategoryType.FAMILY, label: "가족" },
      { value: ProductCategoryType.ANNIVERSARY, label: "기념일" },
    ],
  },
  {
    label: "서비스",
    options: [
      { value: ProductCategoryType.SAME_DAY_PICKUP, label: "당일픽업" },
      { value: ProductCategoryType.LETTERING, label: "레터링" },
    ],
  },
  {
    label: "디자인",
    options: [
      { value: ProductCategoryType.CHARACTER, label: "캐릭터" },
      { value: ProductCategoryType.SIMPLE, label: "심플" },
      { value: ProductCategoryType.FLOWER, label: "꽃" },
      { value: ProductCategoryType.PHOTO, label: "사진" },
    ],
  },
] as const;

// 케이크 사이즈 표시명 드롭다운 옵션
export const CAKE_SIZE_DISPLAY_NAME_OPTIONS = [
  { value: CakeSizeDisplayName.DOSIRAK, label: "도시락" },
  { value: CakeSizeDisplayName.MINI, label: "미니" },
  { value: CakeSizeDisplayName.SIZE_1, label: "1호" },
  { value: CakeSizeDisplayName.SIZE_2, label: "2호" },
  { value: CakeSizeDisplayName.SIZE_3, label: "3호" },
] as const;
