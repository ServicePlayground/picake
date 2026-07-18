import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";

/**
 * 검색어 → 장소명·주소·연락처·카테고리 부분 일치
 */
export function buildStoreEntryRequestSearchWhere(
  search?: string,
): Prisma.StoreEntryRequestWhereInput {
  const keyword = search?.trim();
  if (!keyword) {
    return {};
  }

  return {
    OR: [
      { placeName: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
      { address: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
      { roadAddress: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
      { phone: { contains: keyword } },
      { categoryName: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
    ],
  };
}
