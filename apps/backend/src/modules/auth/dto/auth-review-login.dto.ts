import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IsValidVerificationCode } from "@apps/backend/common/decorators/validators.decorator";
import { SWAGGER_EXAMPLES } from "@apps/backend/modules/auth/constants/auth.constants";

/**
 * 앱스토어/플레이스토어 심사(리뷰) 전용 로그인 요청 DTO
 */
export class ReviewLoginRequestDto {
  @ApiProperty({
    description: "심사용 로그인 코드 (6자리 숫자, `APP_REVIEW_LOGIN_CODE`와 일치해야 함)",
    example: SWAGGER_EXAMPLES.VERIFICATION_CODE,
  })
  @IsString()
  @IsValidVerificationCode()
  code: string;
}
