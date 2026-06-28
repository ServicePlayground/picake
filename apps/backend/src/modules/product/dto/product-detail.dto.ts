import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  EnableStatus,
  ProductType,
  ProductCategoryType,
  SWAGGER_EXAMPLES,
} from "@apps/backend/modules/product/constants/product.constants";
import { SWAGGER_EXAMPLES as STORE_SWAGGER_EXAMPLES } from "@apps/backend/modules/store/constants/store.constants";
import { SWAGGER_EXAMPLES as UPLOAD_SWAGGER_EXAMPLES } from "@apps/backend/modules/upload/constants/upload.constants";
import {
  CreateCakeSizeOptionDto,
  CreateCakeFlavorOptionDto,
} from "@apps/backend/modules/product/dto/product-create.dto";
import { PickupAddressDto } from "@apps/backend/modules/product/dto/product-common.dto";
import { RefundCancellationPolicyDto } from "@apps/backend/modules/store/dto/store-refund-cancellation-policy.dto";

/**
 * 케이크 사이즈 옵션 응답 DTO
 */
export class CakeSizeOptionResponseDto extends CreateCakeSizeOptionDto {
  @ApiProperty({
    description: "옵션 고유 ID",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.cakeSizeOptions[0].id,
  })
  declare id: string;
}

/**
 * 케이크 맛 옵션 응답 DTO
 */
export class CakeFlavorOptionResponseDto extends CreateCakeFlavorOptionDto {
  @ApiProperty({
    description: "옵션 고유 ID",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.cakeFlavorOptions[0].id,
  })
  declare id: string;
}

/**
 * 상품 응답 DTO
 */
export class ProductResponseDto extends PickupAddressDto {
  @ApiProperty({
    description: "상품 ID",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.id,
  })
  id: string;

  @ApiProperty({
    description: "스토어 ID",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.storeId,
  })
  storeId: string;

  @ApiProperty({
    description: "상품명",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.name,
  })
  name: string;

  @ApiProperty({
    description: "이미지 URL 목록 (첫 번째 요소가 대표 이미지)",
    type: [String],
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.images,
  })
  images: string[];

  @ApiProperty({
    description: "정가",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.originalPrice,
  })
  originalPrice: number;

  @ApiProperty({
    description: "판매가",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.salePrice,
  })
  salePrice: number;

  @ApiProperty({
    description: "판매여부",
    enum: EnableStatus,
    example: EnableStatus.ENABLE,
  })
  salesStatus: EnableStatus;

  @ApiProperty({
    description: "노출여부",
    enum: EnableStatus,
    example: EnableStatus.ENABLE,
  })
  visibilityStatus: EnableStatus;

  @ApiPropertyOptional({
    description: "케이크 옵션 - 사이즈 목록",
    type: [CakeSizeOptionResponseDto],
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.cakeSizeOptions,
  })
  cakeSizeOptions?: CakeSizeOptionResponseDto[] | null;

  @ApiPropertyOptional({
    description: "케이크 옵션 - 맛 목록",
    type: [CakeFlavorOptionResponseDto],
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.cakeFlavorOptions,
  })
  cakeFlavorOptions?: CakeFlavorOptionResponseDto[] | null;

  @ApiProperty({
    description: "레터링 문구 사용 여부",
    enum: EnableStatus,
    example: EnableStatus.ENABLE,
  })
  letteringVisible: EnableStatus;

  @ApiProperty({
    description: "레터링 최대 글자 수",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.letteringMaxLength,
  })
  letteringMaxLength: number;

  @ApiProperty({
    description: "이미지 등록 사용여부",
    enum: EnableStatus,
    example: EnableStatus.ENABLE,
  })
  imageUploadEnabled: EnableStatus;

  @ApiProperty({
    description: "상품 타입",
    enum: ProductType,
    example: ProductType.CUSTOM_CAKE,
  })
  productType: ProductType;

  @ApiPropertyOptional({
    description: "상품 카테고리 타입 목록 (없을 수 있고, 여러 개 가능)",
    enum: ProductCategoryType,
    isArray: true,
    example: [ProductCategoryType.BIRTHDAY, ProductCategoryType.SIMPLE],
  })
  productCategoryTypes: ProductCategoryType[];

