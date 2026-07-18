import type {
  MemberConsumerListQueryDto,
  MemberSellerListQueryDto,
} from "@/apps/web-admin/features/member-management/types/member-management.dto";

/**
 * 회원 관리 관련 쿼리 키 상수
 */
export const memberManagementQueryKeys = {
  all: ["member-management"] as const,
  consumers: () => [...memberManagementQueryKeys.all, "consumers"] as const,
  consumerList: (params: MemberConsumerListQueryDto) =>
    [...memberManagementQueryKeys.consumers(), params] as const,
  sellers: () => [...memberManagementQueryKeys.all, "sellers"] as const,
  sellerList: (params: MemberSellerListQueryDto) =>
    [...memberManagementQueryKeys.sellers(), params] as const,
} as const;
