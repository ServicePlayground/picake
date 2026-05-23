import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateIf,
  Matches,
} from "class-validator";
import { IsValidRegionsParam } from "@apps/backend/modules/store/decorators/validators.decorator";
import {
  OptionalStringToNumber,
  OptionalStringToArray,
} from "@apps/backend/common/decorators/transform.decorator";
import { PaginationMetaResponseDto } from "@apps/backend/common/dto/pagination-response.dto";
import { PaginationRequestDto } from "@apps/backend/common/dto/pagination-request.dto";
import { StoreResponseDto } from "./store-detail.dto";
import {
  StoreSortBy,
  StoreMapPickupPeriodKind,
  SWAGGER_EXAMPLES,
} from "@apps/backend/modules/store/constants/store.constants";
import {
  ProductCategoryType,
  CakeSizeDisplayName,
} from "@apps/backend/modules/product/constants/product.constants";

/**
 * 사용자용 스토어 목록 조회 요청 DTO
 */
export class GetStoresRequestDto extends PaginationRequestDto {
  @ApiPropertyOptional({
    description:
      "검색어 (스토어명·해당 스토어 노출·판매 중 상품의 상품명·검색 태그. 태그는 `#` 유무와 관계없이 일치)",
    example: SWAGGER_EXAMPLES.NAME,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "정렬",
    enum: StoreSortBy,
    example: StoreSortBy.POPULAR,
  })
  @IsOptional()
  @IsEnum(StoreSortBy)
  sortBy?: StoreSortBy;

  @ApiPropertyOptional({
    description:
      "(필터) 지역. 해당 파라미터를 비워두면 전국 스토어를 조회합니다." +
      "GET /store/regions 응답의 depth1·depth2 searchKeywords를 조합해 전달합니다. " +
      "'depth1키워드:depth2키워드' 쌍을 쉼표로 구분." +
      "2depth가 복수 키워드(예: 강화·옹진)면 각 searchKeywords마다 한 쌍으로 보냅니다. " +
      "예시: '전지역', '전지역:전지역', '서울:전지역', '서울:전지역,경기:수원시', '경기:수원시,인천:강화군,인천:옹진군'",
    example: "서울:전지역,경기:수원시",
  })
  @IsValidRegionsParam()
  regions?: string;

  @ApiPropertyOptional({
    description:
      "(필터) 케이크 사이즈 표시명. 상품 목록·상품 등록의 cakeSizeOptions.displayName과 동일한 CakeSizeDisplayName enum. " +
      "해당 사이즈 옵션을 가진 상품이 하나라도 있는 스토어만 조회.",
    enum: CakeSizeDisplayName,
    isArray: true,
    example: [CakeSizeDisplayName.DOSIRAK, CakeSizeDisplayName.SIZE_1],
  })
  @IsOptional()
  @OptionalStringToArray()
  @IsArray()
  @IsEnum(CakeSizeDisplayName, { each: true })
  sizes?: CakeSizeDisplayName[];

  @ApiPropertyOptional({
    description:
      "(필터) 최소 가격. 상품의 salePrice가 이 값 이상인 상품이 하나라도 있는 스토어만 조회 (Product.salePrice >= minPrice)",
    example: 10000,
  })
  @OptionalStringToNumber()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description:
      "(필터) 최대 가격. 상품의 salePrice가 이 값 이하인 상품이 하나라도 있는 스토어만 조회 (Product.salePrice <= maxPrice). minPrice와 함께 쓰이면 해당 구간 안에 들어오는 상품이 있는 스토어만 반환 (minPrice <= salePrice <= maxPrice)",
    example: 100000,
  })
  @OptionalStringToNumber()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description:
      "(필터) 상품 카테고리 유형. 상품 목록 조회(GetProductsRequestDto)와 동일한 ProductCategoryType enum. " +
      "해당 유형 중 하나라도 가지는 상품이 있는 스토어만 조회 (레터링, 캐릭터 등).",
    enum: ProductCategoryType,
    isArray: true,
    example: [ProductCategoryType.LETTERING, ProductCategoryType.CHARACTER],
  })
  @IsOptional()
  @OptionalStringToArray()
  @IsArray()
  @IsEnum(ProductCategoryType, { each: true })
  productCategoryTypes?: ProductCategoryType[];

  @ApiPropertyOptional({
    description: "거리순 정렬(sortBy=distance)일 때 필수. 기준점 WGS84 위도(클라이언트 위치 등).",
    example: SWAGGER_EXAMPLES.LATITUDE,
  })
  @ValidateIf((o) => o.sortBy === StoreSortBy.DISTANCE)
  @OptionalStringToNumber()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: "거리순 정렬(sortBy=distance)일 때 필수. 기준점 WGS84 경도(클라이언트 위치 등).",
    example: SWAGGER_EXAMPLES.LONGITUDE,
  })
  @ValidateIf((o) => o.sortBy === StoreSortBy.DISTANCE)
  @OptionalStringToNumber()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({
    description:
      "(필터) 픽업 기준일. 클라이언트 캘린더에서 선택한 연·월·일을 YYYY-MM-DD로 전달합니다. " +
      "`pickupFilterPeriod`와 함께 지정하면 해당 일·구간에 영업 중인 스토어만 반환합니다.",
    example: "2026-04-05",
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  pickupFilterDate?: string;

  @ApiPropertyOptional({
    description:
      "(필터) 픽업 구간. morning=서울 00:00~12:00(정오 미만), afternoon=12:00~24:00(자정 미만) 구간과 " +
      "영업 시간이 겹치는 스토어만. fullday=해당 일 영업(휴무·임시휴무 제외). " +
      "`pickupFilterDate`와 함께 지정해야 합니다.",
    enum: StoreMapPickupPeriodKind,
    example: StoreMapPickupPeriodKind.AFTERNOON,
  })
  @IsOptional()
  @IsEnum(StoreMapPickupPeriodKind)
  pickupFilterPeriod?: StoreMapPickupPeriodKind;
}

/**
 * 판매자용 스토어 목록 조회 요청 DTO (내 스토어 목록)
 */
export class GetSellerStoresRequestDto extends GetStoresRequestDto {}

/**
 * 스토어 목록 조회 응답 DTO
 */
export class StoreListResponseDto {
  @ApiProperty({
    description: "스토어 목록",
    type: [StoreResponseDto],
  })
  data: StoreResponseDto[];

  @ApiProperty({
    description: "페이지네이션 메타 정보",
    type: PaginationMetaResponseDto,
  })
  meta: PaginationMetaResponseDto;
}
