import type {
  CreateProductRequestDto,
  GetSellerProductsRequestDto,
} from "@/apps/web-seller/features/product/types/product.dto";

/** UI 폼 상태 (CreateProductRequestDto에서 storeId 제외, 폼에서 채움) */
export type ProductForm = Omit<
  CreateProductRequestDto,
  "storeId" | "originalPrice" | "salePrice" | "letteringMaxLength"
> & {
  originalPrice?: number;
  salePrice?: number;
  letteringMaxLength?: number;
};

/** 쿼리 키/옵션용 (page 제외, 클라이언트 전용) */
export type GetSellerProductsQueryParams = Omit<GetSellerProductsRequestDto, "page">;
