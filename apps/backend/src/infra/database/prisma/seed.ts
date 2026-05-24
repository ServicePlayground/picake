import {
  PrismaClient,
  ProductCategoryType,
  SellerVerificationStatus,
  StoreBankName,
} from "./generated/client";
import * as bcrypt from "bcrypt";
import { ADMIN_BCRYPT_SALT_ROUNDS } from "@apps/backend/modules/auth/constants/auth.constants";

const prisma = new PrismaClient();

/**
 * 시드용 계정 — Consumer / Seller / Admin 테이블·JWT aud 분리 구조에 맞춤
 */
const SEED_ACCOUNTS = {
  SELLER: {
    PHONE: "01012345678",
    NAME: "김철수",
    NICKNAME: "김철수_739",
    PROFILE_IMAGE_URL: "https://static-staging.picakes.com/uploads/1779605116236_722257b7.jpeg",
    GOOGLE_ID: "115107911178776387683",
    GOOGLE_EMAIL: "olo90632951@gmail.com",
    /** 시드 판매자는 스토어·상품 시드까지 쓰므로 검증 완료 상태로 둠 */
    SELLER_VERIFICATION_STATUS: SellerVerificationStatus.BUSINESS_VERIFIED,
    CREATED_AT: new Date("2024-01-15T10:30:00Z"),
    LAST_LOGIN_AT: new Date("2024-01-20T14:25:00Z"),
  },
  CONSUMER: {
    PHONE: "01023456789",
    NAME: "홍길동",
    NICKNAME: "홍길동_4821",
    PROFILE_IMAGE_URL: "https://static-staging.picakes.com/uploads/1779605131078_b337595b.jpeg",
    GOOGLE_ID: "115107911178776387683",
    GOOGLE_EMAIL: "olo90632951@gmail.com",
    PUSH_NOTIFICATIONS_ENABLED: true,
    CREATED_AT: new Date("2024-01-16T09:15:00Z"),
  },
  ADMIN: {
    USERNAME: "seed_admin",
    PASSWORD_PLAIN: "SeedAdmin@1234",
    CREATED_AT: new Date("2024-01-01T00:00:00.000Z"),
    LAST_LOGIN_AT: new Date("2024-01-01T12:00:00.000Z"),
  },
};

const SEED_STORES = {
  STORE1: {
    NAME: "Picake",
    DESCRIPTION: "맛있는 케이크를 판매하는 스토어입니다.",
    LOGO_IMAGE_URL: "https://static-staging.picakes.com/uploads/1779605159252_4d8646ed.jpeg",
    ADDRESS: "서울특별시 강동구 천호동 123-45",
    ROAD_ADDRESS: "서울특별시 강동구 천호대로 100",
    DETAIL_ADDRESS: "101호",
    ZONECODE: "05278",
    LATITUDE: 37.5386,
    LONGITUDE: 127.1259,
    BUSINESS_NO: "1198288946",
    REPRESENTATIVE_NAME: "홍길동",
    OPENING_DATE: "20230101",
    BUSINESS_NAME: "Picake",
    BUSINESS_SECTOR: "도매 및 소매업",
    BUSINESS_TYPE: "전자상거래 소매 중개업",
    PERMISSION_MANAGEMENT_NUMBER: "2021-서울강동-0422",
    BANK_ACCOUNT_NUMBER: "1103021234567",
    BANK_NAME: StoreBankName.KB_KOOKMIN,
    ACCOUNT_HOLDER_NAME: "홍길동",
    PHONE_NUMBER: "010-1234-5678",
    LIKE_COUNT: 15,
    CREATED_AT: new Date("2024-01-15T10:30:00Z"),
    UPDATED_AT: new Date("2024-01-15T10:30:00Z"),
  },
  STORE2: {
    NAME: "디저트 파라다이스",
    DESCRIPTION: "다양한 디저트를 판매하는 스토어입니다.",
    LOGO_IMAGE_URL: "https://static-staging.picakes.com/uploads/1779605174262_b7ad9ab3.jpeg",
    ADDRESS: "서울특별시 강남구 역삼동 456-78",
    ROAD_ADDRESS: "서울특별시 강남구 테헤란로 200",
    DETAIL_ADDRESS: "102호",
    ZONECODE: "06234",
    LATITUDE: 37.4981,
    LONGITUDE: 127.0276,
    BUSINESS_NO: "1198288947",
    REPRESENTATIVE_NAME: "홍길동",
    OPENING_DATE: "20230201",
    BUSINESS_NAME: "디저트 파라다이스",
    BUSINESS_SECTOR: "도매 및 소매업",
    BUSINESS_TYPE: "전자상거래 소매 중개업",
    PERMISSION_MANAGEMENT_NUMBER: "2021-서울강동-0423",
    BANK_ACCOUNT_NUMBER: "1002-345-678901",
    BANK_NAME: StoreBankName.SHINHAN,
    ACCOUNT_HOLDER_NAME: "홍길동",
    PHONE_NUMBER: "010-9876-5432",
    LIKE_COUNT: 8,
    CREATED_AT: new Date("2024-01-16T10:30:00Z"),
    UPDATED_AT: new Date("2024-01-16T10:30:00Z"),
  },
};

