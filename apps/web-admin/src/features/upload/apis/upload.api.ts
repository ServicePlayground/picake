import { adminClient } from "@/apps/web-admin/common/config/axios.config";
import type { UploadFileResponseDto } from "@/apps/web-admin/features/upload/types/upload.dto";

export const uploadApi = {
  // 파일 업로드
  uploadFile: async (file: File): Promise<UploadFileResponseDto> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await adminClient.post("/uploads/file", formData, {
      timeout: 120_000,
    });
    return response.data.data;
  },
};
