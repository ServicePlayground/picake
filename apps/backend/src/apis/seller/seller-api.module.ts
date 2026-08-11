import { Module } from "@nestjs/common";
import { AuthModule } from "@apps/backend/modules/auth/auth.module";
import { ProductModule } from "@apps/backend/modules/product/product.module";
import { SellerProductController } from "./controllers/product.controller";
import { BusinessModule } from "@apps/backend/modules/business/business.module";
import { SellerBusinessController } from "./controllers/business.controller";
import { StoreModule } from "@apps/backend/modules/store/store.module";
import { SellerStoreController } from "@apps/backend/apis/seller/controllers/store.controller";
import { FeedModule } from "@apps/backend/modules/feed/feed.module";
import { SellerFeedController } from "./controllers/feed.controller";
import { OrderModule } from "@apps/backend/modules/order/order.module";
import { StatisticsModule } from "@apps/backend/modules/statistics/statistics.module";
import { NotificationModule } from "@apps/backend/modules/notification/notification.module";
import { SellerOrderController } from "@apps/backend/apis/seller/controllers/order.controller";
import { SellerStatisticsController } from "@apps/backend/apis/seller/controllers/statistics.controller";
import { SellerNotificationController } from "@apps/backend/apis/seller/controllers/notification.controller";
import { SellerHomeController } from "@apps/backend/apis/seller/controllers/home.controller";
import { SellerAuthController } from "@apps/backend/apis/seller/controllers/auth.controller";
import { SellerMypageController } from "@apps/backend/apis/seller/controllers/mypage.controller";
import { SellerHomeModule } from "@apps/backend/modules/seller-home/seller-home.module";
import { UploadModule } from "@apps/backend/modules/upload/upload.module";
import { SellerUploadController } from "@apps/backend/apis/seller/controllers/upload.controller";
import { TermsModule } from "@apps/backend/modules/terms/terms.module";
import { SellerTermsController } from "@apps/backend/apis/seller/controllers/terms.controller";
import { ChatModule } from "@apps/backend/modules/chat/chat.module";
import { SellerChatController } from "@apps/backend/apis/seller/controllers/chat.controller";
import { AiAssistantModule } from "@apps/backend/modules/ai-assistant/ai-assistant.module";
import { SellerAiAssistantController } from "@apps/backend/apis/seller/controllers/ai-assistant.controller";
import { CustomOrderModule } from "@apps/backend/modules/custom-order/custom-order.module";
import { SellerCustomOrderRequestController } from "@apps/backend/apis/seller/controllers/custom-order-request.controller";

/**
 * Seller API 모듈
 *
 * Seller 관련 API를 제공합니다.
 */
@Module({
  imports: [
    UploadModule,
    AuthModule,
    BusinessModule,
    SellerHomeModule,
    StoreModule,
    ProductModule,
    FeedModule,
    OrderModule,
    StatisticsModule,
    NotificationModule,
    TermsModule,
    ChatModule,
    AiAssistantModule,
    CustomOrderModule,
  ],
  controllers: [
    SellerUploadController,
    SellerAuthController,
    SellerBusinessController,
    SellerHomeController,
    SellerStoreController,
    SellerProductController,
    SellerOrderController,
    SellerFeedController,
    SellerStatisticsController,
    SellerNotificationController,
    SellerMypageController,
    SellerTermsController,
    SellerChatController,
    SellerAiAssistantController,
    SellerCustomOrderRequestController,
  ],
})
export class SellerApiModule {}