const SEED_STORE_REFUND_CANCELLATION_POLICY = {
  rules: [
    { daysBeforePickup: 7, refundDescription: "결제액의 50% 환불" },
    { daysBeforePickup: 3, refundDescription: "결제액의 30% 환불" },
  ],
};

const SEED_PRODUCT_BASE = {
  NAME: "프리미엄 초콜릿 케이크",
  IMAGES: [
    "https://static-staging.picakes.com/uploads/1779605188940_c6dd594b.jpeg",
    "https://static-staging.picakes.com/uploads/1779605200087_f0d30173.jpeg",
  ],
  SALE_PRICE: 45000,
  SIZE_OPTIONS: [
    {
      id: "size_seed_dosirak",
      visible: "ENABLE",
      displayName: "도시락",
      lengthCm: 8,
      price: 25000,
      description: "1인용",
    },
    {
      id: "size_seed_mini",
      visible: "ENABLE",
      displayName: "미니",
      lengthCm: 10,
      price: 30000,
      description: "1~2인용",
    },
    {
      id: "size_seed_1ho",
      visible: "ENABLE",
      displayName: "1호",
      lengthCm: 15,
      price: 35000,
      description: "2~3인용",
    },
    {
      id: "size_seed_2ho",
      visible: "ENABLE",
      displayName: "2호",
      lengthCm: 18,
      price: 40000,
      description: "3~4인용",
    },
    {
      id: "size_seed_3ho",
      visible: "ENABLE",
      displayName: "3호",
      lengthCm: 21,
      price: 45000,
      description: "4~5인용",
    },
  ],
  FLAVOR_OPTIONS: [
    {
      id: "flavor_seed_choco",
      visible: "ENABLE",
      displayName: "초콜릿",
      price: 2000,
    },
    {
      id: "flavor_seed_vanilla",
      visible: "ENABLE",
      displayName: "바닐라",
      price: 3000,
    },
  ],
  LETTERING: {
    VISIBLE: "ENABLE",
    REQUIRED: "OPTIONAL",
    MAX_LENGTH: 20,
  },
  SEARCH_TAGS: ["생일케이크", "초콜릿", "당일배송"],
  PRODUCT_CATEGORY_TYPES: [ProductCategoryType.BIRTHDAY, ProductCategoryType.SIMPLE],
  DETAIL_DESCRIPTION: "<p>고급 초콜릿으로 만든 프리미엄 케이크입니다.</p>",
  PRODUCT_NOTICE: {
    FOOD_TYPE: "케이크류",
    PRODUCER: "Picake",
    ORIGIN: "국내산",
    ADDRESS: "서울시 강남구 테헤란로 123",
    MANUFACTURE_DATE: "2024-01-01",
    EXPIRATION_DATE: "제조일로부터 3일",
    PACKAGE_CAPACITY: "500g",
    PACKAGE_QUANTITY: "1개",
    INGREDIENTS: "초콜릿, 밀가루, 설탕, 우유, 계란",
    CALORIES: "칼로리: 350kcal, 탄수화물: 45g, 단백질: 5g, 지방: 15g",
    SAFETY_NOTICE: "알레르기 주의: 우유, 계란, 밀 함유",
    GMO_NOTICE: "해당사항 없음",
    IMPORT_NOTICE: "해당사항 없음",
    CUSTOMER_SERVICE: "1588-1234",
  },
};

