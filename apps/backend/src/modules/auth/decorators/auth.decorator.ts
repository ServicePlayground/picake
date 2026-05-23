import { applyDecorators, UseGuards, SetMetadata } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import {
  AuthGuard,
  AUTH_METADATA_KEY,
  AuthMetadata,
} from "@apps/backend/modules/auth/guards/auth.guard";
import type { AudienceConst } from "@apps/backend/modules/auth/constants/auth.constants";

/**
 * @param options.audiences - 허용 JWT aud. 예: 구매자(Consumer) API만 `['consumer']`, 판매자만 `['seller']`
 * @param options.jwtTypes - 허용 JWT `type` 클레임. 생략 시 액세스 토큰만 (`access`)
 */
export function Auth(options: {
  isPublic?: boolean;
  isOptionalPublic?: boolean;
  audiences?: AudienceConst[];
  jwtTypes?: readonly string[];
}) {
  const { isPublic, isOptionalPublic, audiences, jwtTypes } = options;

  // isOptionalPublic이 true이면 isPublic도 자동으로 true로 처리
  const finalIsPublic = isOptionalPublic ? true : (isPublic ?? false);

  const authMetadata: AuthMetadata = {
    isPublic: finalIsPublic,
    isOptionalPublic,
    audiences,
    jwtTypes,
  };

  const decorators = [];
  decorators.push(SetMetadata(AUTH_METADATA_KEY, authMetadata));

  // Public이 아니거나 OptionalPublic인 경우 통합 가드 적용
  if (!finalIsPublic || isOptionalPublic) {
    // 사용자 요청 → Controller → @Auth 데코레이터 → AuthGuard → Passport → JwtStrategy → validate() → req.user
    decorators.push(UseGuards(AuthGuard));
    // Swagger UI에서 Bearer 토큰 인증 지원
    // Public이 아닌 모든 엔드포인트(인증 필요 또는 선택적 인증)에서 토큰 입력 가능하도록
    decorators.push(ApiBearerAuth("JWT-auth"));
  }

  return applyDecorators(...decorators);
}
