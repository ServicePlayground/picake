import { PrismaClient } from "@apps/backend/infra/database/prisma/generated/client";
import { assertTestDatabase } from "@apps/backend/test/integration/db";

/**
 * web-user Playwright E2E(`apps/web-user/e2e`)가 의존하는 최소 픽스처(판매자/스토어/상품)를
 * 테스트 DB에 find-or-create로 준비한다. 매번 새로 만들지 않고 마커 필드로 재사용하므로
 * 반복 실행해도 데이터가 쌓이지 않는다.
 *
 * web-user 쪽 테스트는 `GET /v1/consumer/products?search=...`로 아래 상품을 이름 검색해서
 * productId를 찾으므로, 이 스크립트와 web-user 테스트 사이에 별도 파일 공유가 필요 없다.
 */

const prisma = new PrismaClient();

const FIXTURE = {
  // 실제 휴대폰 번호 형식이 아니라서 실사용자 계정과 겹치지 않음 (REVIEW_LOGIN_ACCOUNT_PHONE_MARKER와 동일 관례)
  SELLER_PHONE: "E2E_FIXTURE_SELLER",
  STORE: {
    // 스토어 이름은 한글/영문/숫자/공백만 허용(validators.decorator.ts)이라 대괄호 마커를 못 씀
    NAME: "E2E 테스트 스토어",
    BUSINESS_NO: "000-00-E2E01",
    PERMISSION_MANAGEMENT_NUMBER: "제E2E-0001호",
    ADDRESS: "서울특별시 강남구 역삼동 123-45",
    ROAD_ADDRESS: "서울특별시 강남구 테헤란로 1",
    DETAIL_ADDRESS: "101호",
    ZONECODE: "06234",
    LATITUDE: 37.5,
    LONGITUDE: 127.03,
  },
  PRODUCT: {
    // web-user e2e가 이 마커로 검색해서 productId를 찾는다.
    NAME: "[E2E] 테스트 케이크",
    PRICE: 30000,
    SIZE_OPTIONS: [
      {
        id: "e2e-size-mini",
        visible: "ENABLE",
        displayName: "미니",
        lengthCm: 10,
        price: 0,
        description: "1~2인용",
      },
    ],
    FLAVOR_OPTIONS: [
      {
        id: "e2e-flavor-choco",
        visible: "ENABLE",
        displayName: "초콜릿",
        price: 0,
      },
    ],
    // 0이면 레터링 textarea의 maxLength가 0이 되어 아예 입력이 안 되므로 반드시 0보다 커야 함
    LETTERING_MAX_LENGTH: 20,
  },
};

async function upsertSeller() {
  const existing = await prisma.seller.findUnique({ where: { phone: FIXTURE.SELLER_PHONE } });
  if (existing) return existing;

  return prisma.seller.create({
    data: {
      phone: FIXTURE.SELLER_PHONE,
      name: "E2E 테스트 판매자",
      isPhoneVerified: true,
      isActive: true,
    },
  });
}

async function upsertStore(sellerId: string) {
  const existing = await prisma.store.findFirst({
    where: { sellerId, businessNo: FIXTURE.STORE.BUSINESS_NO },
  });
  if (existing) return existing;

  return prisma.store.create({
    data: {
      sellerId,
      name: FIXTURE.STORE.NAME,
      businessNo: FIXTURE.STORE.BUSINESS_NO,
      representativeName: "E2E 대표자",
      openingDate: "20200101",
      businessName: "E2E 테스트 사업자",
      businessSector: "제조업",
      businessType: "베이커리",
      permissionManagementNumber: FIXTURE.STORE.PERMISSION_MANAGEMENT_NUMBER,
      // 주문 생성 DTO가 pickupAddress 등을 필수로 요구하므로 채워야 함
      address: FIXTURE.STORE.ADDRESS,
      roadAddress: FIXTURE.STORE.ROAD_ADDRESS,
      detailAddress: FIXTURE.STORE.DETAIL_ADDRESS,
      zonecode: FIXTURE.STORE.ZONECODE,
      latitude: FIXTURE.STORE.LATITUDE,
      longitude: FIXTURE.STORE.LONGITUDE,
      // standardOpenTime === standardCloseTime === "00:00" => 하루 전체 영업 (스키마 기본값)
    },
  });
}

async function upsertProduct(storeId: string) {
  const existing = await prisma.product.findFirst({
    where: { storeId, name: FIXTURE.PRODUCT.NAME },
  });
  if (existing) return existing;

  return prisma.product.create({
    data: {
      storeId,
      name: FIXTURE.PRODUCT.NAME,
      originalPrice: FIXTURE.PRODUCT.PRICE,
      salePrice: FIXTURE.PRODUCT.PRICE,
      salesStatus: "ENABLE",
      visibilityStatus: "ENABLE",
      cakeSizeOptions: FIXTURE.PRODUCT.SIZE_OPTIONS,
      cakeFlavorOptions: FIXTURE.PRODUCT.FLAVOR_OPTIONS,
      letteringVisible: "ENABLE",
      letteringMaxLength: FIXTURE.PRODUCT.LETTERING_MAX_LENGTH,
      imageUploadEnabled: "DISABLE",
      productNumber: `E2E-${Date.now()}`,
      productNoticeFoodType: "빵류",
      productNoticeProducer: "E2E 테스트 제조사",
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
    },
  });
}

async function main() {
  assertTestDatabase();

  const seller = await upsertSeller();
  const store = await upsertStore(seller.id);
  const product = await upsertProduct(store.id);

  console.log(`[e2e-fixture] seller=${seller.id} store=${store.id} product=${product.id}`);
}

main()
  .catch((error) => {
    console.error("[e2e-fixture] 시딩 실패:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