const SEED_REVIEW_CONTENTS = [
  "정말 맛있었어요! 다음에도 주문할게요.",
  "배송도 빠르고 상품도 좋아요. 추천합니다!",
  "생각보다 작았지만 맛은 좋았어요.",
  "가격 대비 만족도가 높아요.",
  "케이크가 너무 예뻐서 생일 파티에 완벽했어요!",
  "친구들이 다 맛있다고 했어요.",
  "다음에 또 주문할 예정입니다.",
  "포장도 깔끔하고 상품 상태도 좋았어요.",
];

const SEED_PRODUCT_IMAGES = {
  FIRST_STORE_REVIEW_IMAGE:
    "https://static-staging.picakes.com/uploads/1779605188940_c6dd594b.jpeg",
  SECOND_STORE_REVIEW_IMAGE:
    "https://static-staging.picakes.com/uploads/1779605200087_f0d30173.jpeg",
};

const SEED_STORE_FEEDS = {
  FEED1: {
    TITLE: "신제품 출시 안내",
    CONTENT:
      "<p>안녕하세요! 새로운 케이크가 출시되었습니다.</p><p>맛있고 예쁜 케이크로 여러분을 찾아뵙겠습니다.</p>",
    CREATED_AT: new Date("2024-01-20T10:00:00Z"),
  },
  FEED2: {
    TITLE: "이벤트 안내",
    CONTENT: "<p>특별 이벤트를 진행합니다!</p><p>지금 주문하시면 10% 할인 혜택을 드립니다.</p>",
    CREATED_AT: new Date("2024-01-21T14:30:00Z"),
  },
  FEED3: {
    TITLE: "배송 안내",
    CONTENT: "<p>배송 관련 안내드립니다.</p><p>주문 후 2-3일 내 배송됩니다.</p>",
    CREATED_AT: new Date("2024-01-22T09:15:00Z"),
  },
};

/**
 * 시드 계정을 생성합니다 — 구매자 1명, 판매자 1명.
 *
 * 동작 방식:
 * - phone 기준 존재 여부 확인
 * - 존재하면: 업데이트하지 않고 기존 행 반환
 * - 없으면: 새로 생성 (구글 OAuth·휴대폰 인증 플로우와 동일한 필드 형태)
 */
async function upsertSeedUsers() {
  let seller = await prisma.seller.findUnique({
    where: { phone: SEED_ACCOUNTS.SELLER.PHONE },
  });
  if (!seller) {
    seller = await prisma.seller.create({
      data: {
        phone: SEED_ACCOUNTS.SELLER.PHONE,
        googleId: SEED_ACCOUNTS.SELLER.GOOGLE_ID,
        googleEmail: SEED_ACCOUNTS.SELLER.GOOGLE_EMAIL,
        name: SEED_ACCOUNTS.SELLER.NAME,
        nickname: SEED_ACCOUNTS.SELLER.NICKNAME,
        profileImageUrl: SEED_ACCOUNTS.SELLER.PROFILE_IMAGE_URL,
        isPhoneVerified: true,
        isActive: true,
        sellerVerificationStatus: SEED_ACCOUNTS.SELLER.SELLER_VERIFICATION_STATUS,
        createdAt: SEED_ACCOUNTS.SELLER.CREATED_AT,
        lastLoginAt: SEED_ACCOUNTS.SELLER.LAST_LOGIN_AT,
      },
    });
  }

  let consumer = await prisma.consumer.findUnique({
    where: { phone: SEED_ACCOUNTS.CONSUMER.PHONE },
  });
  if (!consumer) {
    consumer = await prisma.consumer.create({
      data: {
        phone: SEED_ACCOUNTS.CONSUMER.PHONE,
        googleId: SEED_ACCOUNTS.CONSUMER.GOOGLE_ID,
        googleEmail: SEED_ACCOUNTS.CONSUMER.GOOGLE_EMAIL,
        name: SEED_ACCOUNTS.CONSUMER.NAME,
        nickname: SEED_ACCOUNTS.CONSUMER.NICKNAME,
        profileImageUrl: SEED_ACCOUNTS.CONSUMER.PROFILE_IMAGE_URL,
        isPhoneVerified: true,
        isActive: true,
        createdAt: SEED_ACCOUNTS.CONSUMER.CREATED_AT,
      },
    });
  }

  return {
    seller,
    consumers: [consumer],
  };
}

