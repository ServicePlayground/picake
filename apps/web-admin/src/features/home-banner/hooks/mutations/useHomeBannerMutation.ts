import { useMutation, useQueryClient } from "@tanstack/react-query";
import { homeBannerApi } from "@/apps/web-admin/features/home-banner/apis/home-banner.api";
import { homeBannerQueryKeys } from "@/apps/web-admin/features/home-banner/constants/homeBannerQueryKeys.constant";
import { useAlertStore } from "@/apps/web-admin/common/store/alert.store";
import getApiMessage from "@/apps/web-admin/common/utils/getApiMessage";
import type {
  CreateHomeBannerRequestDto,
  HomeBannerItemResponseDto,
  ReorderHomeBannerRequestDto,
  UpdateHomeBannerRequestDto,
} from "@/apps/web-admin/features/home-banner/types/home-banner.dto";

// 홈 배너 등록 뮤테이션
export function useCreateHomeBanner() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<HomeBannerItemResponseDto, Error, CreateHomeBannerRequestDto>({
    mutationFn: (dto) => homeBannerApi.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: homeBannerQueryKeys.all });
      addAlert({ severity: "success", message: "배너가 등록되었습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

// 홈 배너 수정 뮤테이션
export function useUpdateHomeBanner() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation<
    HomeBannerItemResponseDto,
    Error,
    { id: string; dto: UpdateHomeBannerRequestDto }
  >({
    mutationFn: ({ id, dto }) => homeBannerApi.update(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: homeBannerQueryKeys.all });
      addAlert({ severity: "success", message: "저장되었습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

// 홈 배너 삭제 뮤테이션
export function useDeleteHomeBanner() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: (id: string) => homeBannerApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: homeBannerQueryKeys.all });
      addAlert({ severity: "success", message: "배너가 삭제되었습니다." });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}

// 홈 배너 순서 변경 뮤테이션
export function useReorderHomeBanner() {
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  return useMutation({
    mutationFn: (dto: ReorderHomeBannerRequestDto) => homeBannerApi.reorder(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: homeBannerQueryKeys.all });
    },
    onError: (error) => {
      addAlert({ severity: "error", message: getApiMessage.error(error) });
    },
  });
}
