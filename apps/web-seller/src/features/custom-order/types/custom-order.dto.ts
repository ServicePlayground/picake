export type CustomOrderRequestStatus =
  | "REQUESTED"
  | "QUOTED"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED";

export interface CustomOrderRequestResponseDto {
  id: string;
  productId: string;
  consumerId: string;
  storeId: string;
  roomId: string;
  images: string[];
  requirementsText: string;
  quantity: number;
  desiredBudgetMin: number | null;
  desiredBudgetMax: number | null;
  /** 희망 픽업 일시 (날짜+시간) */
  desiredDate: string;
  reservationContactName: string | null;
  reservationPhone: string | null;
  status: CustomOrderRequestStatus;
  quotedPrice: number | null;
  sellerNote: string | null;
  orderId: string | null;
  createdAt: string;
  product?: { id: string; name: string; images: string[] };
  consumer?: { id: string; nickname: string | null; profileImageUrl: string | null };
}

export interface QuoteCustomOrderRequestDto {
  quotedPrice: number;
  sellerNote?: string;
}
