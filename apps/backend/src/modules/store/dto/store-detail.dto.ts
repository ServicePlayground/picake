import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  SWAGGER_EXAMPLES,
  StoreBankName,
} from "@apps/backend/modules/store/constants/store.constants";
import { SWAGGER_EXAMPLES as BUSINESS_SWAGGER_EXAMPLES } from "@apps/backend/modules/business/constants/business.contants";
import { SWAGGER_EXAMPLES as USER_SWAGGER_EXAMPLES } from "@apps/backend/modules/auth/constants/auth.constants";
import { SWAGGER_EXAMPLES as UPLOAD_SWAGGER_EXAMPLES } from "@apps/backend/modules/upload/constants/upload.constants";
import { StoreAddressDto } from "@apps/backend/modules/store/dto/store-common.dto";
import { StoreBusinessCalendarDto } from "@apps/backend/modules/store/dto/store-business-calendar.dto";
import { RefundCancellationPolicyDto } from "@apps/backend/modules/store/dto/store-refund-cancellation-policy.dto";

/**
 * 스토어 응답 DTO
 */
export class StoreResponseDto extends StoreAddressDto {
  @ApiProperty({
    description: "스토어 ID",
    example: SWAGGER_EXAMPLES.ID,
  })
  id: string;

  @ApiProperty({
    description: "사용자 ID",
    example: USER_SWAGGER_EXAMPLES.CONSUMER_DATA.id,
  })
  userId: string;

  @ApiPropertyOptional({
    description: "스토어 로고 이미지 URL",
    example: UPLOAD_SWAGGER_EXAMPLES.FILE_URL,
  })
  logoImageUrl?: string | null;

  @ApiProperty({
    description: "스토어 이름",
    example: SWAGGER_EXAMPLES.NAME,
  })
  name: string;

  @ApiPropertyOptional({
    description: "스토어 소개",
    example: SWAGGER_EXAMPLES.DESCRIPTION,
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: "스토어 연락처 (전화/휴대폰)",
    example: SWAGGER_EXAMPLES.PHONE_NUMBER,
  })
  phoneNumber?: string | null;

  @ApiPropertyOptional({
    description: "카카오채널 ID",
    example: SWAGGER_EXAMPLES.KAKAO_CHANNEL_ID,
  })
  kakaoChannelId?: string | null;

  @ApiPropertyOptional({
    description: "인스타그램 ID",
    example: SWAGGER_EXAMPLES.INSTAGRAM_ID,
  })
  instagramId?: string | null;

  @ApiProperty({
    description: "사업자등록번호",
    example: BUSINESS_SWAGGER_EXAMPLES.B_NO,
  })
  businessNo: string;

  @ApiProperty({
    description: "대표자명",
    example: BUSINESS_SWAGGER_EXAMPLES.P_NM,
  })
  representativeName: string;

  @ApiProperty({
    description: "개업일자",
    example: BUSINESS_SWAGGER_EXAMPLES.START_DT,
  })
  openingDate: string;

  @ApiProperty({
    description: "사업자명",
    example: BUSINESS_SWAGGER_EXAMPLES.B_NM,
  })
  businessName: string;

  @ApiProperty({
    description: "업종",
    example: BUSINESS_SWAGGER_EXAMPLES.B_SECTOR,
  })
  businessSector: string;

  @ApiProperty({
    description: "업태",
    example: BUSINESS_SWAGGER_EXAMPLES.B_TYPE,
  })
  businessType: string;

  @ApiProperty({
    description: "통신판매사업자 인허가관리번호",
    example: BUSINESS_SWAGGER_EXAMPLES.PRMMI_MNNO,
  })
  permissionManagementNumber: string;

  @ApiPropertyOptional({
    description: "정산 계좌번호",
    example: SWAGGER_EXAMPLES.BANK_ACCOUNT_NUMBER,
  })
  bankAccountNumber?: string | null;

  @ApiPropertyOptional({
    description: "정산 계좌 은행 코드",
    enum: StoreBankName,
    example: SWAGGER_EXAMPLES.BANK_NAME,
  })
  bankName?: StoreBankName | null;

  @ApiPropertyOptional({
    description: "정산 계좌 예금주명",
    example: SWAGGER_EXAMPLES.ACCOUNT_HOLDER_NAME,
  })
  accountHolderName?: string | null;

  // 주소/위치는 StoreAddressDto 상속

  @ApiProperty({
    description: "좋아요 수",
    example: 25,
  })
  likeCount: number;

  @ApiPropertyOptional({
    description: "좋아요 여부 (로그인한 사용자의 경우에만 제공)",
    example: true,
  })
  isLiked?: boolean | null;

  @ApiProperty({
    description: "평균 별점 (해당 스토어의 모든 상품 후기들의 평균 별점)",
    example: 4.5,
  })
  averageRating: number;

  @ApiProperty({
    description: "전체 후기 개수 (해당 스토어의 모든 상품 후기 개수)",
    example: 42,
  })
  totalReviewCount: number;

  @ApiProperty({
    description: "해당 스토어의 모든 상품 대표이미지 URL 배열 (상품당 1장)",
    type: [String],
    example: [
      "https://s3.ap-northeast-1.amazonaws.com/picake-uploads/uploads/product1.png",
      "https://s3.ap-northeast-1.amazonaws.com/picake-uploads/uploads/product2.png",
    ],
  })
  productRepresentativeImageUrls: string[];

  @ApiPropertyOptional({
    description: "해당 스토어 상품 중 최소 금액 (노출·판매중인 상품만, 없으면 null)",
    example: 25000,
    nullable: true,
  })
  minProductPrice?: number | null;

  @ApiProperty({
    description:
      "영업 캘린더(정기 휴무 요일, 표준 영업 시간, 날짜별 예외). Asia/Seoul 기준. 표준이 00:00~00:00이면 하루 전체 영업, 그 외에는 종료 시각은 픽업 구간 상한(미포함).",
    type: StoreBusinessCalendarDto,
  })
  businessCalendar: StoreBusinessCalendarDto;

  @ApiProperty({
    description:
      "환불·취소 규정. `rules` 배열에 단계별로 픽업 N일 전(N=0이면 당일)과 조건 문구를 둡니다.",
    type: RefundCancellationPolicyDto,
    example: SWAGGER_EXAMPLES.REFUND_CANCELLATION_POLICY,
  })
  refundCancellationPolicy: RefundCancellationPolicyDto;

  @ApiProperty({
    description: "생성일시",
    example: SWAGGER_EXAMPLES.CREATED_AT,
  })
  createdAt: Date;

  @ApiProperty({
    description: "수정일시",
    example: SWAGGER_EXAMPLES.CREATED_AT,
  })
  updatedAt: Date;
}
