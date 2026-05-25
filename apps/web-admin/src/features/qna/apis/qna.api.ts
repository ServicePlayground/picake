import { adminClient } from "@/apps/web-admin/common/config/axios.config";
import type {
  CreateQnaRequestDto,
  QnaItemResponseDto,
  QnaListResponseDto,
  UpdateQnaRequestDto,
} from "@/apps/web-admin/features/qna/types/qna.dto";

export const qnaApi = {
  // Q&A 목록 조회
  getList: async (): Promise<QnaListResponseDto> => {
    const response = await adminClient.get("/qnas");
    return response.data.data;
  },

  // Q&A 등록
  create: async (dto: CreateQnaRequestDto): Promise<QnaItemResponseDto> => {
    const response = await adminClient.post("/qnas", dto);
    return response.data.data;
  },

  // Q&A 수정
  update: async (id: string, dto: UpdateQnaRequestDto): Promise<QnaItemResponseDto> => {
    const response = await adminClient.patch(`/qnas/${id}`, dto);
    return response.data.data;
  },

  // Q&A 삭제
  remove: async (id: string): Promise<void> => {
    await adminClient.delete(`/qnas/${id}`);
  },
};
