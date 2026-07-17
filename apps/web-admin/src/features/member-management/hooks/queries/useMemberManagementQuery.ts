import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-admin/common/hooks/useQueryErrorAlert";
import { memberManagementApi } from "@/apps/web-admin/features/member-management/apis/member-management.api";
import { memberManagementQueryKeys } from "@/apps/web-admin/features/member-management/constants/memberManagementQueryKeys.constant";
import type {
  MemberConsumerListQueryDto,
  MemberConsumerListResponseDto,
  MemberSellerListQueryDto,
  MemberSellerListResponseDto,
} from "@/apps/web-admin/features/member-management/types/member-management.dto";

// 구매자 목록 조회
export function useMemberConsumerList(params: MemberConsumerListQueryDto) {
  const query = useQuery<MemberConsumerListResponseDto>({
    queryKey: memberManagementQueryKeys.consumerList(params),
    queryFn: () => memberManagementApi.getConsumers(params),
    placeholderData: keepPreviousData,
  });

  useQueryErrorAlert(query);

  return query;
}

// 판매자 목록 조회
export function useMemberSellerList(params: MemberSellerListQueryDto) {
  const query = useQuery<MemberSellerListResponseDto>({
    queryKey: memberManagementQueryKeys.sellerList(params),
    queryFn: () => memberManagementApi.getSellers(params),
    placeholderData: keepPreviousData,
  });

  useQueryErrorAlert(query);

  return query;
}
