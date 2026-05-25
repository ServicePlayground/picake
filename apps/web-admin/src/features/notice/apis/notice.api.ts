import { adminClient } from "@/apps/web-admin/common/config/axios.config";
import type {
  CreateNoticeRequestDto,
  NoticeItemResponseDto,
  NoticeListResponseDto,
  UpdateNoticeRequestDto,
} from "@/apps/web-admin/features/notice/types/notice.dto";

export const noticeApi = {
  // 공지사항 목록 조회
  getList: async (): Promise<NoticeListResponseDto> => {
    const response = await adminClient.get("/notices");
    return response.data.data;
  },

  // 공지사항 등록
  create: async (dto: CreateNoticeRequestDto): Promise<NoticeItemResponseDto> => {
    const response = await adminClient.post("/notices", dto);
    return response.data.data;
  },

  // 공지사항 수정
  update: async (id: string, dto: UpdateNoticeRequestDto): Promise<NoticeItemResponseDto> => {
    const response = await adminClient.patch(`/notices/${id}`, dto);
    return response.data.data;
  },

  // 공지사항 삭제
  remove: async (id: string): Promise<void> => {
    await adminClient.delete(`/notices/${id}`);
  },
};
