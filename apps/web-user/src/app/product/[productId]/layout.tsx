import type { Metadata } from "next";
import { fetchProductForMetadata } from "@/apps/web-user/common/apis/metadata.api";
import {
  buildNotFoundMetadata,
  buildShareMetadata,
  formatKrwPrice,
  toMetaDescription,
} from "@/apps/web-user/common/utils/metadata.util";

interface ProductDetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: ProductDetailLayoutProps): Promise<Metadata> {
  const { productId } = await params;
  const product = await fetchProductForMetadata(productId);

  if (!product) {
    return buildNotFoundMetadata("상품을 찾을 수 없어요");
  }

  const pickupLocation = product.pickupRoadAddress || product.pickupAddress;
  const description = toMetaDescription(
    product.detailDescription,
    `${product.storeName} · ${formatKrwPrice(product.salePrice)} · ${pickupLocation} 픽업 가능`,
  );

  return buildShareMetadata({
    title: product.name,
    description,
    path: `/product/${productId}`,
    imageUrl: product.images[0] ?? product.storeLogoImageUrl,
  });
}

export default function ProductDetailLayout({ children }: ProductDetailLayoutProps) {
  return children;
}
