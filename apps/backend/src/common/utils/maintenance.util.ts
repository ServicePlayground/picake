import { ConfigService } from "@nestjs/config";

/**
 * 서비스 점검(유지보수) 모드 여부를 확인합니다.
 * `SERVICE_MAINTENANCE_MODE=true` 일 때 모든 API·WebSocket 요청을 차단합니다.
 */
export function isServiceMaintenanceMode(configService: ConfigService): boolean {
  return configService.get<string>("SERVICE_MAINTENANCE_MODE", "false") === "true";
}
