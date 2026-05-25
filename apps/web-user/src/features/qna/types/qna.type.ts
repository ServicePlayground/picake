/**
 * Q&A API 타입 (백엔드 consumer qna DTO와 정합)
 */
export interface QnaItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QnaCategory {
  category: string;
  items: QnaItem[];
}

/** Q&A 카테고리 그룹 목록 응답 */
export interface QnaGroupedListResponse {
  data: QnaCategory[];
}
