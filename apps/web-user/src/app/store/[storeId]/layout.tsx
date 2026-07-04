import type { Metadata } from "next";
import { fetchStoreForMetadata } from "@/apps/web-user/common/apis/metadata.api";
import {
  buildNotFoundMetadata,
  buildShareMetadata,
  formatKrwPrice,
  toMetaDescription,
} from "@/apps/web-user/common/utils/metadata.util";

interface StoreDetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{ storeId: string }>;
}

export async function generateMetadata({ params }: StoreDetailLayoutProps): Promise<Metadata> {
  const { storeId } = await params;
  const store = await fetchStoreForMetadata(storeId);

  if (!store) {
    return buildNotFoundMetadata("스토어를 찾을 수 없어요");
  }

  const priceHint =
    store.minProductPrice != null ? ` · ${formatKrwPrice(store.minProductPrice)}~` : "";
  const location = store.roadAddress || store.address;
  const description = toMetaDescription(
    store.description,
    `${location}${priceHint} · Picake에서 케이크 예약`,
  );

  const imageUrl =
    store.logoImageUrl ??
    store.productRepresentativeImages[0]?.imageUrl ??
    null;

  return buildShareMetadata({
    title: store.name,
    description,
    path: `/store/${storeId}`,
    imageUrl,
  });
}

export default function StoreDetailLayout({ children }: StoreDetailLayoutProps) {
  return children;
}