/**
 * 관리자(web-admin) 시드 계정을 생성합니다.
 *
 * - `username` 기준 존재하면 생성하지 않음 (idempotent)
 * - 비밀번호는 `ADMIN_BCRYPT_SALT_ROUNDS` 로 해시
 * - `isTotpEnabled: false`·`totpSecret: null` 유지 — 첫 로그인 후 web-admin에서 Google OTP 등록(필수) 플로우로 진입
 */
async function upsertSeedAdmin() {
  const { USERNAME, PASSWORD_PLAIN, CREATED_AT, LAST_LOGIN_AT } = SEED_ACCOUNTS.ADMIN;

  let admin = await prisma.admin.findUnique({
    where: { username: USERNAME },
  });

  if (!admin) {
    const passwordHash = await bcrypt.hash(PASSWORD_PLAIN, ADMIN_BCRYPT_SALT_ROUNDS);
    admin = await prisma.admin.create({
      data: {
        username: USERNAME,
        passwordHash,
        totpSecret: null,
        isTotpEnabled: false,
        isActive: true,
        createdAt: CREATED_AT,
        lastLoginAt: LAST_LOGIN_AT,
      },
    });
  }

  return admin;
}

/**
 * 스토어를 생성합니다.
 *
 * 동작 방식:
 * - name 기준으로 기존 스토어 확인
 * - 존재하면: 업데이트하지 않고 기존 스토어 반환 (그대로 유지)
 * - 존재하지 않으면: 새로 생성
 */
async function upsertStores(seller: Awaited<ReturnType<typeof upsertSeedUsers>>["seller"]) {
  if (!seller) {
    throw new Error("판매자 시드 계정이 없습니다. upsertSeedUsers를 확인하세요.");
  }

  /**
   * STORE1: 첫 번째 스토어
   * - name과 sellerId로 찾음 (같은 판매자의 스토어인지 확인)
   * - 존재 시: 업데이트하지 않고 기존 스토어 반환
   * - 존재하지 않을 시: 모든 필드로 새로 생성
   */
  let store1 = await prisma.store.findFirst({
    where: {
      name: SEED_STORES.STORE1.NAME,
      sellerId: seller.id,
    },
  });
  if (!store1) {
    store1 = await prisma.store.create({
      data: {
        sellerId: seller.id,
        name: SEED_STORES.STORE1.NAME,
        description: SEED_STORES.STORE1.DESCRIPTION,
        logoImageUrl: SEED_STORES.STORE1.LOGO_IMAGE_URL,
        phoneNumber: SEED_STORES.STORE1.PHONE_NUMBER,
        address: SEED_STORES.STORE1.ADDRESS,
        roadAddress: SEED_STORES.STORE1.ROAD_ADDRESS,
        detailAddress: SEED_STORES.STORE1.DETAIL_ADDRESS,
        zonecode: SEED_STORES.STORE1.ZONECODE,
        latitude: SEED_STORES.STORE1.LATITUDE,
        longitude: SEED_STORES.STORE1.LONGITUDE,
        businessNo: SEED_STORES.STORE1.BUSINESS_NO,
        representativeName: SEED_STORES.STORE1.REPRESENTATIVE_NAME,
        openingDate: SEED_STORES.STORE1.OPENING_DATE,
        businessName: SEED_STORES.STORE1.BUSINESS_NAME,
        businessSector: SEED_STORES.STORE1.BUSINESS_SECTOR,
        businessType: SEED_STORES.STORE1.BUSINESS_TYPE,
        permissionManagementNumber: SEED_STORES.STORE1.PERMISSION_MANAGEMENT_NUMBER,
        bankAccountNumber: SEED_STORES.STORE1.BANK_ACCOUNT_NUMBER,
        bankName: SEED_STORES.STORE1.BANK_NAME,
        accountHolderName: SEED_STORES.STORE1.ACCOUNT_HOLDER_NAME,
        likeCount: SEED_STORES.STORE1.LIKE_COUNT,
        // Store 스키마: 영업 캘린더 (00:00+00:00 = 하루 전체 영업, Prisma 기본값과 동일)
        weeklyClosedWeekdays: [],
        standardOpenTime: "00:00",
        standardCloseTime: "00:00",
        businessCalendarOverrides: [],
        refundCancellationPolicy: SEED_STORE_REFUND_CANCELLATION_POLICY,
        createdAt: SEED_STORES.STORE1.CREATED_AT,
        updatedAt: SEED_STORES.STORE1.UPDATED_AT,
      },
    });
  }

  /**
   * STORE2: 두 번째 스토어 (같은 판매자의 다른 스토어)
   * - name과 sellerId로 찾음 (같은 판매자의 스토어인지 확인)
   * - 존재 시: 업데이트하지 않고 기존 스토어 반환
   * - 존재하지 않을 시: 모든 필드로 새로 생성
   */
  let store2 = await prisma.store.findFirst({
    where: {
      name: SEED_STORES.STORE2.NAME,
      sellerId: seller.id,
    },
  });
  if (!store2) {
    store2 = await prisma.store.create({
      data: {
        sellerId: seller.id,
        name: SEED_STORES.STORE2.NAME,
        description: SEED_STORES.STORE2.DESCRIPTION,
        logoImageUrl: SEED_STORES.STORE2.LOGO_IMAGE_URL,
        phoneNumber: SEED_STORES.STORE2.PHONE_NUMBER,
        address: SEED_STORES.STORE2.ADDRESS,
        roadAddress: SEED_STORES.STORE2.ROAD_ADDRESS,
        detailAddress: SEED_STORES.STORE2.DETAIL_ADDRESS,
        zonecode: SEED_STORES.STORE2.ZONECODE,
        latitude: SEED_STORES.STORE2.LATITUDE,
        longitude: SEED_STORES.STORE2.LONGITUDE,
        businessNo: SEED_STORES.STORE2.BUSINESS_NO,
        representativeName: SEED_STORES.STORE2.REPRESENTATIVE_NAME,
        openingDate: SEED_STORES.STORE2.OPENING_DATE,
        businessName: SEED_STORES.STORE2.BUSINESS_NAME,
        businessSector: SEED_STORES.STORE2.BUSINESS_SECTOR,
        businessType: SEED_STORES.STORE2.BUSINESS_TYPE,
        permissionManagementNumber: SEED_STORES.STORE2.PERMISSION_MANAGEMENT_NUMBER,
        bankAccountNumber: SEED_STORES.STORE2.BANK_ACCOUNT_NUMBER,
        bankName: SEED_STORES.STORE2.BANK_NAME,
        accountHolderName: SEED_STORES.STORE2.ACCOUNT_HOLDER_NAME,
        likeCount: SEED_STORES.STORE2.LIKE_COUNT,
        weeklyClosedWeekdays: [],
        standardOpenTime: "00:00",
        standardCloseTime: "00:00",
        businessCalendarOverrides: [],
        refundCancellationPolicy: SEED_STORE_REFUND_CANCELLATION_POLICY,
        createdAt: SEED_STORES.STORE2.CREATED_AT,
        updatedAt: SEED_STORES.STORE2.UPDATED_AT,
      },
    });
  }

  return [store1, store2];
}

