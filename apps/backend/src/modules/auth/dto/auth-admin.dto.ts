import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MinLength, MaxLength, IsNotEmpty } from "class-validator";
import {
  AUTH_ERROR_MESSAGES,
  SWAGGER_DESCRIPTIONS,
  SWAGGER_EXAMPLES,
} from "@apps/backend/modules/auth/constants/auth.constants";

export class AdminRegisterRequestDto {
  @ApiProperty({
    description: SWAGGER_DESCRIPTIONS.ADMIN_USERNAME,
    example: SWAGGER_EXAMPLES.ADMIN_DATA.username,
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9_]{4,20}$/, {
    message: AUTH_ERROR_MESSAGES.USER_ID_INVALID_FORMAT,
  })
  username: string;

  @ApiProperty({
    description: SWAGGER_DESCRIPTIONS.ADMIN_PASSWORD,
    example: "SeedAdmin@1234",
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: AUTH_ERROR_MESSAGES.PASSWORD_INVALID_FORMAT,
  })
  password: string;
}

export class AdminLoginRequestDto {
  @ApiProperty({
    description: SWAGGER_DESCRIPTIONS.ADMIN_USERNAME,
    example: SWAGGER_EXAMPLES.ADMIN_DATA.username,
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: SWAGGER_DESCRIPTIONS.ADMIN_PASSWORD, example: "SeedAdmin@1234" })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AdminTotpVerifyLoginRequestDto {
  @ApiProperty({ description: "로그인 1단계에서 받은 totpPendingToken" })
  @IsString()
  @IsNotEmpty()
  totpPendingToken: string;

  @ApiProperty({
    description: SWAGGER_DESCRIPTIONS.VERIFICATION_CODE + " (Google Authenticator)",
    example: SWAGGER_EXAMPLES.VERIFICATION_CODE,
  })
  @IsString()
  @Matches(/^\d{6}$/, { message: AUTH_ERROR_MESSAGES.VERIFICATION_CODE_INVALID_FORMAT })
  totpCode: string;
}

export class AdminTotpEnableRequestDto {
  @ApiProperty({
    description: SWAGGER_DESCRIPTIONS.VERIFICATION_CODE + " (TOTP 활성화 확인)",
    example: SWAGGER_EXAMPLES.VERIFICATION_CODE,
  })
  @IsString()
  @Matches(/^\d{6}$/, { message: AUTH_ERROR_MESSAGES.VERIFICATION_CODE_INVALID_FORMAT })
  totpCode: string;
}
