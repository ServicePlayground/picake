/**
 * 상품 API 타입 (백엔드 product DTO와 1:1 정합)
 * - 단일: ProductResponseDto
 * - 목록: GetSellerProductsRequestDto, ProductListResponseDto
 * - CRUD: CreateProductRequestDto, CreateProductResponseDto, UpdateProductRequestDto
 */

import type { ListResponseDto } from "@/apps/web-seller/common/types/api.dto";

export enum EnableStatus {
  ENABLE = "ENABLE",
  DISABLE = "DISABLE",
}

export enum OptionRequired {
  REQUIRED = "REQUIRED",
  OPTIONAL = "OPTIONAL",
}

export enum ProductType {
  BASIC_CAKE = "BASIC_CAKE",
  CUSTOM_CAKE = "CUSTOM_CAKE",
}

export enum ProductCategoryType {
  BIRTHDAY = "BIRTHDAY",
  LOVER = "LOVER",
  FRIEND = "FRIEND",
  FAMILY = "FAMILY",
  ANNIVERSARY = "ANNIVERSARY",
  SAME_DAY_PICKUP = "SAME_DAY_PICKUP",
  LETTERING = "LETTERING",
  CHARACTER = "CHARACTER",
  SIMPLE = "SIMPLE",
  FLOWER = "FLOWER",
  PHOTO = "PHOTO",
}

export enum CakeSizeDisplayName {
  DOSIRAK = "도시락",
  MINI = "미니",
  SIZE_1 = "1호",
  SIZE_2 = "2호",
  SIZE_3 = "3호",
}

export enum SortBy {
  LATEST = "latest",
  PRICE_ASC = "price_asc",
  PRICE_DESC = "price_desc",
  POPULAR = "popular",
  REVIEW_COUNT = "review_count",
  RATING_AVG = "rating_avg",
  DISTANCE = "distance",
}

/** 케이크 사이즈 옵션 (생성/수정 요청·응답 공용, id는 응답에서 필수) */
export interface CakeSizeOptionDto {
  id?: string;
  visible: EnableStatus;
  displayName: CakeSizeDisplayName;
  lengthCm: number;
  price: number;
  description?: string;
}

/** 케이크 맛 옵션 (생성/수정 요청·응답 공용) */
export interface CakeFlavorOptionDto {
  id?: string;
  visible: EnableStatus;
  displayName: string;
  price: number;
}

export interface CreateProductRequestDto {
  storeId: string;
  name: string;
  images: string[];
  originalPrice: number;
  salePrice: number;
  salesStatus: EnableStatus;
  visibilityStatus: EnableStatus;
  cakeSizeOptions?: CakeSizeOptionDto[];
  cakeFlavorOptions?: CakeFlavorOptionDto[];
  letteringVisible: EnableStatus;
  letteringRequired: OptionRequired;
  letteringMaxLength: number;
  imageUploadEnabled: EnableStatus;
  productType?: ProductType;
  productCategoryTypes?: ProductCategoryType[];
  searchTags?: string[];
  detailDescription?: string;
  productNoticeFoodType: string;
  productNoticeProducer: string;
  productNoticeOrigin: string;
  productNoticeAddress: string;
  productNoticeManufactureDate: string;
  productNoticeExpirationDate: string;
  productNoticePackageCapacity: string;
  productNoticePackageQuantity: string;
  productNoticeIngredients: string;
  productNoticeCalories: string;
  productNoticeSafetyNotice: string;
  productNoticeGmoNotice: string;
  productNoticeImportNotice: string;
  productNoticeCustomerService: string;
}

export interface CreateProductResponseDto {
  id: string;
}

/** 상품 단일 응답 (목록·상세 동일, 백엔드 ProductResponseDto) */
export interface ProductResponseDto {
  id: string;
  storeId: string;
  name: string;
  images: string[];
  originalPrice: number;
  salePrice: number;
  salesStatus: EnableStatus;
  visibilityStatus: EnableStatus;
  cakeSizeOptions?: CakeSizeOptionDto[] | null;
  cakeFlavorOptions?: CakeFlavorOptionDto[] | null;
  letteringVisible: EnableStatus;
  letteringRequired: OptionRequired;
  letteringMaxLength: number;
  imageUploadEnabled: EnableStatus;
  productType: ProductType;
  productCategoryTypes: ProductCategoryType[];
  searchTags: string[];
  detailDescription?: string | null;
  productNumber: string;
  productNoticeFoodType: string;
  productNoticeProducer: string;
  productNoticeOrigin: string;
  productNoticeAddress: string;
  productNoticeManufactureDate: string;
  productNoticeExpirationDate: string;
  productNoticePackageCapacity: string;
  productNoticePackageQuantity: string;
  productNoticeIngredients: string;
  productNoticeCalories: string;
  productNoticeSafetyNotice: string;
  productNoticeGmoNotice: string;
  productNoticeImportNotice: string;
  productNoticeCustomerService: string;
  likeCount: number;
  isLiked?: boolean | null;
  averageRating: number;
  totalReviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  storeName: string;
  storeLogoImageUrl?: string | null;
  pickupAddress: string;
  pickupRoadAddress: string;
  pickupDetailAddress?: string;
  pickupZonecode: string;
  pickupLatitude: number;
  pickupLongitude: number;
}

/** 판매자용 상품 목록 조회 요청 (백엔드 GetSellerProductsRequestDto) */
export interface GetSellerProductsRequestDto {
  page: number;
  limit: number;
  sortBy: SortBy;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: CakeSizeDisplayName[];
  storeId?: string;
  productType?: ProductType;
  productCategoryTypes?: ProductCategoryType[];
  salesStatus?: EnableStatus;
  visibilityStatus?: EnableStatus;
  /** 거리순 정렬(sortBy=distance)일 때 필수 */
  latitude?: number;
  /** 거리순 정렬(sortBy=distance)일 때 필수 */
  longitude?: number;
}

export type ProductListResponseDto = ListResponseDto<ProductResponseDto>;

export interface UpdateProductRequestDto {
  name?: string;
  images?: string[];
  originalPrice?: number;
  salePrice?: number;
  salesStatus?: EnableStatus;
  visibilityStatus?: EnableStatus;
  cakeSizeOptions?: CakeSizeOptionDto[];
  cakeFlavorOptions?: CakeFlavorOptionDto[];
  letteringVisible?: EnableStatus;
  letteringRequired?: OptionRequired;
  letteringMaxLength?: number;
  imageUploadEnabled?: EnableStatus;
  productType?: ProductType;
  productCategoryTypes?: ProductCategoryType[];
  searchTags?: string[];
  detailDescription?: string;
  productNoticeFoodType?: string;
  productNoticeProducer?: string;
  productNoticeOrigin?: string;
  productNoticeAddress?: string;
  productNoticeManufactureDate?: string;
  productNoticeExpirationDate?: string;
  productNoticePackageCapacity?: string;
  productNoticePackageQuantity?: string;
  productNoticeIngredients?: string;
  productNoticeCalories?: string;
  productNoticeSafetyNotice?: string;
  productNoticeGmoNotice?: string;
  productNoticeImportNotice?: string;
  productNoticeCustomerService?: string;
}
