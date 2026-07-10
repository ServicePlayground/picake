import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";
import { NotificationService } from "@apps/backend/modules/notification/services/notification.service";
import { NotificationOrderDispatchService } from "@apps/backend/modules/notification/services/notification-order-dispatch.service";
import { NotificationGateway } from "@apps/backend/modules/notification/gateways/notification.gateway";
import { FcmModule } from "@apps/backend/modules/fcm/fcm.module";
import { SolapiModule } from "@apps/backend/modules/solapi/solapi.module";

/**
 * 주문 알림 모듈
 * - NotificationService: 알림 저장·목록·설정·읽음 처리
 * - NotificationOrderDispatchService: 주문 상태 전환 → Socket.IO + FCM + 카카오 알림톡 발송
 * - NotificationGateway: Socket.IO `/notifications` (판매자·구매자)
 */
@Module({
  imports: [DatabaseModule, JwtModule, ConfigModule, FcmModule, SolapiModule],
  providers: [NotificationService, NotificationGateway, NotificationOrderDispatchService],
  exports: [NotificationService, NotificationOrderDispatchService],
})
export class NotificationModule {}
