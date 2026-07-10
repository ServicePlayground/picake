import { PaginationMeta } from "@/apps/web-user/common/types/api.type";

/**
 * 정렬 enum
 */
export enum SortBy {
  LATEST = "latest", // 최신순(생성일 내림차순)
  PRICE_ASC = "price_asc", // 가격 오름차순
  PRICE_DESC = "price_desc", // 가격 내림차순
  POPULAR = "popular", // 인기순(좋아요 수 내림차순)
  REVIEW_COUNT = "review_count", // 후기 많은 순(후기 수 내림차순)
  RATING_AVG = "rating_avg", // 별점 높은 순(평균 별점 내림차순)
  DISTANCE = "distance", // 거리순(스토어 픽업 좌표 기준, latitude·longitude 필요)
}

export enum SalesStatus {
  ENABLE = "ENABLE",
  DISABLE = "DISABLE",
}

export enum VisibilityStatus {
  ENABLE = "ENABLE",
  DISABLE = "DISABLE",
}

export enum ImageUploadEnabled {
  ENABLE = "ENABLE",
  DISABLE = "DISABLE",
}

export enum ProductType {
  BASIC_CAKE = "BASIC_CAKE", // 기본 케이크
  CUSTOM_CAKE = "CUSTOM_CAKE", // 커스텀 케이크
}

/** 상품 카테고리 타입 (복수 선택 가능) */
export enum ProductCategoryType {
  BIRTHDAY = "BIRTHDAY", // 생일
  LOVER = "LOVER", // 연인
  FRIEND = "FRIEND", // 친구
  FAMILY = "FAMILY", // 가족
  ANNIVERSARY = "ANNIVERSARY", // 기념일
  SAME_DAY_PICKUP = "SAME_DAY_PICKUP", // 당일픽업
  LETTERING = "LETTERING", // 커스텀
  CHARACTER = "CHARACTER", // 캐릭터
  SIMPLE = "SIMPLE", // 심플
  FLOWER = "FLOWER", // 꽃
  PHOTO = "PHOTO", // 사진
}

export enum VisibleStatus {
  ENABLE = "ENABLE",
  DISABLE = "DISABLE",
}

export interface CakeSizeOption {
  id: string;
  visible: VisibleStatus;
  description: string;
  displayName: string;
  price: number;
  lengthCm: number;
}

export interface CakeFlavorOption {
  id: string;
  visible: VisibleStatus;
  displayName: string;
  price: number;
}

/**
 * 상품 정보
 */
export interface Product {
  id: string;
  storeId: string;
  name: string;
  images: string[];
  originalPrice: number;
  salePrice: number;
  likeCount: number;
  isLiked: boolean | null;
  averageRating: number; // 해당 상품의 모든 후기들의 평균 별점
  totalReviewCount: number; // 해당 상품의 모든 후기 개수
  salesStatus: SalesStatus;
  visibilityStatus: VisibilityStatus;
  cakeSizeOptions: CakeSizeOption[];
  cakeFlavorOptions: CakeFlavorOption[];
  letteringVisible: VisibleStatus;
  letteringMaxLength: number;
  imageUploadEnabled: ImageUploadEnabled;
  productType: ProductType;
  productCategoryTypes: ProductCategoryType[]; // 카테고리 (없거나 여러 개)
  searchTags: string[]; // 검색 태그 (없거나 여러 개)
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
  productNumber: string;
  createdAt: Date;
  updatedAt: Date;
  // 스토어 정보
  storeName: string;
  storeLogoImageUrl?: string | null;
  // 픽업장소
  pickupAddress: string;
  pickupRoadAddress: string;
  pickupDetailAddress?: string;
  pickupZonecode: string;
  pickupLatitude: number;
  pickupLongitude: number;
  /** 스토어가 설정한 환불·취소 규정 (Product 상세에 포함됨) */
  storeRefundCancellationPolicy?: import("@/apps/web-user/features/store/types/store.type").RefundCancellationPolicy;
}

/**
 * 상품 목록 응답
 */
export interface ProductListResponse {
  data: Product[];
  meta: PaginationMeta;
}

/**
 * 상품 목록 조회 쿼리 키용 파라미터 (page 제외)
 */
export interface ProductListQueryParams {
  limit: number;
  sortBy: SortBy;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  storeId?: string;
  productType?: ProductType;
  productCategoryTypes?: ProductCategoryType[];
  regions?: string;
}

/**
 * 상품 목록 조회 요청 파라미터
 */
export interface GetProductsParams extends ProductListQueryParams {
  page: number;
}