/**
 * 상품을 생성합니다.
 *
 * 동작 방식:
 * - 전체 상품 개수 확인
 * - 1개 이상 존재하면: 업데이트하지 않고 기존 상품 반환 (그대로 유지)
 * - 하나도 없을 때만: 100개의 상품 생성
 *
 * 특징:
 * - 100개의 상품 생성 (store1에 70개, store2에 30개)
 * - index % 3 === 0이면 BASIC_CAKE (imageUploadEnabled: DISABLE), 나머지는 CUSTOM_CAKE
 * - 상품이 하나라도 있으면 아무것도 하지 않음
 */
async function upsertProducts(stores: Awaited<ReturnType<typeof upsertStores>>) {
  const [store1, store2] = stores;

  // 스토어가 없으면 에러
  if (!store1 || !store2) {
    throw new Error("스토어가 생성되지 않았습니다. 스토어 생성에 실패했습니다.");
  }

  // 전체 상품 개수 확인
  const existingProductCount = await prisma.product.count();
  if (existingProductCount > 0) {
    // 상품이 하나라도 있으면 기존 상품 조회하여 반환
    const existingProducts = await prisma.product.findMany({
      take: 100,
      orderBy: { createdAt: "asc" },
    });
    return existingProducts;
  }

  // 상품이 하나도 없을 때만 100개 생성
  const products = [];

  for (let index = 0; index < 100; index++) {
    const imageUploadEnabled = index % 3 === 0 ? "DISABLE" : "ENABLE";
    const productType = imageUploadEnabled === "ENABLE" ? "CUSTOM_CAKE" : "BASIC_CAKE";
    const storeIndex = index < 70 ? 0 : 1;
    const targetStore = storeIndex === 0 ? store1 : store2;
    const productNumber = `20240101-${String(index + 1).padStart(3, "0")}`;

    const created = await prisma.product.create({
      data: {
        storeId: targetStore.id,
        name: SEED_PRODUCT_BASE.NAME,
        images: SEED_PRODUCT_BASE.IMAGES,
        salePrice: SEED_PRODUCT_BASE.SALE_PRICE,
        salesStatus: "ENABLE",
        visibilityStatus: "ENABLE",
        likeCount: 25,
        cakeSizeOptions: SEED_PRODUCT_BASE.SIZE_OPTIONS,
        cakeFlavorOptions: SEED_PRODUCT_BASE.FLAVOR_OPTIONS,
        letteringVisible: SEED_PRODUCT_BASE.LETTERING.VISIBLE as "ENABLE" | "DISABLE",
        letteringRequired: SEED_PRODUCT_BASE.LETTERING.REQUIRED as "REQUIRED" | "OPTIONAL",
        letteringMaxLength: SEED_PRODUCT_BASE.LETTERING.MAX_LENGTH,
        imageUploadEnabled,
        productType,
        productCategoryTypes: SEED_PRODUCT_BASE.PRODUCT_CATEGORY_TYPES,
        searchTags: SEED_PRODUCT_BASE.SEARCH_TAGS,
        detailDescription: SEED_PRODUCT_BASE.DETAIL_DESCRIPTION,
        productNumber,
        productNoticeFoodType: SEED_PRODUCT_BASE.PRODUCT_NOTICE.FOOD_TYPE,
        productNoticeProducer: SEED_PRODUCT_BASE.PRODUCT_NOTICE.PRODUCER,
        productNoticeOrigin: SEED_PRODUCT_BASE.PRODUCT_NOTICE.ORIGIN,
        productNoticeAddress: SEED_PRODUCT_BASE.PRODUCT_NOTICE.ADDRESS,
        productNoticeManufactureDate: SEED_PRODUCT_BASE.PRODUCT_NOTICE.MANUFACTURE_DATE,
        productNoticeExpirationDate: SEED_PRODUCT_BASE.PRODUCT_NOTICE.EXPIRATION_DATE,
        productNoticePackageCapacity: SEED_PRODUCT_BASE.PRODUCT_NOTICE.PACKAGE_CAPACITY,
        productNoticePackageQuantity: SEED_PRODUCT_BASE.PRODUCT_NOTICE.PACKAGE_QUANTITY,
        productNoticeIngredients: SEED_PRODUCT_BASE.PRODUCT_NOTICE.INGREDIENTS,
        productNoticeCalories: SEED_PRODUCT_BASE.PRODUCT_NOTICE.CALORIES,
        productNoticeSafetyNotice: SEED_PRODUCT_BASE.PRODUCT_NOTICE.SAFETY_NOTICE,
        productNoticeGmoNotice: SEED_PRODUCT_BASE.PRODUCT_NOTICE.GMO_NOTICE,
        productNoticeImportNotice: SEED_PRODUCT_BASE.PRODUCT_NOTICE.IMPORT_NOTICE,
        productNoticeCustomerService: SEED_PRODUCT_BASE.PRODUCT_NOTICE.CUSTOMER_SERVICE,
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      },
    });
    products.push(created);
  }

  return products;
}

