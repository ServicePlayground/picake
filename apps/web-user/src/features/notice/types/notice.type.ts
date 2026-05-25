/**
 * 공지사항 API 타입 (백엔드 consumer notice DTO와 정합)
 */
export interface Notice {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 공지사항 목록 응답 */
export interface NoticeListResponse {
  data: Notice[];
}