  @ApiPropertyOptional({
    description: "검색 태그 목록 (없을 수 있고, 여러 개 가능)",
    type: [String],
    example: ["생일케이크", "초콜릿", "당일배송"],
  })
  searchTags: string[];

  @ApiPropertyOptional({
    description: "상세 설명 (HTML)",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.detailDescription,
  })
  detailDescription?: string | null;

  @ApiProperty({
    description: "상품번호",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNumber,
  })
  productNumber: string;

  @ApiProperty({
    description: "식품의 유형",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeFoodType,
  })
  productNoticeFoodType: string;

  @ApiProperty({
    description: "제조사",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeProducer,
  })
  productNoticeProducer: string;

  @ApiProperty({
    description: "원산지",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeOrigin,
  })
  productNoticeOrigin: string;

  @ApiProperty({
    description: "소재지",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeAddress,
  })
  productNoticeAddress: string;

  @ApiProperty({
    description: "제조연월일",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeManufactureDate,
  })
  productNoticeManufactureDate: string;

  @ApiProperty({
    description: "소비기한 또는 품질유지기한",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeExpirationDate,
  })
  productNoticeExpirationDate: string;

  @ApiProperty({
    description: "포장단위별 용량/수량",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticePackageCapacity,
  })
  productNoticePackageCapacity: string;

  @ApiProperty({
    description: "포장 단위별 수량",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticePackageQuantity,
  })
  productNoticePackageQuantity: string;

  @ApiProperty({
    description: "원재료명 및 함량",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeIngredients,
  })
  productNoticeIngredients: string;

  @ApiProperty({
    description: "영양성분",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeCalories,
  })
  productNoticeCalories: string;

  @ApiProperty({
    description: "소비자안전을 위한 주의사항",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeSafetyNotice,
  })
  productNoticeSafetyNotice: string;

  @ApiProperty({
    description: "유전자변형식품에 해당하는 경우의 표시",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeGmoNotice,
  })
  productNoticeGmoNotice: string;

  @ApiProperty({
    description: "수입식품의 경우",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeImportNotice,
  })
  productNoticeImportNotice: string;

  @ApiProperty({
    description: "고객센터",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeCustomerService,
  })
  productNoticeCustomerService: string;

  @ApiProperty({
    description: "좋아요 수",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.likeCount,
  })
  likeCount: number;

  @ApiPropertyOptional({
    description: "좋아요 여부 (로그인한 사용자의 경우에만 제공)",
    example: true,
  })
  isLiked?: boolean | null;

  @ApiProperty({
    description: "평균 별점 (해당 상품의 모든 후기들의 평균 별점)",
    example: 4.5,
  })
  averageRating: number;

  @ApiProperty({
    description: "전체 후기 개수 (해당 상품의 모든 후기 개수)",
    example: 42,
  })
  totalReviewCount: number;

  @ApiProperty({
    description: "생성일시",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.createdAt,
  })
  createdAt: Date;

  @ApiProperty({
    description: "수정일시",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.updatedAt,
  })
  updatedAt: Date;

  // 스토어 정보
  @ApiProperty({
    description: "스토어 이름",
    example: STORE_SWAGGER_EXAMPLES.NAME,
  })
  storeName: string;

  @ApiPropertyOptional({
    description: "스토어 로고 이미지 URL",
    example: UPLOAD_SWAGGER_EXAMPLES.FILE_URL,
  })
  storeLogoImageUrl?: string | null;

  @ApiProperty({
    description:
      "스토어 환불·취소 규정(스토어 `refund_cancellation_policy` JSON과 동일). 상품 조회 시점 스토어 설정입니다.",
    type: RefundCancellationPolicyDto,
    example: STORE_SWAGGER_EXAMPLES.REFUND_CANCELLATION_POLICY,
  })
  storeRefundCancellationPolicy: RefundCancellationPolicyDto;

  // 픽업장소 정보는 PickupAddressDto 상속
}