/**
 * 상품 리뷰를 생성합니다.
 *
 * 동작 방식:
 * - 전체 리뷰 개수 확인
 * - 1개 이상 존재하면: 업데이트하지 않고 0 반환 (그대로 유지)
 * - 하나도 없을 때만: 리뷰 생성
 *
 * 특징:
 * - 첫 번째 스토어의 상품 70개 모두에 각각 3~5개의 리뷰 생성
 * - 두 번째 스토어의 상품 30개 모두에 각각 3~5개의 리뷰 생성
 * - rating은 0.5 ~ 5.0 사이의 랜덤 값 (0.5 단위)
 * - createdAt은 2024-01-01부터 현재까지의 랜덤 시간
 * - 같은 사용자가 여러 리뷰를 작성할 수 있음
 */
async function seedProductReviews(
  consumers: Awaited<ReturnType<typeof upsertSeedUsers>>["consumers"],
  products: Awaited<ReturnType<typeof upsertProducts>>,
  stores: Awaited<ReturnType<typeof upsertStores>>,
) {
  // 상품이 없으면 리뷰 생성 불가
  if (!products || products.length === 0) {
    console.warn("⚠️ 상품이 없어 리뷰를 생성할 수 없습니다.");
    return 0;
  }

  // 구매자가 없으면 리뷰 생성 불가
  if (!consumers || consumers.length === 0) {
    console.warn("⚠️ 구매자가 없어 리뷰를 생성할 수 없습니다.");
    return 0;
  }

  // 스토어가 없으면 리뷰 생성 불가
  if (!stores || stores.length < 2) {
    console.warn("⚠️ 스토어가 없어 리뷰를 생성할 수 없습니다.");
    return 0;
  }

  const [store1] = stores;
  const reviews = [];

  /**
   * 첫 번째 스토어와 두 번째 스토어의 모든 상품에 대해 리뷰 생성
   * - 각 상품의 리뷰 개수를 확인
   * - 리뷰가 1개 이상이면 건너뛰기
   * - 리뷰가 0개인 상품에만 3~5개의 랜덤 리뷰 생성
   * - 첫 번째 스토어 상품: 첫 번째 스토어 이미지 사용
   * - 두 번째 스토어 상품: 두 번째 스토어 이미지 사용
   */
  for (const product of products) {
    // 해당 상품의 리뷰 개수 확인
    const productReviewCount = await prisma.productReview.count({
      where: { productId: product.id, deletedAt: null },
    });

    // 리뷰가 1개 이상이면 건너뛰기
    if (productReviewCount >= 1) {
      continue;
    }

    // 첫 번째 스토어인지 두 번째 스토어인지 판단 (storeId 기준)
    const isFirstStore = product.storeId === store1.id;
    const reviewImage = isFirstStore
      ? SEED_PRODUCT_IMAGES.FIRST_STORE_REVIEW_IMAGE
      : SEED_PRODUCT_IMAGES.SECOND_STORE_REVIEW_IMAGE;

    // 리뷰가 없는 상품에 3~5개의 랜덤 리뷰 생성
    const reviewCount = Math.floor(Math.random() * 3) + 3; // 3~5개
    for (let j = 0; j < reviewCount; j++) {
      const consumerIndex = Math.floor(Math.random() * consumers.length);
      const rating = Math.round((Math.random() * 4.5 + 0.5) * 10) / 10;
      const content = SEED_REVIEW_CONTENTS[Math.floor(Math.random() * SEED_REVIEW_CONTENTS.length)];
      const imageCount = Math.floor(Math.random() * 3); // 0~2개의 이미지
      const imageUrls = Array.from({ length: imageCount }, () => reviewImage);

      reviews.push(
        prisma.productReview.create({
          data: {
            productId: product.id,
            consumerId: consumers[consumerIndex].id,
            rating,
            content,
            imageUrls,
            createdAt: new Date(
              new Date("2024-01-01T00:00:00Z").getTime() +
                Math.random() * (new Date().getTime() - new Date("2024-01-01T00:00:00Z").getTime()),
            ),
          },
        }),
      );
    }
  }

  const createdReviews = await Promise.all(reviews);
  return createdReviews.length;
}

