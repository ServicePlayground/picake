import { Module } from "@nestjs/common";
import { ConsumerAuthController } from "@apps/backend/apis/consumer/controllers/auth.controller";
import { ConsumerProductController } from "@apps/backend/apis/consumer/controllers/product.controller";
import { ConsumerUploadController } from "@apps/backend/apis/consumer/controllers/upload.controller";
import { ConsumerStoreController } from "@apps/backend/apis/consumer/controllers/store.controller";
import { ConsumerOrderController } from "@apps/backend/apis/consumer/controllers/order.controller";
import { ConsumerMypageController } from "@apps/backend/apis/consumer/controllers/mypage.controller";
import { AuthModule } from "@apps/backend/modules/auth/auth.module";
import { ProductModule } from "@apps/backend/modules/product/product.module";
import { UploadModule } from "@apps/backend/modules/upload/upload.module";
import { StoreModule } from "@apps/backend/modules/store/store.module";
import { FeedModule } from "@apps/backend/modules/feed/feed.module";
import { ConsumerFeedController } from "@apps/backend/apis/consumer/controllers/feed.controller";
import { ReviewModule } from "@apps/backend/modules/review/review.module";
import { ConsumerReviewController } from "@apps/backend/apis/consumer/controllers/review.controller";
import { LikeModule } from "@apps/backend/modules/like/like.module";
import { ConsumerLikeController } from "@apps/backend/apis/consumer/controllers/like.controller";
import { OrderModule } from "@apps/backend/modules/order/order.module";
import { RecentViewModule } from "@apps/backend/modules/recent-view/recent-view.module";
import { NotificationModule } from "@apps/backend/modules/notification/notification.module";
import { FcmModule } from "@apps/backend/modules/fcm/fcm.module";
import { ConsumerNotificationController } from "@apps/backend/apis/consumer/controllers/notification.controller";
import { ConsumerFcmTokenController } from "@apps/backend/apis/consumer/controllers/fcm-token.controller";
import { HomeBannerModule } from "@apps/backend/modules/home-banner/home-banner.module";
import { ConsumerHomeBannerController } from "@apps/backend/apis/consumer/controllers/home-banner.controller";
import { TermsModule } from "@apps/backend/modules/terms/terms.module";
import { ConsumerTermsController } from "@apps/backend/apis/consumer/controllers/terms.controller";
import { NoticeModule } from "@apps/backend/modules/notice/notice.module";
import { ConsumerNoticeController } from "@apps/backend/apis/consumer/controllers/notice.controller";
import { QnaModule } from "@apps/backend/modules/qna/qna.module";
import { ConsumerQnaController } from "@apps/backend/apis/consumer/controllers/qna.controller";

/**
 * Consumer(구매자) API 모듈 — 경로 prefix `consumer`, JWT aud `consumer`
 */

@Module({
  imports: [
    UploadModule,
    AuthModule,
    HomeBannerModule,
    FcmModule,
    StoreModule,
    ProductModule,
    OrderModule,
    ReviewModule,
    FeedModule,
    LikeModule,
    RecentViewModule,
    NotificationModule,
    TermsModule,
    NoticeModule,
    QnaModule,
    // ChatModule,
  ],
  controllers: [
    ConsumerUploadController,
    ConsumerAuthController,
    ConsumerFcmTokenController,
    ConsumerStoreController,
    ConsumerProductController,
    ConsumerOrderController,
    ConsumerReviewController,
    ConsumerFeedController,
    ConsumerLikeController,
    ConsumerMypageController,
    ConsumerNotificationController,
    ConsumerHomeBannerController,
    ConsumerTermsController,
    ConsumerNoticeController,
    ConsumerQnaController,
    // ConsumerChatController,
  ],
})
export class ConsumerApiModule {}
