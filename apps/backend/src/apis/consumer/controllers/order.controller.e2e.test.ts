import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { JwtUtil } from "@apps/backend/modules/auth/utils/jwt.util";
import { OrderStatus } from "@apps/backend/modules/order/constants/order.constants";
import { getTestApp } from "@apps/backend/test/e2e/app";
import {
  createTestConsumer,
  createTestProduct,
  createTestSeller,
  createTestStore,
} from "@apps/backend/test/integration/factories";
import request from "supertest";
import { describe, expect, it } from "vitest";

/**
 * 유닛테스트·DB 통합테스트는 컨트롤러/가드/전역 파이프를 거치지 않고 서비스 클래스를
 * 직접 호출한다. 여기서는 실제 HTTP 요청으로 인증 → 주문 생성까지 전체 파이프라인
 * (JwtStrategy·AuthGuard → ValidationPipe → Controller → Service → DB → 응답 인터셉터)이
 * 실제로 맞물려 동작하는지를 검증한다.
 */
describe("POST /v1/consumer/orders (e2e)", () => {
  async function setupProduct() {
    const app = getTestApp();
    const prisma = app.get(PrismaService);
    const jwtUtil = app.get(JwtUtil);

    const seller = await createTestSeller(prisma);
    const store = await createTestStore(prisma, seller.id);
    const product = await createTestProduct(prisma, store.id);
    const consumer = await createTestConsumer(prisma);

    const accessToken = await jwtUtil.generateAccessToken({
      sub: consumer.id,
      aud: AUDIENCE.CONSUMER,
    });

    return { app, prisma, product, consumer, accessToken };
  }

  function buildOrderBody(productId: string) {
    return {
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      productId,
      productName: "테스트 케이크",
      productImages: [],
      totalQuantity: 1,
      totalPrice: 30000,
      storeName: "테스트 스토어",
      pickupAddress: "서울특별시 강남구 역삼동",
      pickupRoadAddress: "서울특별시 강남구 테헤란로 1",
      pickupZonecode: "06234",
      pickupLatitude: 37.5,
      pickupLongitude: 127.03,
      items: [{ quantity: 1 }],
    };
  }

  it("유효한 토큰으로 주문을 생성하면 201과 함께 실제 DB에 주문이 저장된다", async () => {
    const { app, prisma, product, accessToken } = await setupProduct();

    const res = await request(app.getHttpServer())
      .post("/v1/consumer/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(buildOrderBody(product.id));

    expect(res.status).toBe(201);
    // 전역 SuccessResponseInterceptor가 씌우는 공통 응답 포맷까지 실제로 확인
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");

    const saved = await prisma.order.findUnique({ where: { id: res.body.data.id } });
    expect(saved).not.toBeNull();
    expect(saved?.orderStatus).toBe(OrderStatus.RESERVATION_REQUESTED);
  });

  it("Authorization 헤더 없이 요청하면 AuthGuard가 401로 막는다", async () => {
    const { app, product } = await setupProduct();

    const res = await request(app.getHttpServer())
      .post("/v1/consumer/orders")
      .send(buildOrderBody(product.id));

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("필수 필드가 빠지면 전역 ValidationPipe가 400으로 막고 DB에는 아무 것도 남지 않는다", async () => {
    const { app, prisma, product, accessToken } = await setupProduct();
    const invalidBody = buildOrderBody(product.id) as Record<string, unknown>;
    delete invalidBody.items;

    const res = await request(app.getHttpServer())
      .post("/v1/consumer/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(invalidBody);

    expect(res.status).toBe(400);
    expect(await prisma.order.count()).toBe(0);
  });
});
