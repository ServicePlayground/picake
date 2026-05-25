import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, MinLength, MaxLength, IsUrl } from "class-validator";
import { IsValidKoreanPhone } from "@apps/backend/common/decorators/validators.decorator";
import { SellerVerificationStatus } from "@apps/backend/infra/database/prisma/generated/client";
import {
  SWAGGER_EXAMPLES,
  SWAGGER_DESCRIPTIONS,
} from "@apps/backend/modules/auth/constants/auth.constants";

/**
 * 마이페이지 — 프로필 부분 수정 (PATCH)
 * 전달된 필드만 갱신합니다. 구매자·판매자 API 모두 동일 스키마입니다.
 */
export class UpdateMypageProfileRequestDto {
  @ApiPropertyOptional({
    description: `${SWAGGER_DESCRIPTIONS.DISPLAY_NAME} (실명 등, 비어 있지 않은 문자열)`,
    example: SWAGGER_EXAMPLES.CONSUMER_DATA.name,
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    description: `${SWAGGER_DESCRIPTIONS.NICKNAME} (비어 있지 않은 문자열)`,
    example: SWAGGER_EXAMPLES.CONSUMER_DATA.nickname,
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nickname?: string;

  @ApiPropertyOptional({
    description:
      "프로필 이미지 URL. 업로드 API로 받은 공개 URL. `null`이면 이미지 제거(미설정). 필드를 생략하면 변경 없음.",
    example: SWAGGER_EXAMPLES.CONSUMER_DATA.profileImageUrl,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "") return null;
    return value;
  })
  @IsString()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  profileImageUrl?: string | null;
}

/**
 * 마이페이지 — 휴대폰 번호 변경
 * 새 번호는 `purpose: phone_change`로 사전 인증이 완료된 값이어야 합니다.
 */
export class ChangePhoneRequestDto {
  @ApiProperty({
    description: SWAGGER_DESCRIPTIONS.PHONE,
    example: SWAGGER_EXAMPLES.CONSUMER_DATA.phone,
  })
  @IsString()
  @IsValidKoreanPhone()
  newPhone: string;
}

/**
 * 마이페이지 프로필 조회 응답 — 구매자·판매자 공통 필드
 */
export class MypageProfileBaseResponseDto {
  @ApiProperty({ example: SWAGGER_EXAMPLES.CONSUMER_DATA.id })
  id: string;

  @ApiProperty({ example: SWAGGER_EXAMPLES.CONSUMER_DATA.phone })
  phone: string;

  @ApiProperty({ example: SWAGGER_EXAMPLES.CONSUMER_DATA.name })
  name: string;

  @ApiProperty({ example: SWAGGER_EXAMPLES.CONSUMER_DATA.nickname })
  nickname: string;

  @ApiProperty({ example: SWAGGER_EXAMPLES.CONSUMER_DATA.profileImageUrl })
  profileImageUrl: string;

  @ApiProperty({ example: SWAGGER_EXAMPLES.CONSUMER_DATA.isPhoneVerified })
  isPhoneVerified: boolean;

  @ApiProperty({ example: SWAGGER_EXAMPLES.CONSUMER_DATA.isActive })
  isActive: boolean;

  @ApiProperty({ example: SWAGGER_EXAMPLES.CONSUMER_DATA.googleId })
  googleId: string;

  @ApiProperty({ example: SWAGGER_EXAMPLES.CONSUMER_DATA.googleEmail })
  googleEmail: string;

  @ApiProperty({ example: SWAGGER_EXAMPLES.CONSUMER_DATA.kakaoId })
  kakaoId: string;

  @ApiProperty({ example: SWAGGER_EXAMPLES.CONSUMER_DATA.kakaoEmail })
  kakaoEmail: string;

  @ApiProperty({
    type: String,
    format: "date-time",
    example: SWAGGER_EXAMPLES.CONSUMER_DATA.createdAt,
  })
  createdAt: Date;

  @ApiProperty({
    type: String,
    format: "date-time",
    example: SWAGGER_EXAMPLES.CONSUMER_DATA.lastLoginAt,
  })
  lastLoginAt: Date;
}

/**
 * 구매자 마이페이지 — 프로필 조회 응답
 */
export class ConsumerMypageProfileResponseDto extends MypageProfileBaseResponseDto {
  @ApiProperty({
    description: "주문 푸시 알림 수신 여부",
    example: true,
  })
  pushNotificationsEnabled: boolean;

  @ApiProperty({
    description: "동의한 서비스 이용약관 버전 (미동의 시 null)",
    nullable: true,
    example: "1.0",
  })
  agreedTermsVersion: string | null;

  @ApiProperty({
    description: "동의한 개인정보 처리방침 버전 (미동의 시 null)",
    nullable: true,
    example: "1.0",
  })
  agreedPrivacyVersion: string | null;

  @ApiProperty({
    description: "동의한 개인정보 제3자 제공 동의 버전 (미동의 시 null)",
    nullable: true,
    example: "1.0",
  })
  agreedThirdPartyVersion: string | null;

  @ApiProperty({
    description: "동의한 위치기반서비스 이용약관 버전 (선택 동의 — 미동의 시 null)",
    nullable: true,
    example: null,
  })
  agreedLocationTermsVersion: string | null;
}

/**
 * 판매자 마이페이지 — 프로필 조회 응답
 */
export class SellerMypageProfileResponseDto extends MypageProfileBaseResponseDto {
  @ApiProperty({
    enum: SellerVerificationStatus,
    example: SWAGGER_EXAMPLES.SELLER_DATA.sellerVerificationStatus,
    description: "판매자 온보딩·사업자 검증 단계",
  })
  sellerVerificationStatus: SellerVerificationStatus;

  @ApiProperty({
    description: "동의한 서비스 이용약관 버전 (미동의 시 null)",
    nullable: true,
    example: "1.0",
  })
  agreedTermsVersion: string | null;

  @ApiProperty({
    description: "동의한 개인정보 처리방침 버전 (미동의 시 null)",
    nullable: true,
    example: "1.0",
  })
  agreedPrivacyVersion: string | null;
}
