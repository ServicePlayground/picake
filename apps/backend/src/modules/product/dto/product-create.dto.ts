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
  CakeSizeDisplayName,
} from "@apps/backend/modules/product/constants/product.constants";
import { SWAGGER_EXAMPLES as STORE_SWAGGER_EXAMPLES } from "@apps/backend/modules/store/constants/store.constants";
import { SWAGGER_EXAMPLES as PRODUCT_SWAGGER_EXAMPLES } from "@apps/backend/modules/product/constants/product.constants";

/**
 * 케이크 사이즈 옵션 DTO (생성용 - id 선택적)
 */
export class CreateCakeSizeOptionDto {
  @ApiPropertyOptional({
    description: "옵션 고유 ID (신규 생성 시 생략 가능, 백엔드에서 자동 생성)",
    example: "size_abcd1234",
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: "노출 여부",
    enum: EnableStatus,
    example: EnableStatus.ENABLE,
  })
  @IsNotEmpty()
  @IsEnum(EnableStatus)
  visible: EnableStatus;

  @ApiProperty({
    description: "표시명",
    enum: CakeSizeDisplayName,
    example: CakeSizeDisplayName.MINI,
  })
  @IsNotEmpty()
  @IsEnum(CakeSizeDisplayName)
  displayName: CakeSizeDisplayName;