/**
 * 스토어 피드를 생성합니다.
 *
 * 동작 방식:
 * - 데이터베이스에 존재하는 모든 스토어를 조회
 * - 각 스토어별로 피드 개수 확인
 * - 피드가 1개 이상이면 건너뛰기
 * - 피드가 0개인 스토어에만 피드 생성
 *
 * 특징:
 * - 모든 스토어에 대해 피드가 없는 경우 피드를 생성
 * - 첫 번째로 발견된 피드가 없는 스토어에 2개의 피드 생성
 * - 두 번째로 발견된 피드가 없는 스토어에 1개의 피드 생성
 * - 세 번째 이후 스토어에도 피드가 없으면 FEED3를 재사용하여 생성
 * - 각 스토어별로 독립적으로 확인하여 생성
 */
async function seedStoreFeeds() {
  // 데이터베이스에 존재하는 모든 스토어 조회
  const allStores = await prisma.store.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (!allStores || allStores.length === 0) {
    console.warn("⚠️ 스토어가 없어 피드를 생성할 수 없습니다.");
    return 0;
  }

  const feeds = [];
  let isFirstStoreWithNoFeeds = true; // 첫 번째 피드가 없는 스토어인지 여부

  // 모든 스토어에 대해 피드 확인 및 생성
  for (const store of allStores) {
    const storeFeedCount = await prisma.storeFeed.count({
      where: { storeId: store.id },
    });

    // 피드가 0개인 경우에만 생성
    if (storeFeedCount === 0) {
      if (isFirstStoreWithNoFeeds) {
        // 첫 번째 피드가 없는 스토어에 2개의 피드 생성
        feeds.push(
          prisma.storeFeed.create({
            data: {
              storeId: store.id,
              title: SEED_STORE_FEEDS.FEED1.TITLE,
              content: SEED_STORE_FEEDS.FEED1.CONTENT,
              createdAt: SEED_STORE_FEEDS.FEED1.CREATED_AT,
            },
          }),
        );
        feeds.push(
          prisma.storeFeed.create({
            data: {
              storeId: store.id,
              title: SEED_STORE_FEEDS.FEED2.TITLE,
              content: SEED_STORE_FEEDS.FEED2.CONTENT,
              createdAt: SEED_STORE_FEEDS.FEED2.CREATED_AT,
            },
          }),
        );
        isFirstStoreWithNoFeeds = false; // 첫 번째 스토어 처리 완료
      } else {
        // 두 번째 이후 피드가 없는 스토어에 1개의 피드 생성
        feeds.push(
          prisma.storeFeed.create({
            data: {
              storeId: store.id,
              title: SEED_STORE_FEEDS.FEED3.TITLE,
              content: SEED_STORE_FEEDS.FEED3.CONTENT,
              createdAt: SEED_STORE_FEEDS.FEED3.CREATED_AT,
            },
          }),
        );
      }
    }
  }

  const createdFeeds = await Promise.all(feeds);
  return createdFeeds.length;
}

