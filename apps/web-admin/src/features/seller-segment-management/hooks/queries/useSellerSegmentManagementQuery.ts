import { useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-admin/common/hooks/useQueryErrorAlert";
import { sellerSegmentManagementApi } from "@/apps/web-admin/features/seller-segment-management/apis/seller-segment-management.api";
import { sellerSegmentManagementQueryKeys } from "@/apps/web-admin/features/seller-segment-management/constants/sellerSegmentManagementQueryKeys.constant";
import type { SellerSegmentListResponseDto } from "@/apps/web-admin/features/seller-segment-management/types/seller-segment-management.dto";

// 세그먼트 목록 조회
export function useSellerSegmentList() {
  const query = useQuery<SellerSegmentListResponseDto>({
    queryKey: sellerSegmentManagementQueryKeys.segments(),
    queryFn: () => sellerSegmentManagementApi.getSegments(),
  });

  useQueryErrorAlert(query);

  return query;
}
