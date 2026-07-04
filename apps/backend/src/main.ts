import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import morgan from "morgan";
import * as express from "express";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { AppModule } from "@apps/backend/app.module";
import { API_PREFIX } from "@apps/backend/common/constants/app.constants";
import { SellerApiModule } from "@apps/backend/apis/seller/seller-api.module";
import { ConsumerApiModule } from "@apps/backend/apis/consumer/consumer-api.module";
import { AdminApiModule } from "@apps/backend/apis/admin/admin-api.module";
import {
  sellerSwaggerConfig,
  consumerSwaggerConfig,
  adminSwaggerConfig,
} from "@apps/backend/common/config/swagger.config";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { initializeSentry } from "@apps/backend/common/config/sentry.config";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { SentryUtil } from "@apps/backend/common/utils/sentry.util";
import { isNonProduction } from "@apps/backend/common/utils/environment.util";

/**
 * NestJS 애플리케이션의 진입점
 */
async function bootstrap(): Promise<void> {
  // NestJS 애플리케이션 메인 인스턴스 생성 (AppModule을 사용하여 모든 모듈을 포함하고 있음)
  const app = await NestFactory.create(AppModule);

  // Socket.IO 어댑터 설정 (WebSocket 연결을 위해 필수)
  // 전역 prefix가 Socket.IO 경로에 영향을 주지 않도록 설정
  app.useWebSocketAdapter(new IoAdapter(app));

  // ConfigService 인스턴스 생성 (.env 환경 변수에 저장된 설정값들 가져올 수 있음)
  const configService = app.get(ConfigService);

  // LoggerUtil 초기화 (ConfigService 사용해야함)
  LoggerUtil.initialize(configService);

  // SentryUtil 초기화 (ConfigService 사용해야함)
  SentryUtil.initialize(configService);

  // Sentry 초기화 (ConfigService 사용해야함)
  initializeSentry(configService);

  // 포트와 환경 변수 가져오기
  const port = configService.get("PORT");
  const nodeEnv = configService.get("NODE_ENV");

  // Health check (CORS 제외, global prefix 제외, interceptor/guard 등 미적용)
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.getInstance().get("/health", async (_req: any, res: any) => {
    try {
      // PrismaService 가져오기
      const prismaService = app.get(PrismaService);

      // 데이터베이스 연결 상태 확인
      const isDbConnected = await prismaService.checkConnection();

      if (!isDbConnected) {
        LoggerUtil.log("[HealthCheck] database disconnected");
        return res.status(503).json({
          status: "unhealthy",
          database: "disconnected",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json({
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      LoggerUtil.log(
        `[HealthCheck] failure: ${error instanceof Error ? error.message : String(error)}`,
      );
      SentryUtil.captureException(error, "error", {
        module: "main",
        operation: "health-check",
      });
      res.status(503).json({
        status: "unhealthy",
        database: "unknown",
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // CORS 설정
  app.enableCors({
    origin: configService.get("CORS_ORIGIN").split(","),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Requested-With", "Authorization"],
    credentials: true, // 인증 헤더 등을 포함한 자격 증명을 CORS 요청에 포함할 수 있도록 허용
    maxAge: 86400,
  });

  // 보안 헤더 설정 (WebSocket 연결을 위해 Content-Security-Policy 조정)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: [
            "'self'",
            ...configService
              .get("CORS_ORIGIN")
              .split(",")
              .map((origin: string) => origin.trim()),
          ], // WebSocket 연결 허용
        },
      },
      crossOriginEmbedderPolicy: false, // WebSocket 연결을 위해 비활성화
    }),
  );

  // HTTP 요청 로깅 (개발/검증 환경에서만)
  if (isNonProduction(nodeEnv)) {
    app.use(morgan("combined"));
  }

  // 전역 유효성 검사 파이프 설정
  // class-validator를 사용하여 DTO 유효성 검사 자동화
  // 클라이언트가 API 요청 → ValidationPipe가 DTO 검증 → 유효하지 않으면 에러 반환 → 유효하면 컨트롤러로 전달
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 에러 발생
      transform: true, // 자동 타입 변환 (string -> number 등)
    }),
  );

  // 전역 접두사 설정 (모든 API 경로에 /v1 접두사 추가)
  // 호출 순서 중요 (설정 순서에 따라 적용되는 순서가 다름)
  app.setGlobalPrefix(API_PREFIX);

  // Swagger User / Seller (development와 staging 환경에서만 활성화)
  if (isNonProduction(nodeEnv)) {
    // 스웨거 Basic Auth 미들웨어 설정
    const swaggerUsername = configService.get("SWAGGER_USERNAME");
    const swaggerPassword = configService.get("SWAGGER_PASSWORD");

    // 스웨거 경로에 Basic Auth 적용
    app.use(
      `${API_PREFIX}/docs`,
      (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const auth = req.headers.authorization;

        if (!auth || !auth.startsWith("Basic ")) {
          res.setHeader("WWW-Authenticate", 'Basic realm="Swagger Documentation"');
          return res.status(401).send("Authentication required");
        }

        const credentials = Buffer.from(auth.slice(6), "base64").toString();
        const [username, password] = credentials.split(":");

        if (username === swaggerUsername && password === swaggerPassword) {
          return next();
        }

        res.setHeader("WWW-Authenticate", 'Basic realm="Swagger Documentation"');
        return res.status(401).send("Invalid credentials");
      },
    );

    const consumerDoc = SwaggerModule.createDocument(app, consumerSwaggerConfig, {
      include: [ConsumerApiModule],
    });
    SwaggerModule.setup(`${API_PREFIX}/docs/${AUDIENCE.CONSUMER}`, app, consumerDoc);

    const sellerDoc = SwaggerModule.createDocument(app, sellerSwaggerConfig, {
      include: [SellerApiModule],
    });
    SwaggerModule.setup(`${API_PREFIX}/docs/${AUDIENCE.SELLER}`, app, sellerDoc);

    const adminDoc = SwaggerModule.createDocument(app, adminSwaggerConfig, {
      include: [AdminApiModule],
    });
    SwaggerModule.setup(`${API_PREFIX}/docs/${AUDIENCE.ADMIN}`, app, adminDoc);
  }

  // 서버 시작
  await app.listen(Number(port));

  LoggerUtil.log(`server is running on port ${port}`);
  LoggerUtil.log(`Environment: ${nodeEnv}`);
  LoggerUtil.log(`CORS origins: ${configService.get("CORS_ORIGIN")}`);
  LoggerUtil.log(`WebSocket Gateway namespaces: / (chat), /notifications (seller + user order)`);
  LoggerUtil.log(`API prefix: ${API_PREFIX}`);
}

bootstrap().catch((error) => {
  LoggerUtil.log(`bootstrap failure: ${error instanceof Error ? error.message : String(error)}`);
  SentryUtil.captureException(error, "error", {
    module: "main",
    operation: "bootstrap",
  });
  process.exit(1);
});
