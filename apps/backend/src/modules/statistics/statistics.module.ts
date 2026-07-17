import { Module } from "@nestjs/common";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";
import { AdminStatisticsService } from "@apps/backend/modules/statistics/admin/services/admin-statistics.service";
import { SellerOrderStatisticsService } from "@apps/backend/modules/statistics/seller/services/seller-order-statistics.service";

/**
 * 통계 모듈
 *
 * 집계 API의 도메인 로직을 대상(audience) 기준 하위 폴더로 나눠 둡니다.
 *
 * - `seller/` — 판매자 대상 통계. 파일·심볼은 `seller-<도메인>-statistics` 네이밍
 *   (현재 `SellerOrderStatisticsService`. 이후 상품 통계 등은 `seller-product-statistics.*`처럼 추가)
 * - `admin/` — 관리자(전사) 통계. `admin-statistics` 네이밍
 *   (가입·스토어·주문(GMV)·입점 요청. 세분화가 필요해지면 `admin-<도메인>-statistics.*`로 분리)
 * - `common/` — 대상 구분 없이 쓰는 공용 유틸 (날짜·시각 등)
 *
 * 컨트롤러는 기존 규칙대로 `apis/<audience>/controllers/statistics.controller.ts`에 둡니다.
 */
@Module({
  imports: [DatabaseModule],
  providers: [SellerOrderStatisticsService, AdminStatisticsService],
  exports: [SellerOrderStatisticsService, AdminStatisticsService],
})
export class StatisticsModule {}
