import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-admin/common/hooks/useQueryErrorAlert";
import { storeEntryRequestManagementApi } from "@/apps/web-admin/features/store-entry-request-management/apis/store-entry-request-management.api";
import { storeEntryRequestManagementQueryKeys } from "@/apps/web-admin/features/store-entry-request-management/constants/storeEntryRequestManagementQueryKeys.constant";
import type {
  StoreEntryRequestItemResponseDto,
  StoreEntryRequestListQueryDto,
  StoreEntryRequestListResponseDto,
} from "@/apps/web-admin/features/store-entry-request-management/types/store-entry-request-management.dto";

// 입점 요청 목록 조회
export function useStoreEntryRequestList(params: StoreEntryRequestListQueryDto) {
  const query = useQuery<StoreEntryRequestListResponseDto>({
    queryKey: storeEntryRequestManagementQueryKeys.requestList(params),
    queryFn: () => storeEntryRequestManagementApi.getRequests(params),
    placeholderData: keepPreviousData,
  });

  useQueryErrorAlert(query);

  return query;
}

// 입점 요청 상세 조회
export function useStoreEntryRequestDetail(requestId: string | null) {
  const query = useQuery<StoreEntryRequestItemResponseDto>({
    queryKey: storeEntryRequestManagementQueryKeys.requestDetail(requestId ?? ""),
    queryFn: () => storeEntryRequestManagementApi.getRequest(requestId!),
    enabled: Boolean(requestId),
  });

  useQueryErrorAlert(query);

  return query;
}
