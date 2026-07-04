import { fetchConsumerApi } from "@/apps/web-user/common/utils/server-api.util";
import type { Product } from "@/apps/web-user/features/product/types/product.type";
import type { StoreInfo } from "@/apps/web-user/features/store/types/store.type";

/** SEO·OG용 상품 상세 (서버 전용) */
export async function fetchProductForMetadata(productId: string): Promise<Product | null> {
  return fetchConsumerApi<Product>(`/products/${productId}`);
}

/** SEO·OG용 스토어 상세 (서버 전용) */
export async function fetchStoreForMetadata(storeId: string): Promise<StoreInfo | null> {
  return fetchConsumerApi<StoreInfo>(`/store/${storeId}`);
}
