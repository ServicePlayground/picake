import { OrderStatus } from "@apps/backend/infra/database/prisma/generated/client";
import {
  ADMIN_STATISTICS_GMV_ORDER_STATUSES,
  ADMIN_STATISTICS_RECENT_DAYS_LONG,
  ADMIN_STATISTICS_RECENT_DAYS_SHORT,
} from "@apps/backend/modules/statistics/admin/constants/admin-statistics.constants";
import { SELLER_ORDER_STATISTICS_TOP_PRODUCTS_LIMIT } from "@apps/backend/modules/statistics/seller/constants/seller-order-statistics.constants";

/**
 * 스토어 관리(관리자) 상수
 */
export const STORE_MANAGEMENT_ERROR_MESSAGES = {
  STORE_NOT_FOUND: "해당 스토어를 찾을 수 없습니다.",
} as const;

/** GMV·완료 주문 집계 상태 (관리자/판매자 통계와 동일: 픽업 완료) */
export const STORE_MANAGEMENT_GMV_ORDER_STATUSES = ADMIN_STATISTICS_GMV_ORDER_STATUSES;

/** 상세 통계의 최근 구간(오늘 포함) */
export const STORE_MANAGEMENT_RECENT_DAYS_SHORT = ADMIN_STATISTICS_RECENT_DAYS_SHORT;
export const STORE_MANAGEMENT_RECENT_DAYS_LONG = ADMIN_STATISTICS_RECENT_DAYS_LONG;

/** 매출 상위 상품 노출 개수 */
export const STORE_MANAGEMENT_TOP_PRODUCTS_LIMIT = SELLER_ORDER_STATISTICS_TOP_PRODUCTS_LIMIT;

/** 주문 상태별 현황 정렬 순서 */
export const STORE_MANAGEMENT_ORDER_STATUS_ORDER: OrderStatus[] = [
  OrderStatus.RESERVATION_REQUESTED,
  OrderStatus.PAYMENT_PENDING,
  OrderStatus.PAYMENT_COMPLETED,
  OrderStatus.CONFIRMED,
  OrderStatus.PICKUP_PENDING,
  OrderStatus.PICKUP_COMPLETED,
  OrderStatus.CANCEL_COMPLETED,
  OrderStatus.CANCEL_REFUND_PENDING,
  OrderStatus.CANCEL_REFUND_COMPLETED,
  OrderStatus.NO_SHOW,
];

/** 목록 응답에 노출하는 Store 필드 */
export const STORE_MANAGEMENT_LIST_SELECT = {
  id: true,
  name: true,
  logoImageUrl: true,
  phoneNumber: true,
  address: true,
  roadAddress: true,
  detailAddress: true,
  businessNo: true,
  businessName: true,
  representativeName: true,
  likeCount: true,
  createdAt: true,
  updatedAt: true,
  seller: {
    select: {
      id: true,
      phone: true,
      name: true,
      nickname: true,
      isActive: true,
      withdrawnAt: true,
      sellerVerificationStatus: true,
    },
  },
  _count: {
    select: {
      products: true,
      orders: true,
    },
  },
} as const;

/** 상세 응답에 노출하는 Store 필드 */
export const STORE_MANAGEMENT_DETAIL_SELECT = {
  id: true,
  name: true,
  logoImageUrl: true,
  description: true,
  phoneNumber: true,
  address: true,
  roadAddress: true,
  detailAddress: true,
  zonecode: true,
  latitude: true,
  longitude: true,
  businessNo: true,
  representativeName: true,
  openingDate: true,
  businessName: true,
  businessSector: true,
  businessType: true,
  permissionManagementNumber: true,
  bankAccountNumber: true,
  bankName: true,
  accountHolderName: true,
  kakaoChannelId: true,
  instagramId: true,
  likeCount: true,
  createdAt: true,
  updatedAt: true,
  seller: {
    select: {
      id: true,
      phone: true,
      name: true,
      nickname: true,
      isActive: true,
      withdrawnAt: true,
      sellerVerificationStatus: true,
      createdAt: true,
    },
  },
  _count: {
    select: {
      products: true,
      orders: true,
      feeds: true,
    },
  },
} as const;
