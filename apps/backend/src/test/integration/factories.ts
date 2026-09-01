import { randomInt, randomUUID } from "crypto";

import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { OrderStatus } from "@apps/backend/modules/order/constants/order.constants";
import { EnableStatus } from "@apps/backend/modules/product/constants/product.constants";

/**
 * 통합테스트용 최소 픽스처 생성 헬퍼.
 * 법적 고시정보처럼 테스트 대상 로직과 무관한 NOT NULL 필드는 더미 값으로 채웁니다.
 */

/** 항상 정확히 8자리 숫자를 반환 (UUID에서 숫자만 필터링하는 방식과 달리 자릿수가 흔들리지 않음) */
function randomPhoneSuffix(): string {
  return String(randomInt(0, 100_000_000)).padStart(8, "0");
}

export async function createTestConsumer(
  prisma: PrismaService,
  overrides: Partial<Parameters<PrismaService["consumer"]["create"]>[0]["data"]> = {},
) {
  return prisma.consumer.create({
    data: {
      phone: `010${randomPhoneSuffix()}`,
      name: "테스트 소비자",
      isPhoneVerified: true,
      ...overrides,
    },
  });
}

export async function createTestSeller(
  prisma: PrismaService,
  overrides: Partial<Parameters<PrismaService["seller"]["create"]>[0]["data"]> = {},
) {
  return prisma.seller.create({
    data: {
      phone: `010${randomPhoneSuffix()}`,
      name: "테스트 판매자",
      isPhoneVerified: true,
      ...overrides,
    },
  });
}

export async function createTestStore(
  prisma: PrismaService,
  sellerId: string,
  overrides: Partial<Prisma.StoreUncheckedCreateInput> = {},
) {
  return prisma.store.create({
    data: {
      sellerId,
      name: "테스트 스토어",
      businessNo: "000-00-00000",
      representativeName: "홍길동",
      openingDate: "20200101",
      businessName: "테스트 사업자",
      businessSector: "제조업",
      businessType: "베이커리",
      permissionManagementNumber: "제0000-0000호",
      // standardOpenTime === standardCloseTime === "00:00" => 하루 전체 영업 (스키마 기본값과 동일)
      ...overrides,
    },
  });
}

export async function createTestProduct(
  prisma: PrismaService,
  storeId: string,
  overrides: Partial<Prisma.ProductUncheckedCreateInput> = {},
) {
  return prisma.product.create({
    data: {
      storeId,
      name: "테스트 케이크",
      originalPrice: 30000,
      salePrice: 30000,
      salesStatus: EnableStatus.ENABLE,
      visibilityStatus: EnableStatus.ENABLE,
      letteringVisible: EnableStatus.DISABLE,
      letteringMaxLength: 0,
      imageUploadEnabled: EnableStatus.DISABLE,
      productNumber: `TEST-${randomUUID().slice(0, 8)}`,
      productNoticeFoodType: "빵류",
      productNoticeProducer: "테스트 제조사",
      productNoticeOrigin: "국내산",
      productNoticeAddress: "서울특별시",
      productNoticeManufactureDate: "제조일에 별도 표기",
      productNoticeExpirationDate: "제조일로부터 3일",
      productNoticePackageCapacity: "1개",
      productNoticePackageQuantity: "1개",
      productNoticeIngredients: "밀가루 외",
      productNoticeCalories: "100kcal",
      productNoticeSafetyNotice: "-",
      productNoticeGmoNotice: "해당없음",
      productNoticeImportNotice: "해당없음",
      productNoticeCustomerService: "1544-0000",
      ...overrides,
    },
  });
}

export async function createTestOrder(
  prisma: PrismaService,
  refs: { consumerId: string; productId: string; storeId: string },
  overrides: Partial<Prisma.OrderUncheckedCreateInput> = {},
) {
  return prisma.order.create({
    data: {
      consumerId: refs.consumerId,
      productId: refs.productId,
      storeId: refs.storeId,
      orderNumber: `ORD-TEST-${randomUUID().slice(0, 12)}`,
      totalQuantity: 1,
      totalPrice: 30000,
      orderStatus: OrderStatus.RESERVATION_REQUESTED,
      ...overrides,
    },
  });
}
