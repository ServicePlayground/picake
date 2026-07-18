import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import type { MemberStatusFilter } from "@apps/backend/modules/member-management/constants/member-management.constants";
import { buildMemberStatusWhere } from "@apps/backend/modules/member-management/utils/member-list-query.util";

/**
 * 검색어 → 스토어명·사업자명·사업자번호·연락처·판매자(이름·닉네임·휴대폰) 부분 일치
 */
export function buildStoreSearchWhere(search?: string): Prisma.StoreWhereInput {
  const keyword = search?.trim();
  if (!keyword) {
    return {};
  }

  return {
    OR: [
      { name: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
      { businessName: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
      { businessNo: { contains: keyword } },
      { phoneNumber: { contains: keyword } },
      {
        seller: {
          OR: [
            { name: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
            { nickname: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: keyword } },
          ],
        },
      },
    ],
  };
}

/**
 * 판매자 상태 필터 → Store.seller where 조건
 */
export function buildStoreSellerStatusWhere(
  sellerStatus?: MemberStatusFilter,
): Prisma.StoreWhereInput {
  if (!sellerStatus) {
    return {};
  }
  return { seller: buildMemberStatusWhere(sellerStatus) };
}
