import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import {
  OrderStatus,
  SellerVerificationStatus,
} from "@apps/backend/infra/database/prisma/generated/client";
import { PaginationMetaResponseDto } from "@apps/backend/common/dto/pagination-response.dto";
import {
  MEMBER_STATUS_FILTER_VALUES,
  type MemberStatusFilter,
} from "@apps/backend/modules/member-management/constants/member-management.constants";
import { StoreBankName } from "@apps/backend/modules/store/constants/store.constants";

/**
 * 스토어 목록 조회 쿼리 DTO
 */
export class StoreManagementListQueryDto {
  @ApiPropertyOptional({ description: "페이지 번호 (1부터 시작)", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "페이지당 항목 수", default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "검색어 (스토어명·사업자명·사업자번호·스토어 연락처·판매자 이름·닉네임·휴대폰)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  search?: string;

  @ApiPropertyOptional({
    description: "판매자 상태 필터 (ACTIVE: 활성, INACTIVE: 비활성, WITHDRAWN: 탈퇴)",
    enum: MEMBER_STATUS_FILTER_VALUES,
  })
  @IsOptional()
  @IsIn(MEMBER_STATUS_FILTER_VALUES)
  sellerStatus?: MemberStatusFilter;
}

/** 스토어에 연결된 판매자 요약 */
export class StoreManagementSellerDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: "휴대폰 번호" })
  phone: string;

  @ApiProperty({ nullable: true })
  name: string | null;

  @ApiProperty({ nullable: true })
  nickname: string | null;

  @ApiProperty({ description: "활성 여부" })
  isActive: boolean;

  @ApiProperty({ nullable: true, description: "탈퇴 일시 (null이면 미탈퇴)" })
  withdrawnAt: Date | null;

  @ApiProperty({ description: "판매자 검증 상태", enum: SellerVerificationStatus })
  sellerVerificationStatus: SellerVerificationStatus;

  @ApiPropertyOptional({ description: "판매자 가입일시 (상세 조회 시 포함)" })
  createdAt?: Date;
}

/**
 * 스토어 목록 항목 응답 DTO
 */
export class StoreManagementItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: "스토어명" })
  name: string;

  @ApiProperty({ nullable: true, description: "로고 이미지 URL" })
  logoImageUrl: string | null;

  @ApiProperty({ nullable: true, description: "스토어 연락처" })
  phoneNumber: string | null;

  @ApiProperty({ nullable: true, description: "지번 주소" })
  address: string | null;

  @ApiProperty({ nullable: true, description: "도로명 주소" })
  roadAddress: string | null;

  @ApiProperty({ nullable: true, description: "상세주소" })
  detailAddress: string | null;

  @ApiProperty({ description: "사업자등록번호" })
  businessNo: string;

  @ApiProperty({ description: "사업자명" })
  businessName: string;

  @ApiProperty({ description: "대표자명" })
  representativeName: string;

  @ApiProperty({ description: "좋아요 수" })
  likeCount: number;

  @ApiProperty({ description: "등록 상품 수" })
  productCount: number;

  @ApiProperty({ description: "누적 주문 수 (모든 상태)" })
  orderCount: number;

  @ApiProperty({ description: "소유 판매자", type: StoreManagementSellerDto })
  seller: StoreManagementSellerDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

/**
 * 스토어 목록 조회 응답 DTO
 */
export class StoreManagementListResponseDto {
  @ApiProperty({ description: "스토어 목록", type: [StoreManagementItemResponseDto] })
  data: StoreManagementItemResponseDto[];

  @ApiProperty({ description: "페이지네이션 메타 정보", type: PaginationMetaResponseDto })
  meta: PaginationMetaResponseDto;
}

/** 주문 상태별 건수 */
export class StoreManagementOrderStatusCountDto {
  @ApiProperty({ description: "주문 상태", enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ description: "건수" })
  count: number;
}

/** 최근 기간 주문·매출 */
export class StoreManagementRecentPeriodStatDto {
  @ApiProperty({ description: "전체 주문 수 (모든 상태)" })
  orders: number;

  @ApiProperty({ description: "픽업 완료 주문 수" })
  completedOrders: number;

  @ApiProperty({ description: "GMV(원). 픽업 완료 주문의 총 금액 합" })
  gmv: number;
}

/** 매출 상위 상품 */
export class StoreManagementTopProductStatDto {
  @ApiProperty()
  productId: string;

  @ApiProperty({ description: "상품명 (주문 스냅샷)" })
  productName: string;

  @ApiProperty({ description: "매출(원). 픽업 완료 기준" })
  revenue: number;

  @ApiProperty({ description: "주문 수. 픽업 완료 기준" })
  orderCount: number;
}

/** 스토어 상세 통계 */
export class StoreManagementStatisticsDto {
  @ApiProperty({ description: "전체 주문 수 (모든 상태)" })
  totalOrders: number;

  @ApiProperty({ description: "픽업 완료 주문 수" })
  completedOrders: number;

  @ApiProperty({ description: "GMV(원). 픽업 완료 주문의 총 금액 합" })
  gmv: number;

  @ApiProperty({
    description: "주문 상태별 건수",
    type: [StoreManagementOrderStatusCountDto],
  })
  byStatus: StoreManagementOrderStatusCountDto[];

  @ApiProperty({
    description: "최근 7일(오늘 포함, Asia/Seoul) 주문·매출",
    type: StoreManagementRecentPeriodStatDto,
  })
  last7Days: StoreManagementRecentPeriodStatDto;

  @ApiProperty({
    description: "최근 30일(오늘 포함, Asia/Seoul) 주문·매출",
    type: StoreManagementRecentPeriodStatDto,
  })
  last30Days: StoreManagementRecentPeriodStatDto;

  @ApiProperty({
    description: "매출 상위 상품 (픽업 완료 기준)",
    type: [StoreManagementTopProductStatDto],
  })
  topProductsByRevenue: StoreManagementTopProductStatDto[];
}

/**
 * 스토어 상세 응답 DTO
 */
export class StoreManagementDetailResponseDto extends StoreManagementItemResponseDto {
  @ApiProperty({ nullable: true, description: "스토어 소개" })
  description: string | null;

  @ApiProperty({ nullable: true, description: "우편번호" })
  zonecode: string | null;

  @ApiProperty({ nullable: true, description: "위도" })
  latitude: number | null;

  @ApiProperty({ nullable: true, description: "경도" })
  longitude: number | null;

  @ApiProperty({ description: "개업일자" })
  openingDate: string;

  @ApiProperty({ description: "업종" })
  businessSector: string;

  @ApiProperty({ description: "업태" })
  businessType: string;

  @ApiProperty({ description: "통신판매사업자 인허가관리번호" })
  permissionManagementNumber: string;

  @ApiProperty({ nullable: true, description: "정산 계좌번호" })
  bankAccountNumber: string | null;

  @ApiProperty({ nullable: true, description: "정산 계좌 은행 코드", enum: StoreBankName })
  bankName: StoreBankName | null;

  @ApiProperty({ nullable: true, description: "정산 계좌 예금주명" })
  accountHolderName: string | null;

  @ApiProperty({ nullable: true, description: "카카오채널 ID" })
  kakaoChannelId: string | null;

  @ApiProperty({ nullable: true, description: "인스타그램 ID" })
  instagramId: string | null;

  @ApiProperty({ description: "피드 수" })
  feedCount: number;

  @ApiProperty({
    description: "스토어 단위 주문·매출 통계 (GMV는 픽업 완료 기준)",
    type: StoreManagementStatisticsDto,
  })
  statistics: StoreManagementStatisticsDto;
}