  @ApiProperty({
    description: "케이크 지름/길이 (cm 단위, 숫자만)",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.cakeSizeOptions[0].lengthCm,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  lengthCm: number;

  @ApiProperty({
    description: "해당 사이즈의 가격",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.cakeSizeOptions[0].price,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: "설명",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.cakeSizeOptions[0].description,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * 케이크 맛 옵션 DTO (생성용 - id 선택적)
 */
export class CreateCakeFlavorOptionDto {
  @ApiPropertyOptional({
    description: "옵션 고유 ID (신규 생성 시 생략 가능, 백엔드에서 자동 생성)",
    example: "flavor_efgh5678",
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: "노출 여부",
    enum: EnableStatus,
    example: EnableStatus.ENABLE,
  })
  @IsNotEmpty()
  @IsEnum(EnableStatus)
  visible: EnableStatus;

  @ApiProperty({
    description: "표시명",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.cakeFlavorOptions[0].displayName,
  })
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @ApiProperty({
    description: "해당 맛 옵션의 추가 가격",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.cakeFlavorOptions[0].price,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;
}

/**
 * 상품 등록 요청 DTO
 */
export class CreateProductRequestDto {
  @ApiProperty({
    description: "스토어 ID",
    example: STORE_SWAGGER_EXAMPLES.ID,
  })
  @IsNotEmpty()
  @IsString()
  storeId: string;

  @ApiProperty({
    description: "상품명",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.name,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "이미지 URL 목록 (첫 번째 요소가 대표 이미지, 필수)",
    isArray: true,
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.images,
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({
    description: "정가",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.originalPrice,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  originalPrice: number;

  @ApiProperty({
    description: "판매가",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.salePrice,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiProperty({
    description: "판매여부",
    enum: EnableStatus,
    example: EnableStatus.ENABLE,
  })
  @IsNotEmpty()
  @IsEnum(EnableStatus)
  salesStatus: EnableStatus;

  @ApiProperty({
    description: "노출여부",
    enum: EnableStatus,
    example: EnableStatus.ENABLE,
  })
  @IsNotEmpty()
  @IsEnum(EnableStatus)
  visibilityStatus: EnableStatus;

  @ApiPropertyOptional({
    description: "케이크 옵션 - 사이즈 목록",
    type: [CreateCakeSizeOptionDto],
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.cakeSizeOptions,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCakeSizeOptionDto)
  cakeSizeOptions?: CreateCakeSizeOptionDto[];

  @ApiPropertyOptional({
    description: "케이크 옵션 - 맛 목록",
    type: [CreateCakeFlavorOptionDto],
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.cakeFlavorOptions,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCakeFlavorOptionDto)
  cakeFlavorOptions?: CreateCakeFlavorOptionDto[];

  @ApiPropertyOptional({
    description: "레터링 문구 사용 여부",
    enum: EnableStatus,
    example: EnableStatus.ENABLE,
  })
  @IsNotEmpty()
  @IsEnum(EnableStatus)
  letteringVisible: EnableStatus;

  @ApiPropertyOptional({
    description: "레터링 문구 사용 (필수/선택)",
    enum: OptionRequired,
    example: OptionRequired.REQUIRED,
  })
  @IsNotEmpty()
  @IsEnum(OptionRequired)
  letteringRequired: OptionRequired;

  @ApiPropertyOptional({
    description: "레터링 최대 글자 수",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.letteringMaxLength,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  letteringMaxLength: number;

  @ApiPropertyOptional({
    description: "이미지 등록 사용여부",
    enum: EnableStatus,
    example: EnableStatus.ENABLE,
  })
  @IsNotEmpty()
  @IsEnum(EnableStatus)
  imageUploadEnabled: EnableStatus;

  @ApiPropertyOptional({
    description: "상세 설명 (HTML)",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.detailDescription,
  })
  @IsOptional()
  @IsString()
  detailDescription?: string;

  @ApiPropertyOptional({
    description:
      "상품 카테고리 타입 (없거나 여러 개) - 생일, 연인, 친구, 가족, 기념일, 당일픽업, 레터링, 캐릭터, 심플, 꽃, 사진",
    enum: ProductCategoryType,
    isArray: true,
    example: [ProductCategoryType.BIRTHDAY, ProductCategoryType.SIMPLE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ProductCategoryType, { each: true })
  productCategoryTypes?: ProductCategoryType[];

  @ApiPropertyOptional({
    description: "검색 태그 (없거나 여러 개) - 검색어로 상품 조회 시 상품명과 함께 검색됨",
    type: [String],
    example: ["생일케이크", "초콜릿", "당일배송"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchTags?: string[];

  @ApiProperty({
    description: "식품의 유형",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeFoodType,
  })
  @IsNotEmpty()
  @IsString()
  productNoticeFoodType: string;

  @ApiProperty({
    description: "제조사",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeProducer,
  })
  @IsNotEmpty()
  @IsString()
  productNoticeProducer: string;

  @ApiProperty({
    description: "원산지",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeOrigin,
  })
  @IsNotEmpty()
  @IsString()
  productNoticeOrigin: string;

  @ApiProperty({
    description: "소재지",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeAddress,
  })
  @IsNotEmpty()
  @IsString()
  productNoticeAddress: string;

  @ApiProperty({
    description: "제조연월일",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeManufactureDate,
  })
  @IsNotEmpty()
  @IsString()
  productNoticeManufactureDate: string;

  @ApiProperty({
    description: "소비기한 또는 품질유지기한",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeExpirationDate,
  })
  @IsNotEmpty()
  @IsString()
  productNoticeExpirationDate: string;

  @ApiProperty({
    description: "포장단위별 용량/수량",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticePackageCapacity,
  })
  @IsNotEmpty()
  @IsString()
  productNoticePackageCapacity: string;

  @ApiProperty({
    description: "포장 단위별 수량",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticePackageQuantity,
  })
  @IsNotEmpty()
  @IsString()
  productNoticePackageQuantity: string;

  @ApiProperty({
    description: "원재료명 및 함량",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeIngredients,
  })
  @IsNotEmpty()
  @IsString()
  productNoticeIngredients: string;

  @ApiProperty({
    description: "영양성분",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeCalories,
  })
  @IsNotEmpty()
  @IsString()
  productNoticeCalories: string;

  @ApiProperty({
    description: "소비자안전을 위한 주의사항",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeSafetyNotice,
  })
  @IsNotEmpty()
  @IsString()
  productNoticeSafetyNotice: string;

  @ApiProperty({
    description: "유전자변형식품에 해당하는 경우의 표시",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeGmoNotice,
  })
  @IsNotEmpty()
  @IsString()
  productNoticeGmoNotice: string;

  @ApiProperty({
    description: "수입식품의 경우",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeImportNotice,
  })
  @IsNotEmpty()
  @IsString()
  productNoticeImportNotice: string;

  @ApiProperty({
    description: "고객센터",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.productNoticeCustomerService,
  })
  @IsNotEmpty()
  @IsString()
  productNoticeCustomerService: string;
}

/**
 * 상품 생성 응답 DTO
 */
export class CreateProductResponseDto {
  @ApiProperty({
    description: "상품 ID",
    example: PRODUCT_SWAGGER_EXAMPLES.PRODUCT_DATA.id,
  })
  id: string;
}
