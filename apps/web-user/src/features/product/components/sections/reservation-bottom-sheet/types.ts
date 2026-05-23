import {
  CakeFlavorOption,
  CakeSizeOption,
  ProductType,
  ImageUploadEnabled,
} from "@/apps/web-user/features/product/types/product.type";
import type {
  StoreBusinessCalendar,
  RefundCancellationPolicy,
} from "@/apps/web-user/features/store/types/store.type";

export interface OrderItem {
  size: string;
  sizePrice: number;
  flavor: string;
  flavorPrice: number;
  cream: string;
  letteringMessage: string;
  requestMessage: string;
  quantity: number;
  imageFiles: File[]; // 업로드할 이미지 File 목록
  imageUrls: string[]; // 미리보기용 로컬 URL 목록 (blob URL)
}

export interface ReservationBottomSheetProps {
  isOpen: boolean;
  productId: string;
  price: number;
  cakeTitle: string;
  cakeImageUrl: string;
  cakeImages?: string[];
  cakeSizeOptions?: CakeSizeOption[];
  cakeFlavorOptions?: CakeFlavorOption[];
  cakeSize?: string;
  productType: ProductType;
  productNoticeProducer?: string;
  productNoticeAddress?: string;
  storeName: string;
  // 픽업장소
  pickupAddress: string;
  pickupRoadAddress: string;
  pickupDetailAddress?: string;
  pickupZonecode: string;
  pickupLatitude: number;
  pickupLongitude: number;
  imageUploadEnabled: ImageUploadEnabled;
  letteringMaxLength: number;
  /** 스토어 영업 캘린더 — 캘린더에서 휴무일 disable + 영업 시간만 노출 */
  businessCalendar?: StoreBusinessCalendar;
  /** 판매자 환불·취소 규정 — 주문확인 단계 안내 박스에 노출 */
  refundCancellationPolicy?: RefundCancellationPolicy;
  onClose: () => void;
}

export type ViewType = "options" | "calendar" | "confirm";
