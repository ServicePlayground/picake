/**
 * 공통 API 응답 타입
 * - Dto: API 요청/응답 구조
 * - 목록 응답: { data: T[], meta: PaginationMetaDto }
 */

/** 페이지네이션 메타 (백엔드 PaginationMetaResponseDto) */
export interface PaginationMetaDto {
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** 메시지 응답 (공통) */
export interface MessageResponseDto {
  message: string;
  /** 인증번호 입력 만료 시각 (ISO 8601) — `POST .../send-verification-code` 응답에 포함 */
  expiresAt?: string;
}

/** 사용 가능 여부 응답 (중복 체크 등) */
export interface AvailableResponseDto {
  available: boolean;
}

/** 목록 응답 공통 래퍼 */
export interface ListResponseDto<TItem> {
  data: TItem[];
  meta: PaginationMetaDto;
}
