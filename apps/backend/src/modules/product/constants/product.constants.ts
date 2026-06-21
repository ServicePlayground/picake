/**
 * 상품 관련 에러 메시지
 */
export const PRODUCT_ERROR_MESSAGES = {
  NOT_FOUND: "상품을 찾을 수 없습니다.",
  FORBIDDEN: "해당 상품을 삭제할 권한이 없습니다.",
  STORE_NOT_FOUND: "스토어를 찾을 수 없습니다.",
  STORE_NOT_OWNED: "해당 스토어에 대한 권한이 없습니다.",
  LIKE_ALREADY_EXISTS: "이미 좋아요한 상품입니다.",
  LIKE_NOT_FOUND: "좋아요한 상품이 아닙니다.",
  PRODUCT_INACTIVE: "판매중지된 상품입니다.",
  PRODUCT_OUT_OF_STOCK: "품절된 상품입니다.",
  PRODUCT_NOT_AVAILABLE: "구매할 수 없는 상품입니다.",
  PRODUCT_PRICE_INVALID: "정가와 판매가는 0보다 큰 숫자여야 합니다.",
  SALE_PRICE_EXCEEDS_ORIGINAL_PRICE: "판매가는 정가보다 클 수 없습니다.",
  REVIEW_NOT_FOUND: "후기를 찾을 수 없습니다.",
  /** 거리순 정렬 시 클라이언트 기준 위도·경도 미전달 */
  DISTANCE_SORT_REQUIRES_COORDINATES:
    "거리순 정렬에는 latitude와 longitude 쿼리 파라미터가 필요합니다.",
} as const;

/**
 * 상품 관련 성공 메시지 상수
 */
export const PRODUCT_SUCCESS_MESSAGES = {
  PRODUCT_CREATED: "상품이 성공적으로 등록되었습니다.",
  PRODUCT_UPDATED: "상품이 성공적으로 수정되었습니다.",
  PRODUCT_DELETED: "상품이 성공적으로 삭제되었습니다.",
  LIKE_ADDED: "상품에 좋아요를 추가했습니다.",
  LIKE_REMOVED: "상품 좋아요를 취소했습니다.",
} as const;

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
  DISTANCE = "distance", // 거리순(스토어 픽업 좌표 기준, 클라이언트 위도·경도 필요)
}

/**
 * 사용/미사용 enum
 */
export enum EnableStatus {
  ENABLE = "ENABLE", // 사용
  DISABLE = "DISABLE", // 미사용
}

export enum ProductType {
  BASIC_CAKE = "BASIC_CAKE", // 기본 케이크
  CUSTOM_CAKE = "CUSTOM_CAKE", // 커스텀 케이크
}

export enum ProductCategoryType {
  BIRTHDAY = "BIRTHDAY", // 생일
  LOVER = "LOVER", // 연인
  FRIEND = "FRIEND", // 친구
  FAMILY = "FAMILY", // 가족
  ANNIVERSARY = "ANNIVERSARY", // 기념일
  SAME_DAY_PICKUP = "SAME_DAY_PICKUP", // 당일픽업
  LETTERING = "LETTERING", // 레터링
  CHARACTER = "CHARACTER", // 캐릭터
  SIMPLE = "SIMPLE", // 심플
  FLOWER = "FLOWER", // 꽃
  PHOTO = "PHOTO", // 사진
}

/**
 * 케이크 사이즈 표시명 enum
 */
export enum CakeSizeDisplayName {
  DOSIRAK = "도시락",
  MINI = "미니",
  SIZE_1 = "1호",
  SIZE_2 = "2호",
  SIZE_3 = "3호",
}

/**
 * Swagger 예시 데이터
 * 실제 API 응답과 일치하는 예시 데이터를 제공합니다.
 */
export const SWAGGER_EXAMPLES = {
  PRODUCT_DATA: {
    id: "prod_123456789",
    // 상품 정보
    name: "초콜릿 케이크",
    originalPrice: 50000,
    salePrice: 45000,
    likeCount: 25,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    cakeSizeOptions: [
      {
        id: "size_abcd1234",
        visible: EnableStatus.ENABLE,
        displayName: CakeSizeDisplayName.DOSIRAK,
        lengthCm: 8,
        price: 25000,
        description: "1인용",
      },
      {
        id: "size_efgh5678",
        visible: EnableStatus.ENABLE,
        displayName: CakeSizeDisplayName.MINI,
        lengthCm: 10,
        price: 30000,
        description: "1~2인용",
      },
      {
        id: "size_ijkl9012",
        visible: EnableStatus.ENABLE,
        displayName: CakeSizeDisplayName.SIZE_1,
        lengthCm: 15,
        price: 35000,
        description: "2~3인용",
      },
    ],
    cakeFlavorOptions: [
      {
        id: "flavor_ijkl9012",
        visible: EnableStatus.ENABLE,
        displayName: "초콜릿",
        price: 10000,
      },
      {
        id: "flavor_mnop3456",
        visible: EnableStatus.ENABLE,
        displayName: "바닐라",
        price: 20000,
      },
    ],
    letteringVisible: EnableStatus.ENABLE,
    letteringMaxLength: 20,
    imageUploadEnabled: EnableStatus.ENABLE,
    productType: "CUSTOM_CAKE",
    productCategoryTypes: ["BIRTHDAY", "SIMPLE"],
    searchTags: ["생일케이크", "초콜릿", "당일배송"],
    // 상세 정보
    detailDescription: "<p>고급 초콜릿으로 만든 프리미엄 케이크입니다.</p>",
    // 고시정보 (식품 판매 시 법적 필수 항목)
    productNumber: "CAKE-001",
    productNoticeFoodType: "케이크류",
    productNoticeProducer: "Picake",
    productNoticeOrigin: "국내산",
    productNoticeAddress: "서울시 강남구 테헤란로 123",
    productNoticeManufactureDate: "2024-01-01",
    productNoticeExpirationDate: "제조일로부터 3일",
    productNoticePackageCapacity: "500g",
    productNoticePackageQuantity: "1개",
    productNoticeIngredients: "초콜릿, 밀가루, 설탕, 우유, 계란",
    productNoticeCalories: "칼로리: 350kcal, 탄수화물: 45g, 단백질: 5g, 지방: 15g",
    productNoticeSafetyNotice: "알레르기 주의: 우유, 계란, 밀 함유",
    productNoticeGmoNotice: "해당사항 없음",
    productNoticeImportNotice: "해당사항 없음",
    productNoticeCustomerService: "1588-1234",
    images: [
      "https://example.com/main-image.jpg",
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
    ],
    salesStatus: EnableStatus.ENABLE,
    visibilityStatus: EnableStatus.ENABLE,
    storeId: "store_123456789",
  },
  PAGINATION_META: {
    currentPage: 1,
    limit: 30,
    totalItems: 150,
    totalPages: 8,
    hasNext: true,
    hasPrev: false,
  },
} as const;
