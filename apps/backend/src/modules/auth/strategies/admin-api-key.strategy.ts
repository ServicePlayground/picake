import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy as CustomStrategy } from "passport-custom";
import { Request } from "express";
import { AdminApiKeyService } from "@apps/backend/modules/admin-api-key/services/admin-api-key.service";
import { ADMIN_API_KEY_HEADER } from "@apps/backend/modules/admin-api-key/constants/admin-api-key.constants";
import { AUDIENCE, TOKEN_TYPES } from "@apps/backend/modules/auth/constants/auth.constants";
import { AuthenticatedUser } from "@apps/backend/modules/auth/types/auth.types";

/**
 * 관리자 API 키 전략 (passport-custom)
 *
 * `x-admin-api-key` 헤더로 들어온 원문 키를 검증해, 통과하면 사람 admin JWT와 동일한 형태
 * (`aud: admin`, `type: access`)의 `req.user`를 만듭니다 — 그래야 `@Auth({ audiences: [AUDIENCE.ADMIN] })`가
 * 걸린 기존 admin 컨트롤러 전부가 코드 변경 없이 API 키도 그대로 허용합니다.
 * `isApiKey: true`만 추가로 실어서, API 키 자체의 발급/폐기처럼 사람 전용이어야 하는 엔드포인트가
 * 이 값으로 API 키 요청을 구분해 차단할 수 있게 합니다.
 *
 * 헤더가 없거나 키가 유효하지 않으면 `false`를 반환해 인증 "실패"로만 처리합니다 — 이렇게 해야
 * `AuthGuard`가 체이닝된 다음 전략(`jwt`)으로 계속 시도할 수 있습니다.
 */
@Injectable()
export class AdminApiKeyStrategy extends PassportStrategy(CustomStrategy, "admin-api-key") {
  constructor(private readonly adminApiKeyService: AdminApiKeyService) {
    super();
  }

  async validate(req: Request): Promise<AuthenticatedUser | false> {
    const rawKey = req.headers[ADMIN_API_KEY_HEADER];
    if (!rawKey || typeof rawKey !== "string") {
      return false;
    }

    const key = await this.adminApiKeyService.validateKey(rawKey);
    if (!key) {
      return false;
    }

    return {
      sub: key.id,
      id: key.id,
      aud: AUDIENCE.ADMIN,
      type: TOKEN_TYPES.ACCESS,
      username: `api-key:${key.label}`,
      isApiKey: true,
    };
  }
}
