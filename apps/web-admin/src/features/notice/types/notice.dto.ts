/**
 * 공지사항 API 타입 (백엔드 notice DTO와 정합)
 */
export interface NoticeItemResponseDto {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeListResponseDto {
  data: NoticeItemResponseDto[];
}

export interface CreateNoticeRequestDto {
  title: string;
  content: string;
  isPinned?: boolean;
  isActive?: boolean;
}

export interface UpdateNoticeRequestDto {
  title?: string;
  content?: string;
  isPinned?: boolean;
  isActive?: boolean;
}
