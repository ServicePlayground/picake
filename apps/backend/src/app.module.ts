import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule } from "@apps/backend/infra/database/database.module";
import { ConsumerApiModule } from "@apps/backend/apis/consumer/consumer-api.module";
import { SellerApiModule } from "@apps/backend/apis/seller/seller-api.module";
import { AdminApiModule } from "@apps/backend/apis/admin/admin-api.module";
import { SuccessResponseInterceptor } from "@apps/backend/common/interceptors/success-response.interceptor";
import { ErrorResponseInterceptor } from "@apps/backend/common/interceptors/error-response.interceptor";

/**
 * NestJS 애플리케이션의 루트 모듈
 * 모든 기능 모듈들을 통합하는 메인 모듈
 */
@Module({
  imports: [
    // 환경 변수 설정 모듈
    ConfigModule.forRoot({
      isGlobal: true, // 전역에서 사용 가능하도록 설정

      // 환경별 .env 파일 자동 로드
      // - development: .env.development
      // - staging: .env.staging (github workflow)
      // - production: .env.production (github workflow)
      envFilePath: [`.env.${process.env.NODE_ENV}`],
      ignoreEnvFile: false, // 모든 환경에서 .env 파일 사용
    }),

    // Rate Limiting 모듈
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1분
        limit: 100, // 1분당 100회 요청 제한
      },
    ]),

    // 데이터베이스 모듈
    DatabaseModule,

    // Consumer API 모듈
    ConsumerApiModule,

    // Seller API 모듈
    SellerApiModule,

    // Admin API 모듈
    AdminApiModule,
  ],
  providers: [
    // 전역 Success Response Interceptor 등록 // 성공적인 응답을 통일된 형태로 변환
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessResponseInterceptor,
    },
    // 전역 Error Response Interceptor 등록 // 예외 처리를 통일된 형태로 처리
    {
      provide: APP_FILTER,
      useClass: ErrorResponseInterceptor,
    },
    // 전역 Rate Limiting Guard 등록
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
