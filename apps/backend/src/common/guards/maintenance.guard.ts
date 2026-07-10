import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { API_RESPONSE_MESSAGES } from "@apps/backend/common/constants/app.constants";
import { isServiceMaintenanceMode } from "@apps/backend/common/utils/maintenance.util";

/**
 * 서비스 점검 모드일 때 모든 HTTP API 요청을 차단합니다.
 * `/health` 는 main.ts 에서 별도 처리되므로 이 가드의 대상이 아닙니다.
 */
@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(_context: ExecutionContext): boolean {
    if (isServiceMaintenanceMode(this.configService)) {
      throw new ServiceUnavailableException(API_RESPONSE_MESSAGES.SERVICE_UNAVAILABLE);
    }

    return true;
  }
}
