import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useQueryErrorAlert } from "@/apps/web-admin/common/hooks/useQueryErrorAlert";
import { storeManagementApi } from "@/apps/web-admin/features/store-management/apis/store-management.api";
import { storeManagementQueryKeys } from "@/apps/web-admin/features/store-management/constants/storeManagementQueryKeys.constant";
import type {
  StoreManagementDetailResponseDto,
  StoreManagementListQueryDto,
  StoreManagementListResponseDto,
} from "@/apps/web-admin/features/store-management/types/store-management.dto";

// 스토어 목록 조회
export function useStoreManagementList(params: StoreManagementListQueryDto) {
  const query = useQuery<StoreManagementListResponseDto>({
    queryKey: storeManagementQueryKeys.storeList(params),
    queryFn: () => storeManagementApi.getStores(params),
    placeholderData: keepPreviousData,
  });

  useQueryErrorAlert(query);

  return query;
}

// 스토어 상세 조회
export function useStoreManagementDetail(storeId: string | null) {
  const query = useQuery<StoreManagementDetailResponseDto>({
    queryKey: storeManagementQueryKeys.storeDetail(storeId ?? ""),
    queryFn: () => storeManagementApi.getStore(storeId!),
    enabled: Boolean(storeId),
  });

  useQueryErrorAlert(query);

  return query;
}
