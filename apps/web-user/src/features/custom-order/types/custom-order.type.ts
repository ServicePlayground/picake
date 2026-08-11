export type CustomOrderRequestStatus =
  | "REQUESTED"
  | "QUOTED"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED";

export interface CustomOrderRequest {
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
  store?: { id: string; name: string };
}

/** 맞춤 주문 요청 생성 */
export interface CreateCustomOrderRequest {
  productId: string;
  images?: string[];
  requirementsText: string;
  quantity?: number;
  desiredBudgetMin?: number;
  desiredBudgetMax?: number;
  /** ISO 8601 (날짜+시간 필수) */
  desiredDate: string;
  reservationContactName?: string;
  reservationPhone?: string;
}

export interface CreateCustomOrderResponse {
  id: string;
  roomId: string;
  status: CustomOrderRequestStatus;
}
