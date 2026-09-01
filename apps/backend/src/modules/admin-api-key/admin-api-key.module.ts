import { Module } from "@nestjs/common";
import { AdminApiKeyService } from "@apps/backend/modules/admin-api-key/services/admin-api-key.service";

/**
 * 관리자 API 키 모듈
 *
 * 사람 로그인(ID/PW+OTP) 없이 자동화/AI가 관리자 API를 호출할 수 있게 하는 전용 토큰을 발급·검증합니다.
 * `AuthModule`(인증 전략)과 `AdminApiModule`(발급/폐기 컨트롤러) 양쪽에서 임포트합니다.
 */
@Module({
  providers: [AdminApiKeyService],
  exports: [AdminApiKeyService],
})
export class AdminApiKeyModule {}
