import type { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/apps/web-user/common/constants/site.constants";

/** 색인 대상 공개 정적 페이지. 상품·스토어 URL은 generateMetadata로 개별 노출됩니다. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_BASE_URL,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_BASE_URL}/search`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_BASE_URL}/map`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
