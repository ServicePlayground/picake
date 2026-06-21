import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import {
  OptionRequired,
  EnableStatus,
  ProductCategoryType,
} from "@apps/backend/modules/product/constants/product.constants";
import { SWAGGER_EXAMPLES as PRODUCT_SWAGGER_EXAMPLES } from "@apps/backend/modules/product/constants/product.constants";
import {
  CreateCakeFlavorOptionDto,
  CreateCakeSizeOptionDto,
} from "@apps/backend/modules/product/dto/product-create.dto";

/**
 * 케이크 사이즈 옵션 DTO (수정용 - id 필수)
 */
export class UpdateCakeSizeOptionDto extends CreateCakeSizeOptionDto {
  @ApiProperty({
    description: "옵션 고유 ID (수정 시 필수, 기존 ID 그대로 전달)",
    example: "size_abcd1234",
  })
  @IsNotEmpty()
  @IsString()
  declare id: string;
}

/**
 * 케이크 맛 옵션 DTO (수정용 - id 필수)
 */
export class UpdateCakeFlavorOptionDto extends CreateCakeFlavorOptionDto {
  @ApiProperty({
    description: "옵션 고유 ID (수정 시 필수, 기존 ID 그대로 전달)",
    example: "flavor_efgh5678",
  })
  @IsNotEmpty()
  @IsString()
  declare id: string;
}

/**
 * 상품 수정 요청 DTO
 */
export class UpdateProductRequestDto {
  @ApiPropertyOptional({
    description: "상품명",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.name,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "이미지 URL 목록 (첫 번째 요소가 대표 이미지)",
    isArray: true,
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.images,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: "정가",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.originalPrice,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiPropertyOptional({
    description: "판매가",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.salePrice,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({
    description: "판매여부",
    enum: EnableStatus,
    example: EnableStatus.ENABLE,
  })
  @IsOptional()
  @IsEnum(EnableStatus)
  salesStatus?: EnableStatus;

  @ApiPropertyOptional({
    description: "노출여부",
    enum: EnableStatus,
    example: EnableStatus.ENABLE,
  })
  @IsOptional()
  @IsEnum(EnableStatus)
  visibilityStatus?: EnableStatus;

  @ApiPropertyOptional({
    description: "케이크 옵션 - 사이즈 목록",
    type: [UpdateCakeSizeOptionDto],
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.cakeSizeOptions,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCakeSizeOptionDto)
  cakeSizeOptions?: UpdateCakeSizeOptionDto[];

  @ApiPropertyOptional({
    description: "케이크 옵션 - 맛 목록",
    type: [UpdateCakeFlavorOptionDto],
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.cakeFlavorOptions,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCakeFlavorOptionDto)
  cakeFlavorOptions?: UpdateCakeFlavorOptionDto[];

  @ApiPropertyOptional({
    description: "레터링 문구 사용 여부",
    enum: EnableStatus,
    example: EnableStatus.ENABLE,
  })
  @IsOptional()
  @IsEnum(EnableStatus)
  letteringVisible?: EnableStatus;

  @ApiPropertyOptional({
    description: "레터링 문구 사용 (필수/선택)",
    enum: OptionRequired,
    example: OptionRequired.REQUIRED,
  })
  @IsOptional()
  @IsEnum(OptionRequired)
  letteringRequired?: OptionRequired;

  @ApiPropertyOptional({
    description: "레터링 최대 글자 수",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.letteringMaxLength,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  letteringMaxLength?: number;

  @ApiPropertyOptional({
    description: "이미지 등록 사용여부",
    enum: EnableStatus,
    example: EnableStatus.ENABLE,
  })
  @IsOptional()
  @IsEnum(EnableStatus)
  imageUploadEnabled?: EnableStatus;

  @ApiPropertyOptional({
    description: "상세 설명 (HTML)",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.detailDescription,
  })
  @IsOptional()
  @IsString()
  detailDescription?: string;

  @ApiPropertyOptional({
    description:
      "상품 카테고리 타입 (없거나 여러 개) - 생일, 연인, 친구, 가족, 기념일, 당일픽업, 레터링, 캐릭터, 심플, 꽃, 사진. 빈 배열이면 전체 제거",
    enum: ProductCategoryType,
    isArray: true,
    example: [ProductCategoryType.BIRTHDAY, ProductCategoryType.SIMPLE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ProductCategoryType, { each: true })
  productCategoryTypes?: ProductCategoryType[];

  @ApiPropertyOptional({
    description:
      "검색 태그 (없거나 여러 개) - 검색어로 상품 조회 시 상품명과 함께 검색됨. 빈 배열이면 전체 제거",
    type: [String],
    example: ["생일케이크", "초콜릿", "당일배송"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchTags?: string[];

  @ApiPropertyOptional({
    description: "식품의 유형",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeFoodType,
  })
  @IsOptional()
  @IsString()
  productNoticeFoodType?: string;

  @ApiPropertyOptional({
    description: "제조사",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeProducer,
  })
  @IsOptional()
  @IsString()
  productNoticeProducer?: string;

  @ApiPropertyOptional({
    description: "원산지",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeOrigin,
  })
  @IsOptional()
  @IsString()
  productNoticeOrigin?: string;

  @ApiPropertyOptional({
    description: "소재지",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeAddress,
  })
  @IsOptional()
  @IsString()
  productNoticeAddress?: string;

  @ApiPropertyOptional({
    description: "제조연월일",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeManufactureDate,
  })
  @IsOptional()
  @IsString()
  productNoticeManufactureDate?: string;

  @ApiPropertyOptional({
    description: "소비기한 또는 품질유지기한",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeExpirationDate,
  })
  @IsOptional()
  @IsString()
  productNoticeExpirationDate?: string;

  @ApiPropertyOptional({
    description: "포장단위별 용량/수량",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticePackageCapacity,
  })
  @IsOptional()
  @IsString()
  productNoticePackageCapacity?: string;

  @ApiPropertyOptional({
    description: "포장 단위별 수량",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticePackageQuantity,
  })
  @IsOptional()
  @IsString()
  productNoticePackageQuantity?: string;

  @ApiPropertyOptional({
    description: "원재료명 및 함량",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeIngredients,
  })
  @IsOptional()
  @IsString()
  productNoticeIngredients?: string;

  @ApiPropertyOptional({
    description: "영양성분",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeCalories,
  })
  @IsOptional()
  @IsString()
  productNoticeCalories?: string;

  @ApiPropertyOptional({
    description: "소비자안전을 위한 주의사항",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeSafetyNotice,
  })
  @IsOptional()
  @IsString()
  productNoticeSafetyNotice?: string;

  @ApiPropertyOptional({
    description: "유전자변형식품에 해당하는 경우의 표시",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeGmoNotice,
  })
  @IsOptional()
  @IsString()
  productNoticeGmoNotice?: string;

  @ApiPropertyOptional({
    description: "수입식품의 경우",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeImportNotice,
  })
  @IsOptional()
  @IsString()
  productNoticeImportNotice?: string;

  @ApiPropertyOptional({
    description: "고객센터",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeCustomerService,
  })
  @IsOptional()
  @IsString()
  productNoticeCustomerService?: string;
}

/**
 * 상품 수정 응답 DTO
 */
export class UpdateProductResponseDto {
  @ApiProperty({
    description: "상품 ID",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.id,
  })
  id: string;
}
