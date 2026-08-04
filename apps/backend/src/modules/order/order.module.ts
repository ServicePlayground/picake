import { Module } from "@nestjs/common";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";
import { NotificationModule } from "@apps/backend/modules/notification/notification.module";
import { OrderService } from "@apps/backend/modules/order/order.service";
import { OrderCreateService } from "@apps/backend/modules/order/services/order-create.service";
import { OrderDetailService } from "@apps/backend/modules/order/services/order-detail.service";
import { OrderSellerListService } from "@apps/backend/modules/order/services/order-seller-list.service";
import { OrderSellerActionService } from "@apps/backend/modules/order/services/order-seller-action.service";
import { OrderUserListService } from "@apps/backend/modules/order/services/order-user-list.service";
import { OrderAutomationService } from "@apps/backend/modules/order/services/order-automation.service";
import { OrderUserActionService } from "@apps/backend/modules/order/services/order-user-action.service";
import { OrderAdminActionService } from "@apps/backend/modules/order/services/order-admin-action.service";
import { OrderUserReservationEditService } from "@apps/backend/modules/order/services/order-user-reservation-edit.service";
import { OrderLifecycleHookService } from "@apps/backend/modules/order/services/order-lifecycle-hook.service";

/**
 * 주문 모듈
 * 주문 관련 기능을 제공합니다.
 */
@Module({
  imports: [DatabaseModule, NotificationModule],
  providers: [
    OrderLifecycleHookService,
    OrderAutomationService,
    OrderCreateService,
    OrderDetailService,
    OrderSellerListService,
    OrderSellerActionService,
    OrderUserActionService,
    OrderAdminActionService,
    OrderUserReservationEditService,
    OrderUserListService,
    OrderService,
  ],
  exports: [OrderService],
})
export class OrderModule {}
