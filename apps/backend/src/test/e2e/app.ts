import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";

import { AppModule } from "@apps/backend/app.module";
import { API_PREFIX } from "@apps/backend/common/constants/app.constants";
import { SentryUtil } from "@apps/backend/common/utils/sentry.util";
import { NotificationOrderDispatchService } from "@apps/backend/modules/notification/services/notification-order-dispatch.service";
import { assertTestDatabase } from "@apps/backend/test/integration/db";
import { createNotificationOrderDispatchNoopMock } from "@apps/backend/test/mocks";

let app: INestApplication | undefined;

/**
 * 실제 앱(main.ts)과 최대한 같은 요청 파이프라인(전역 prefix, ValidationPipe, 가드,
 * 인터셉터)으로 `AppModule`을 통째로 띄운다. 유일한 차이는 `NotificationOrderDispatchService`를
 * no-op으로 교체하는 것 — 그 외엔 손대지 않는다.
 *
 * 이 서비스는 주문 상태 전환 훅에서 Firebase 푸시·카카오 알림톡을 실제로 발송한다.
 * `.env.test`가 `.env.development`를 복제한 파일이라 진짜 개발용 자격증명을 그대로
 * 물고 있어서, mock하지 않으면 E2E 테스트를 돌릴 때마다 실제 알림이 나간다.
 */
export async function createTestApp(): Promise<INestApplication> {
  if (app) return app;

  assertTestDatabase();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(NotificationOrderDispatchService)
    .useValue(createNotificationOrderDispatchNoopMock())
    .compile();

  app = moduleRef.createNestApplication();

  // Sentry로 실제 이벤트가 나가지 않도록: nodeEnv만 등록해 SentryUtil.enabled()가 false를 반환하게 함.
  // (initializeSentry()는 호출하지 않음 — 그건 실제 Sentry SDK를 DSN으로 초기화하는 함수)
  SentryUtil.initialize(app.get(ConfigService));

  // main.ts와 동일한 전역 설정 (여기서 빠지면 실제 요청 파이프라인을 검증하는 의미가 없어짐)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix(API_PREFIX);

  await app.init();
  return app;
}

export async function closeTestApp(): Promise<void> {
  if (!app) return;
  await app.close();
  app = undefined;
}

export function getTestApp(): INestApplication {
  if (!app) {
    throw new Error("createTestApp()을 먼저 호출해야 합니다.");
  }
  return app;
}