/**
 * 메인 시드 함수
 *
 * 중요!!: ** 스키마가 수정되더라도 ** 기존 데이터 유지되면서 새로운 데이터가 추가/수정되는 방식으로 해야, 실제 배포환경에서 오류가 발생하지 않습니다.
 *
 * 실행 순서:
 * 1. 계정 생성 (구매자 1명 + 판매자 1명 + 관리자 1명, 기존 행은 업데이트하지 않음)
 * 2. 스토어 생성 (2개, 기존 스토어는 업데이트하지 않음)
 * 3. 상품 생성 (100개, 상품이 하나도 없을 때만 생성)
 * 4. 상품 리뷰 생성 (리뷰가 하나도 없을 때만 생성)
 * 5. 스토어 피드 생성 (피드가 하나도 없을 때만 생성)
 *
 * 특징:
 * - idempotent: 여러 번 실행해도 안전함
 * - 구매자·판매자는 phone으로 존재하면 업데이트하지 않음 (보존)
 * - 스토어는 name 기준으로 존재하면 업데이트하지 않음 (보존)
 * - 상품은 1개 이상 존재하면 업데이트하지 않음, 하나도 없을 때만 생성
 * - 리뷰는 1개 이상 존재하면 업데이트하지 않음, 하나도 없을 때만 생성
 * - 피드는 1개 이상 존재하면 업데이트하지 않음, 하나도 없을 때만 생성
 */
async function main() {
  const { seller, consumers } = await upsertSeedUsers();
  await upsertSeedAdmin();
  const stores = await upsertStores(seller);
  const products = await upsertProducts(stores);
  const reviewCreatedCount = await seedProductReviews(consumers, products, stores);
  const feedCreatedCount = await seedStoreFeeds();

  console.log(
    `✅ Seed seller + consumer + admin created/retrieved: ${2 + consumers.length} (seller 1 + consumer 1 + admin 1)`,
  );
  console.log(`✅ Stores created/retrieved: ${stores.length}`);
  console.log(`✅ Products created/retrieved: ${products.length}`);
  console.log(`✅ Product reviews created (if none existed): ${reviewCreatedCount}`);
  console.log(`✅ Store feeds created (if none existed): ${feedCreatedCount}`);
  console.log("🎉 Database seeding (idempotent) completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
