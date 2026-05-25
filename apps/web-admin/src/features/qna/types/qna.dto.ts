/**
 * Q&A API 타입 (백엔드 qna DTO와 정합)
 */
export interface QnaItemResponseDto {
  id: string;
  question: string;
  answer: string;
  category: string;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QnaListResponseDto {
  data: QnaItemResponseDto[];
}

export interface CreateQnaRequestDto {
  question: string;
  answer: string;
  category?: string;
  isPinned?: boolean;
  isActive?: boolean;
}

export interface UpdateQnaRequestDto {
  question?: string;
  answer?: string;
  category?: string;
  isPinned?: boolean;
  isActive?: boolean;
}
