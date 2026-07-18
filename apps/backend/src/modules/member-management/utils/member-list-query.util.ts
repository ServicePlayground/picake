import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import type { MemberStatusFilter } from "@apps/backend/modules/member-management/constants/member-management.constants";

/**
 * 회원 상태 필터 → where 조건 (Consumer·Seller 공통 컬럼만 사용)
 * - ACTIVE: 활성이면서 미탈퇴
 * - INACTIVE: 비활성이면서 미탈퇴
 * - WITHDRAWN: 탈퇴 (`withdrawn_at` 존재)
 */
export function buildMemberStatusWhere(status?: MemberStatusFilter) {
  switch (status) {
    case "ACTIVE":
      return { isActive: true, withdrawnAt: null } as const;
    case "INACTIVE":
      return { isActive: false, withdrawnAt: null } as const;
    case "WITHDRAWN":
      return { withdrawnAt: { not: null } } as const;
    default:
      return {} as const;
  }
}

/**
 * 검색어 → 이름·닉네임·휴대폰 부분 일치 OR 조건 (Consumer·Seller 공통 컬럼만 사용)
 */
export function buildMemberSearchWhere(search?: string) {
  const keyword = search?.trim();
  if (!keyword) {
    return {};
  }
  return {
    OR: [
      { name: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
      { nickname: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
      { phone: { contains: keyword } },
    ],
  };
}
